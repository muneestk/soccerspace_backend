import jwt from "jsonwebtoken";
import connectionModel from "../Modals/connectionModel.js";


export const chatConnection = async(req,res,next) =>{
    try {
        
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);
    const userid = claim._id;
    const { managerId } = req.body
    console.log(managerId);
    
    const connection = await connectionModel.findOne({"connections.user":userid,"connections.manager":managerId})

    if(connection){
        res.send({
            message:"success"
        })
    }else{
        const newData = new connectionModel({
            connections:{
                user:userid,
                manager:managerId
            }
        })

        newData.save().then(()=>{
            res.send({
                message:"success"
            })
        }).catch((err)=>{
            console.log(err);
        })

    }

    } catch (error) {
        next(error)
        console.log(error.message);
    }
}