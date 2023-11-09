import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userModel from "../Modals/userModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import teamModel from "../Modals/teamModel.js";
import tournamentModel from "../Modals/tournamentModel.js";
import Randomstring from "randomstring";
import cron from "node-cron";
import fixtureModel from "../Modals/fixtureModel.js";

dotenv.config();

//----------SEND MAIL FOR VERIFICATION------------//

const sendMail = async (name, email, id, purpose, token) => {
  try {
    let content;
    if (purpose == "user verification") {
      console.log(token,'in email');
      content = ` <html>
            <body>
                <h1>Soccer Space Account Verification</h1>
                <p>Hi ${name},</p>
                <p>Thank you for signing up with Soccer Space. Please click the button below to verify your account:</p>
              
                    <img src="https://www.nicepng.com/png/detail/960-9602830_email-verification-email-verify-icon-png.png" alt="Verification Image" width="500" height="300"><br>
                    <div style="text-align: center;">
                    <a href="https://soccerspace-frontent-mfub.vercel.app/login/${id}/${token}" style="text-decoration: none;">
                        <button style="background-color: #008CBA; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                            Verify Account
                        </button>
                    </a>
                </div>
        
                <p>If you have any questions or need assistance, please contact our support team.</p>
            </body>
        </html> `;
    } else {
      content = ` <html>
            <body>
                <h1>Soccer Space Account Forgot Password Verification</h1>
                <p>Hi ${name},</p>
                <p> Please click the button below to change password of your account:</p>
              
                    <img src="https://nordvpn.com/wp-content/uploads/blog-social-nordpass-password-manager-1200x628-1.png" alt="Verification Image" width="500" height="300"><br>
                    <div style="text-align: center;">
                    <a href="https://soccerspace-frontent-mfub.vercel.app/${id}/${token}" style="text-decoration: none;">
                        <button style="background-color: #008CBA; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                            Resubmit  password
                        </button>
                    </a>
                </div>
        
                <p>If you have any questions or need assistance, please contact our support team.</p>
            </body>
        </html> `;
    }
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });
    const mailOptions = {
      from: "SOCCER SPACE",
      to: email,
      subject: "For verification mail",
      html: content,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email send-->", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//----------USER REGISTER------------//

export const userRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const exist = await userModel.findOne({ email: email });

    if (exist) {
      return res.status(400).send({
        message: "Email is already exist",
      });
    } else {
      const user = new userModel({
        name: name,
        email: email,
        password: hashedPassword,
      });

      const result = await user.save();

      if (result) {
        const token = Randomstring.generate();
        await userModel.updateOne({ email: email }, { $set: { token: token } });
        sendMail(result.name, result.email, result._id, "user verification",token);
        setTimeout(async () => {
          await userModel.updateOne({ email: email }, { $set: { token: "" } });
        }, 120000);
        res.json(result);
      } else {
        res.status(400).send({
          message: "Can't registered, Something went wrong",
        });
      }
    }
  } catch (err) {
    next(err);
    console.log(err.message);
  }
};

//---------- USER GOOGLE SIGNUP REGISTER ------------//

export const googleRegister = async (req, res, next) => {
  try {
    const { name, email, id } = req.body;
    console.log(req.body);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(id, salt);
    const exist = await userModel.findOne({ email: email });

    if (exist) {
      await userModel.updateOne({ email: email }, { is_google_signup: true });
      const token = jwt.sign({ _id: exist._id }, process.env.USERSECRETKEY);
      res.json(token);
    } else {
      const user = new userModel({
        name: name,
        email: email,
        password: hashedPassword,
        is_google_signup: true,
      });

      const result = await user.save();

      if (result) {
        const token = jwt.sign({ _id: result._id }, process.env.USERSECRETKEY);
        res.json(token);
      } else {
        res.status(400).send({
          message: "Can't registered, Something went wrong",
        });
      }
    }
  } catch (err) {
    next(err);
    console.log(err.message);
  }
};

