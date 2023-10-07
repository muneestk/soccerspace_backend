import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs' ;
import userModel from '../Modals/userModel.js';
import nodemailer from 'nodemailer'
import dotenv from "dotenv"
dotenv.config()


//----------SEND MAIL FOR VERIFICATION------------//

const sendMail = async(name,email,id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth:{
                user: process.env.EMAIL,
                pass: process.env.PASS
            }
        })
        const mailOptions = {
            from: 'SOCCER SPACE',
            to: email,
            subject: 'For verification mail',
            html:  ` <html>
                        <body>
                            <h1>Soccer Space Account Verification</h1>
                            <p>Hi ${name},</p>
                            <p>Thank you for signing up with Soccer Space. Please click the button below to verify your account:</p>
                          
                                <img src="https://www.nicepng.com/png/detail/960-9602830_email-verification-email-verify-icon-png.png" alt="Verification Image" width="500" height="300"><br>
                                <div style="text-align: center;">
                                <a href="http://localhost:4200/login/${id}" style="text-decoration: none;">
                                    <button style="background-color: #008CBA; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                                        Verify Account
                                    </button>
                                </a>
                            </div>
                    
                            <p>If you have any questions or need assistance, please contact our support team.</p>
                        </body>
                    </html>
                            `,
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email send-->",info.response);
            }
        })
        
    } catch (error) {
        console.log(error.message);
    }
}


//----------USER REGISTER------------//

export const userRegister = async(req,res,next) =>{

    try{
        const {name,email,password} = req.body ;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const exist = await userModel.findOne({email:email})
         
        if(exist){
            return res.status(400).send({
                message:"Email is already exist"
            })
        }else{
            const user = new userModel({
                name : name ,
                email : email ,
                password : hashedPassword
            })

            const result = await user.save();

            if(result){
                sendMail(result.name,result.email,result._id)
                res.json(result)
            }else{
                res.status(400).send({
                    message:"Can't registered, Something went wrong"
                })
            }
        }
        
    }catch(err){
       next(err)
       console.log(err.message);
    }
}

//----------USER LOGIN------------//

export const userLogin = async(req,res,next) => {

    try {
        
    const {email,password} = req.body

    const userData = await userModel.findOne({email:email})
    if(!userData){
      return res.status(404).send({
        message : "User no found"
      })
    }

    if(userData.is_blocked){
        return res.status(404).send({
          message : "This app has been blocked by  administrator"
        })
      }

    if(!(await bcrypt.compare(password,userData.password))){
        return res.status(404).send({
            message:"Password is not correct"
        })
    }

    if(userData.is_verified){
        const token = jwt.sign({_id:userData._id},process.env.USERSECRETKEY)
        res.json(token)
    }else{
        return res.status(404).send({
            message:"email not verified"
        }) 
    }
    
} catch (error) {
     next(error)
     console.log(error.message);   
}

}


//----------USER VERIFICATION------------//

export const 
Verification = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const userdata = await userModel.findOne({_id:id});
        if(userdata){
            await userModel.updateOne({_id:id},{is_verified:true});
            const token = jwt.sign({_id:userdata._id},process.env.USERSECRETKEY)
            res.json(token)
        }else{
            res.status(400).send({
                message:"something went wrong"
            })
        }
    
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

//----------USER DETAILS------------//

export const userDetails = async(req,res,next) =>{
    try {
      const token = req.headers.authorization?.split(' ')[1] ;
      const claim = jwt.verify(token,process.env.USERSECRETKEY)

      const id = claim._id
      const userDetail = await userModel.findById(id)

      if(userDetail){
        return res.status(200).json(userDetail)
      }else{
        return res.status(400).json({
            message : "something went wrong"
        })
      }
        
    } catch (error) {
        next(err)
        console.log(error.message);
    }
}


//----------USER SAVE------------//

export const userSave = async(req,res,next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] ;
    const claim = jwt.verify(token,process.env.USERSECRETKEY)

    const id = claim._id
    
    const userData = await userModel.updateOne(
        { _id: id },
        { $set: { name: req.body.name } }
      );

     if(userData){
        res.status(200).json(userData)
    }else{
        res.status(400).json({
            message : "something went wrong"
        })
    }
    
  } catch (error) {
    next(error)
    console.log(error.message);
  }
}



