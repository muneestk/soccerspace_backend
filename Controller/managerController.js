
import managerModel from "../Modals/managerModel.js"
import bcrypt from "bcryptjs"
import Jwt  from "jsonwebtoken"
import userModel from "../Modals/userModel.js";
import nodemailer from "nodemailer"


const sendMail = async(name,email,id) => {
    try {
        let otp = '';
        const digits = '0123456789';
        for(let i=0;i<4;i++){
            otp+=digits[Math.floor(Math.random()*10)]
        }
        console.log(otp);
        const updateOtp = await managerModel.updateOne({_id:id},{$set:{otp:otp}});
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth:{
                user: 'muneestk5017@gmail.com',
                pass: 'aawppzrvkcxvauby'
            }
        })
        const mailOptions = {
            from: 'SOCCER SPACE',
            to: email,
            subject: 'For verification mail',
            html:  ` <html>
                        <body>
                            <h1>Soccer Space Manager Account Verification</h1>
                            <p>Hi ${name},</p>
                            <p>Thank you for signing up with Soccer Space. your otp is ${otp}</p>
                          
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


//----------MANAGER REGISTER------------//

export const managerRegister = async(req,res,next) =>{
    try {

        const {name,email,password} = req.body
        const managerExist = await managerModel.findOne({email:email})

        if(managerExist){
            return res.status(400).json({
                message:"manager is already exist"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt); 

        const manager = new managerModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const result = await manager.save()

        if(result){
            sendMail(result.name,result.email,result._id)
            res.json(result)
        }else{
            res.status(400).send({
                message:"Can't registered, Something went wrong"
            })
        }
        
    } catch (error) {
        next(error)
        console.log(error.message);
    }
}


//----------MANAGER LOGIN------------//

export const managerLogin = async(req,res,next) => {
    try {

        const { email,password } = req.body ;
        const managerData = await managerModel.findOne({email:email})

        if(!managerData){
            return res.status(400).json({
                message:"manager not exist"
            })
        }

        if(!(await bcrypt.compare(password,managerData.password))){
            return res.status(400).json({
                message:"password is not correct"
            })
        }

        if(managerData.is_verified){
            const token = Jwt.sign({_id:managerData._id},"managerSecret")
            res.json(token)
        }else{
            return res.status(400).json({
                message:"you are not verified"
            })
        }

       
        
    } catch (error) {
       next(error);
       console.log(error.message);
    }
}


//----------MANAGER LOGIN------------//


export const managerVerification = async(req,res,next)=>{
    try {
        const otp = req.body.verification;
        const id = req.query.id;
        const managerData = await managerModel.findOne({_id:id});
        if(otp==managerData.otp){
            await managerModel.updateOne({_id:id},{is_verified:true,otp:''});
            const token = Jwt.sign({_id:managerData._id},"managerSecret")
            res.json(token)
        }else{
            res.status(400).send({
                message:"Otp is incorrect"
            })
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}



