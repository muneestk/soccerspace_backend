import managerModel from "../Modals/managerModel.js";
import tournamentModel from "../Modals/tournamentModel.js";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Randomstring from "randomstring";
import teamModel from "../Modals/teamModel.js";
dotenv.config();

const sendMail = async (name, email, id, purpose, token) => {
  try {
    let otp = "";
    const digits = "0123456789";
    for (let i = 0; i < 4; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    let content;
    if (purpose == "forgot password") {
      content = ` <html>
            <body>
                <h1>Soccer Space Account Forgot Password Verification</h1>
                <p>Hi ${name},</p>
                <p> Please click the button below to change password of your account:</p>
              
                    <img src="https://nordvpn.com/wp-content/uploads/blog-social-nordpass-password-manager-1200x628-1.png" alt="Verification Image" width="500" height="300"><br>
                    <div style="text-align: center;">
                    <a href="http://localhost:4200/manager/forgotpassword/${id}/${token}" style="text-decoration: none;">
                        <button style="background-color: #008CBA; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                            Resubmit  password
                        </button>
                    </a>
                </div>
        
                <p>If you have any questions or need assistance, please contact our support team.</p>
            </body>
        </html> `;
    } else {
      content = ` <html>
            <body>
                <h1>Soccer Space Manager Account Verification</h1>
                <p>Hi ${name},</p>
                <p>Thank you for signing up with Soccer Space. your otp is ${otp}</p>
              
            </body>
        </html>
                `;
    }

    await managerModel.updateOne({ _id: id }, { $set: { otp: otp } });
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

//----------MANAGER REGISTER------------//

export const managerRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const managerExist = await managerModel.findOne({ email: email });

    if (managerExist) {
      return res.status(400).json({
        message: "manager is already exist",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const manager = new managerModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const result = await manager.save();

    if (result) {
      sendMail(result.name, result.email, result._id, "verification", "");
      res.json(result);
    } else {
      res.status(400).send({
        message: "Can't registered, Something went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------MANAGER LOGIN------------//

export const managerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const managerData = await managerModel.findOne({ email: email });

    if (!managerData) {
      return res.status(400).json({
        message: "manager not exist",
      });
    }

    if (managerData.is_blocked) {
      return res.status(400).json({
        message: "This app has been blocked by  administrator",
      });
    }

    if (!(await bcrypt.compare(password, managerData.password))) {
      return res.status(400).json({
        message: "password is not correct",
      });
    }

    if (managerData.is_verified) {
      const token = Jwt.sign(
        { _id: managerData._id },
        process.env.MANAGERSECRETKEY
      );
      res.json(token);
    } else {
      return res.status(400).json({
        message: "you are not verified",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------MANAGER OTP VERIFICATION------------//

export const managerVerification = async (req, res, next) => {
  try {
    const otp = req.body.verification;
    const id = req.query.id;
    const managerData = await managerModel.findOne({ _id: id });
    if (otp == managerData.otp) {
      await managerModel.updateOne({ _id: id }, { is_verified: true, otp: "" });
      const token = Jwt.sign(
        { _id: managerData._id },
        process.env.MANAGERSECRETKEY
      );
      res.json(token);
    } else {
      res.status(400).send({
        message: "Otp is incorrect",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------MANAGER  RESEND OTP ------------//

export const resendOtp = async (req, res, next) => {
  try {
    const { id } = req.query;
    const managerData = await managerModel.findById(id);
    if (managerData) {
      sendMail(
        managerData.name,
        managerData.email,
        managerData._id,
        "verification",
        ""
      );
      return res.json(managerData);
    } else {
      return res.status(400).send({
        message: "try again",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//----------MANAGER PROFILE ------------//

export const managerDetails = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = Jwt.verify(token, process.env.MANAGERSECRETKEY);
    const managerId = claim._id;
    const managerData = await managerModel.findById(managerId);

    if (managerData) {
      res.status(200).json(managerData);
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

//----------MANAGER EDIT ------------//

export const managerEdit = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = Jwt.verify(token, process.env.MANAGERSECRETKEY);
    const managerId = claim._id;

    const managerData = await managerModel.updateOne(
      { _id: managerId },
      { $set: { name: req.body.name } }
    );

    if (managerData) {
      res.status(200).json(managerData);
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

//----------ADD TOURNAMENT ------------//

export const addTournment = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = Jwt.verify(token, process.env.MANAGERSECRETKEY);
    const managerId = claim._id;
    const {
      tournamentName,
      TeamName,
      mobileNo,
      winnersPriceMoney,
      runnersPriceMoney,
      tournamentDate,
      slots,
      players,
      limit,
      location,
      registerFee,
    } = req.body;

    const posterFile = req.files["posterImage"][0];
    const logoFile = req.files["logoImage"][0];

    const tournament = new tournamentModel({
      tournamentName: tournamentName,
      teamName: TeamName,
      location: location,
      mobileNo: mobileNo,
      winnersPriceMoney: winnersPriceMoney,
      runnersPriceMoney: runnersPriceMoney,
      registerFee: registerFee,
      tournamentDate: tournamentDate,
      slots: slots,
      limit: limit,
      players: players,
      logoImage: logoFile.filename,
      posterImage: posterFile.filename,
      managerId: managerId,
    });
    const tournamentData = await tournament.save();

    if (tournamentData) {
      res.status(200).json({
        message:
          "Tournament created successfully. Please wait for admin approval.",
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

//----------MANAGER FORGOT PASSWORD SENT MAIL ------------//

export const forgotMailSentManager = async (req, res, next) => {
  try {
    const { email } = req.body;
    const managerData = await managerModel.findOne({ email: email });
    const token = Randomstring.generate();
    await managerModel.updateOne({ email: email }, { $set: { token: token } });
    if (managerData) {
      sendMail(
        managerData.name,
        managerData.email,
        managerData._id,
        "forgot password",
        token
      );
      setTimeout(async () => {
        await managerModel.updateOne({ email: email }, { $set: { token: "" } });
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

//----------MANAGER FORGOT PASSWORD------------//

export const forgotPasswordManager = async (req, res, next) => {
  try {
    const { password, id, token } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tokenCheck = await managerModel.findOne({ token: token });
    if (!tokenCheck) {
      return res.status(400).json({
        message: "Time expired try again",
      });
    }

    const mangerData = await managerModel.updateOne(
      { _id: id },
      { $set: { password: hashedPassword } }
    );
    if (mangerData) {
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


//----------MANAGER ID FETCHING ------------//

export const registerTeams = async(req,res,next) => {
  try {

    const {id} = req.query
    const teamsData = await teamModel.find({tournamentId:id})
    if(teamsData){
      res.status(200).json(teamsData)
    }else{
      res.status.json({
        message:"something went wrong"
      })
    }
     
  } catch (error) {
    next(error)
    console.log(error.message);
  }
}


//---------- manager GOOGLE SIGNUP REGISTER ------------//

export const googleRegister = async (req, res, next) => {
  try {
    
    const { name, email, id } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(id, salt);
    const exist = await managerModel.findOne({ email: email });

    if (exist) {
      await managerModel.updateOne({ email: email }, { is_google_signup: true });
      const token = Jwt.sign({ _id: exist._id }, process.env.MANAGERSECRETKEY);
      res.json(token);
    } else {
      const manager = new managerModel({
        name: name,
        email: email,
        password: hashedPassword,
        is_google_signup: true,
      });
   
      const g =555
      const result = await manager.save();

      if (result) {
        const token = Jwt.sign({ _id: result._id }, process.env.MANAGERSECRETKEY);
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