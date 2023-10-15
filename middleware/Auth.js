import jwt from 'jsonwebtoken' ;
import managerModel from '../Modals/managerModel.js';
import dotenv from 'dotenv'
import userModel from '../Modals/userModel.js';

dotenv.config()

export const userAuth = async (req,res,next) => {
    try {

        if (req.headers.authorization){
            let token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token,process.env.USERSECRETKEY)
            const user = await userModel.findOne({ _id : decoded._id})
            if(user){
                
                next()
            }else{
                return res.status(400).json({
                    message : "user not authorised invalid user"
                   })  
            }
        }else{
           return res.status(400).json({
            message : "user not authorised"
           })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}



export const adminAuth = async (req,res,next) => {
    try {
        
        if (req.headers.authorization){
            let token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token,process.env.ADMINSECRETKEY)
            const admin = await userModel.findOne({ _id : decoded._id})
            if(admin){
                next()
            }else{
                return res.status(400).json({
                    message : "admin not authorised invalid admin"
                   })  
            }
        }else{
           return res.status(400).json({
            message : "admin not authorised"
           })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}


export const ManagerAuth = async (req,res,next) => {
    try {
        if (req.headers.authorization){
            let token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token,process.env.MANAGERSECRETKEY)
            const manager = await managerModel.findOne({ _id : decoded._id})
            if(manager){
                next()
            }else{
                return res.status(400).json({
                    message : "manager not authorised invalid manager"
                   })  
            }
        }else{
           return res.status(400).json({
            message : "manager not authorised"
           })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