//----------USER LOGIN------------//

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userData = await userModel.findOne({ email: email });
    if (!userData) {
      return res.status(404).send({
        message: "User no found",
      });
    }

    if (userData.is_blocked) {
      return res.status(404).send({
        message: "This app has been blocked by  administrator",
      });
    }

    if (!(await bcrypt.compare(password, userData.password))) {
      return res.status(404).send({
        message: "Password is not correct",
      });
    }

    if (userData.is_verified) {
      const token = jwt.sign({ _id: userData._id }, process.env.USERSECRETKEY);
      res.json(token);
    } else {
      return res.status(404).send({
        message: "email not verified",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------USER VERIFICATION------------//

export const Verification = async (req, res, next) => {
  try {
    const { token, id } = req.body;
    const tokenCheck = await userModel.findOne({ token: token });

    if (!tokenCheck) {
      return res.status(400).json({
        message: "Time expired try again",
      });
    }

    const userdata = await userModel.findOne({ _id: id });
    if (userdata) {
      await userModel.updateOne({ _id: id }, { is_verified: true });
      const token = jwt.sign({ _id: userdata._id }, process.env.USERSECRETKEY);
      res.json(token);
    } else {
      res.status(400).send({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------USER REVERIFICATION MAIL SENT------------//

export const reverificationMailSent = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userdata = await userModel.findOne({ email: email });

    if (userdata) {
      const token = Randomstring.generate();
      await userModel.updateOne({ email: email }, { $set: { token: token } });
      sendMail(
        userdata.name,
        userdata.email,
        userdata._id,
        "user verification",
        token
      );
      setTimeout(async () => {
        await userModel.updateOne({ email: email }, { $set: { token: "" } });
      }, 120000);
      res.json(userdata);
    } else {
      res.status(400).send({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//---------- USER FORGOT PASSWORD SENT MAIL ------------//

export const forgotMailSent = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userData = await userModel.findOne({ email: email });
    const token = Randomstring.generate();
    await userModel.updateOne({ email: email }, { $set: { token: token } });
    if (userData) {
      sendMail(
        userData.name,
        userData.email,
        userData._id,
        "forgot password",
        token
      );
      setTimeout(async () => {
        await userModel.updateOne({ email: email }, { $set: { token: "" } });
      }, 120000);
      res.status(200).json({
        message: "Check your email",
      });
    } else {
      res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------USER FORGOT PASSWORD------------//

export const forgotPassword = async (req, res, next) => {
  try {
    const { password, id, token } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tokenCheck = await userModel.findOne({ token: token });
    if (!tokenCheck) {
      return res.status(400).json({
        message: "Time expired try again",
      });
    }

    const userData = await userModel.updateOne(
      { _id: id },
      { $set: { password: hashedPassword } }
    );
    if (userData) {
      res.status(200).json({
        message: "password changed succesfully",
      });
    } else {
      res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------USER DETAILS------------//

export const userDetails = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);

    const id = claim._id;
    const userDetail = await userModel.findById(id);

    if (userDetail) {
      return res.status(200).json(userDetail);
    } else {
      return res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(err);
    console.log(error.message);
  }
};

//----------USER SAVE------------//

export const userSave = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);

    const id = claim._id;

    const userData = await userModel.updateOne(
      { _id: id },
      { $set: { name: req.body.name } }
    );

    if (userData) {
      res.status(200).json(userData);
    } else {
      res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------TEAM REGISTER------------//

export const teamRegister = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);
    const id = claim._id;
    const logoFile = req.file.filename;
    const { teamName, managerName, location, phno, phno2, tournamentId } =
      req.body;

    const tournamentData = await tournamentModel.findById(tournamentId);

    if (tournamentData.maxRegLimit > 3) {
      return res.status(400).json({
        message: "Only register maximum 3 teams in this tournament",
      });
    }

    if (tournamentData.limit > tournamentData.Teams.length) {
      return res.status(400).json({
        message: "sorry tournament slot is full",
      });
    }

    const checkTeam = await teamModel.findOne({
      teamName: teamName,
      managerName: managerName,
      tournamentId: tournamentId,
    });
    if (checkTeam) {
      return res.status(400).json({
        message: "This team already Registerd",
      });
    }

    const teamData = new teamModel({
      teamName,
      managerName,
      teamLocation: location,
      mobNo: phno,
      altMobNo: phno2,
      userId: id,
      tournamentId,
      teamLogo: logoFile,
    });

    const saveData = await teamData.save();

    if (saveData) {
      res.status(200).json(saveData);
    } else {
      res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------TEAM REGISTER VERIFY PAYMENT------------//

export const verifyPayment = async (req, res, next) => {
  try {
    const {
      response: { razorpay_payment_id },
      trnmntId,
      teamId,
    } = req.body;

    if (razorpay_payment_id) {
      await Promise.all([
        tournamentModel.updateOne(
          { _id: trnmntId },
          { $push: { Teams: teamId } }
        ),
        tournamentModel.updateOne(
          { _id: trnmntId },
          { $inc: { maxRegLimit: 1 } }
        ),
      ]);

      await teamModel.updateOne(
        { _id: teamId },
        { $set: { paymentStatus: "success" } }
      );
      res.status(200).json({
        message: "success",
      });

      const tournamentData = await tournamentModel.findById(trnmntId);

      if (tournamentData.slots === tournamentData.Teams.length) {
        const matchRound = Math.log2(tournamentData.slots);
        const matches = [];

        for (let i = 0; i < tournamentData.Teams.length; i += 2) {
          const match = {
            team1Id: tournamentData.Teams[i]._id,
            team2Id: tournamentData.Teams[i + 1]._id,
          };
          matches.push(match);
        }

        const updateFixture = new fixtureModel({
          tournamentId: trnmntId,
          managerId: tournamentData.managerId,
          matchRound,
          matches: matches,
        });

        await updateFixture.save();
      }
    } else {
      await teamModel.updateOne(
        { _id: teamId },
        { $set: { paymentStatus: "failed" } }
      );
      res.status(400).json({
        message: "Payment failed",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//-------- MY TOURNAMENTS FETCHING ------//

export const myTournaments = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);
    const id = claim._id;
    await teamModel.deleteMany({ paymentStatus: "pending" });
    const findTeams = await teamModel.find({ userId: id });
    const teamIds = findTeams.map((team) => team._id);
    const findTournaments = await tournamentModel
      .find({ Teams: { $in: teamIds } })
      .populate("Teams")
      .sort({ tournamentDate: 1 });

    if (findTournaments) {
      res.status(200).json(findTournaments);
    } else {
      res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//-------- MY TOURNAMENTS TEAMS FETCHING ------//

export const myTournamentsTeams = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);
    const userId = claim._id;
    const { id } = req.query;

    const tournamentData = await tournamentModel.findById(id);
    const teamIds = tournamentData.Teams.map((team) => team._id);
    const teamsData = await teamModel
      .find({ _id: { $in: teamIds }, userId: userId })
      .populate("tournamentId");

    if (teamsData) {
      res.status(200).json(teamsData);
    } else {
      res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------TOURNAMENT DETAILS------------//

export const tournamentData = async (req, res, next) => {
  try {
    const { limit, currentPage } = req.query;

    const today = new Date();
    const parsedLimit = parseInt(limit, 10);
    const parsedCurrentPage = parseInt(currentPage, 10);

    const skipAmount = (parsedCurrentPage - 1) * parsedLimit;

    const tournamentDetails = await tournamentModel
      .find({ tournamentDate: { $gte: today }, is_approuve: "approved" })
      .skip(skipAmount)
      .limit(parsedLimit);

    if (tournamentDetails) {
      const totalCount = await tournamentModel.countDocuments({
        tournamentDate: { $gte: today },
        is_approuve: "approved",
      });

      const totalPages = Math.ceil(totalCount / parsedLimit);

      return res.status(200).json({
        tournaments: tournamentDetails,
        totalPages: totalPages,
      });
    } else {
      return res.status(400).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------TOURNAMENT SEARCH------------//

export const Searchtournament = async (req, res, next) => {
  try {
    const { search, limit, currentPage } = req.query;
    const today = new Date();

    const skipAmount = (currentPage - 1) * limit;

    const tournamentDetails = await tournamentModel
      .find({
        tournamentDate: { $gte: today },
        is_approuve: "approved",
        tournamentName: { $regex: search, $options: "i" },
      })
      .limit(limit)
      .skip(skipAmount);

    if (tournamentDetails) {
      const totalCount = await tournamentModel.countDocuments({
        tournamentDate: { $gte: today },
        is_approuve: "approved",
        tournamentName: { $regex: search, $options: "i" },
      });

      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({
        tournaments: tournamentDetails,
        totalPages: totalPages,
      });
    } else {
      return res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------TOURNAMENT FILTER------------//

export const filtertournament = async (req, res, next) => {
  try {
    const { value, limit, currentPage, catogory, startValue, endValue } =
      req.query;
    const today = new Date();
    const skipAmount = (currentPage - 1) * limit;

    let query = {
      tournamentDate: { $gte: today },
      is_approuve: "approved",
    };

    if (startValue > 500 || endValue < 5000) {
      query.registerFee = { $gte: startValue, $lte: endValue };
    }

    if (value) {
      query.players = value;
    }

    if (catogory) {
      query.limit = catogory;
    }

    console.log(query);

    const tournamentDetails = await tournamentModel
      .find(query)
      .limit(+limit)
      .skip(+skipAmount);

    if (tournamentDetails) {
      const totalCount = await tournamentModel.countDocuments(query);
      const totalPages = Math.ceil(totalCount / +limit);

      return res.status(200).json({
        tournaments: tournamentDetails,
        totalPages: totalPages,
      });
    } else {
      return res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------AUTOMATICALY UPDATE TOURNAMENT STAUS------------//

const updateStatus = async () => {
  const currentDate = new Date();
  const documents = await tournamentModel.find({});

  documents.forEach(async (document) => {
    if (document.tournamentDate < currentDate) {
      await tournamentModel.updateOne(
        { _id: document._id },
        { $set: { status: "completed" } }
      );
    } else if (
      document.tournamentDate.toISOString().slice(0, 10) ===
      currentDate.toISOString().slice(0, 10)
    ) {
      await tournamentModel.updateOne(
        { _id: document._id },
        { $set: { status: "today" } }
      );
    } else {
      await tournamentModel.updateOne(
        { _id: document._id },
        { $set: { status: "upcoming" } }
      );
    }
  });
  console.log("Status updated successfully");
};

//----------  SENT MULTIPLE MAIL bEFORE TOURNAMENT------------//

const sendMultipleMail = async (tournamentName, location, emails) => {
  try {

      emails.forEach(async element => {
        const user = await userModel.findOne({email:element})
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        });
  
  
        const mailOptions = {
            from: "SOCCER SPACE",
            to:element ,
            subject: "For verification mail",
            html: `<html>
            <body>
            <h1>Soccer Space Tournament Alert</h1>
            <img src="https://t4.ftcdn.net/jpg/04/21/80/35/240_F_421803526_JD00lLJgca3EHwpNUku6PGMS08Do2kZC.jpg" alt="alert Image" width="500" height="300"><br>
            <p>Hi ${user.name},</p>
            <p>Tomorrow is your tournament day. Please attend this tournament at the correct location  ${location} on time for ${tournamentName}.</p>
            <p>If you have any questions or need assistance, please contact our support team.</p>
            </body>
            </html>`,
        };
  
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email send-->", info.response);
            }
        });
      });
  } catch (error) {
      console.log(error.message);
  }
};




//---------- AUTOMATICALY SENT MULTIPLE MAIL BEFORE TOURNAMENT------------//

const multipleMailSentBeforeTournament = async () => {
  const documents = await tournamentModel.find();
  let emails = [];
  let teams = [];
  let tournamentResults = [];

  for (const document of documents) {
      const tournamentBeforeDay = new Date(document.tournamentDate);
      tournamentBeforeDay.setDate(tournamentBeforeDay.getDate() - 1);

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (
          tournamentBeforeDay.getFullYear() === currentDate.getFullYear() &&
          tournamentBeforeDay.getMonth() === currentDate.getMonth() &&
          tournamentBeforeDay.getDate() === currentDate.getDate()
      ) {
       
          teams.push(document.Teams);
          tournamentResults.push({
              tournamentName: document.tournamentName,
              tournamentLocation : document.location
              
          });
      }
  }


  for (const team of teams) {
      let teamEmails = [];
      for (const t of team) {
          try {
              const userData = await teamModel.findById(t).populate('userId');
              teamEmails.push(userData.userId.email);
          } catch (error) {
              console.error(error);
          }
      }
      emails.push(teamEmails);
  }


  if(emails.length > 0 ){
    for (let i=0 ;i<emails.length;i++) {
      sendMultipleMail(tournamentResults[i].tournamentName,tournamentResults[0].tournamentLocation,emails[i])
    }
  }
};




cron.schedule("0 19 * * *", () => {
  updateStatus();
  multipleMailSentBeforeTournament();
});

