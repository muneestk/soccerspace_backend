import userModal from '../Modals/userModel.js'
import managerModal from '../Modals/managerModel.js'
import bcrypt from 'bcryptjs';
import  Jwt  from 'jsonwebtoken';
import dotenv from "dotenv"
import tournamentModel from '../Modals/tournamentModel.js';
dotenv.config()



//----------ADMIN LOGIN------------//

export const adminLogin = async(req,res,next) => {

    try {

        const { email,password } = req.body
        const adminData = await userModal.findOne({email:email})

        if(!adminData){
            res.status(400).json({
                message:"incorrect email"
            })
        }

        if(!(await bcrypt.compare(password,adminData.password) )){
            res.status(400).json({
                message:"password is incorrect"
            })
        }
        
        if(adminData.is_admin){
            const token = Jwt.sign({_id:adminData._id},process.env.ADMINSECRETKEY)  
            res.json(token) 
        }else{
            return res.status(400).json({
                message:"you are not admin"
            })
        }

        
    } catch (error) {
        next(error)
        console.log(error.message);
    }
}


//----------USERLIST FETCHING------------//

    export const userList = async(req,res,next) => {
        try {
            const userList = await userModal.find({ is_admin : false })
            res.json(userList)
        } catch (error) {
            next(error)
          console.log(error.message);  
        }
    }

    
//----------MANAGER LIST FETCHING------------//

export const managerList = async(req,res,next) => {
    try {
        const manageList = await managerModal.find()
        res.json(manageList)
    } catch (error) {
        next(error)
      console.log(error.message);  
    }
}

   
//----------TOURNAMENTS LIST FETCHING------------//

export const tournamentList = async(req,res,next) => {
    try {
        const tournamentData = await tournamentModel.find()
        res.json(tournamentData)
    } catch (error) {
        next(error)
      console.log(error.message);  
    }
}


  
//----------LOAD DASHBOARD LIST FETCHING------------//

export const loadDashBoard = async (req, res, next) => {
    try {
        
        const playersData = await tournamentModel.aggregate([
            {
                $match: {
                    is_approuve: { $ne: "waiting" }
                }
            },
            {
                $group: {
                    _id: "$players", 
                    count: { $sum: 1 } 
                }
            }
        ]);
        
        console.log(playersData);

        res.status(200).json(playersData);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
};


  
//-----------BLOCKING USER------------//

export const blockUser = async(req,res,next) => {
    try {
        const { id } = req.body
        const updatedUser = await userModal.updateOne(
            { _id: id },
            { $set: { is_blocked: true } }
          );  

          if(updatedUser){
            res.json(updatedUser)
        }else{
             res.status(400).json({
                message : "user blocking failed"
             })     
        }
    } catch (error) {
        next(error)
      console.log(error.message);  
    }
}

//-----------UnBLOCKING USER------------//

export const unBlockUser = async(req,res,next) => {
    try {
        const { id } = req.body
        const updatedUser = await userModal.updateOne(
            { _id: id },
            { $set: { is_blocked : false } }
          );         
          if(updatedUser){
            res.json(updatedUser)
        }else{
             res.status(400).json({
                message : "user unblocking failed"
             })     
        }
        
    } catch (error) {
        next(error)
      console.log(error.message);  
    }
}


    
//-----------BLOCKING MANAGER------------//

export const blockManager = async(req,res,next) => {
    try {
        const { id } = req.body
        const updatedManager = await managerModal.updateOne(
            { _id: id },
            { $set: { is_blocked: true } }
          );  

          if(updatedManager){
            res.json(updatedManager)
        }else{
             res.status(400).json({
                message : "manager blocking failed"
             })     
        }
    } catch (error) {
        next(error)
      console.log(error.message);  
    }
}


 
//-----------BLOCKING MANAGER------------//

export const unBlockManager = async(req,res,next) => {
    try {
        const { id } = req.body
        const updatedManager = await managerModal.updateOne(
            { _id: id },
            { $set: { is_blocked: false } }
          );  
  
          if(updatedManager){
            res.json(updatedManager)
        }else{
             res.status(400).json({
                message : "manager unblocking failed"
             })     
        }

    } catch (error) {
        next(error)
      console.log(error.message);  
    }
}


//-----------APPROVING TOURNAMENT------------//

export const approveTournament = async(req,res,next) =>{
    try {

        const { id } = req.body
        const upateTournament = await tournamentModel.updateOne({_id:id},{$set:{is_approuve:"approved"}})
        if(upateTournament){
            res.status(200).json(upateTournament)
        }else{
            res.status(400).json({
                message:"something went wrong"
            })
        }
        
    } catch (error) {
        next(error)
        console.log(error.message); 
    }
}


//-----------REJECTING TOURNAMENT------------//

export const rejectTournament = async(req,res,next) => {
    try {
        const {id,reason} = req.body
        const updateTournament = await tournamentModel.updateOne({_id:id},{$set:{is_approuve:"rejected",resonReject:reason}})
        if(updateTournament){
            res.json(updateTournament)
        }else{
            res.status(400).json({
                message:"something went wrong"
            })
        }
       
        
    } catch (error) {
        next(error)
        console.log(error.message);
    }
}