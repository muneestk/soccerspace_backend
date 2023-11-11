import jwt from "jsonwebtoken";
import connectionModel from "../Modals/connectionModel.js";
import chatModel from "../Modals/chatModel.js";


export const chatConnection = async(req,res,next) =>{
    try {
        
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);
    const userid = claim._id;
    const { managerId } = req.body
    
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




export const getChatLIst = async(req,res,next) =>{
    try {
        
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);
    const userid = claim._id;
    
    const userContact = await connectionModel.find({"connections.user":userid}).populate('connections.manager')
    res.status(200).json({
        userContact,
        userId:userid
    })
   

    } catch (error) {
        next(error)
        console.log(error.message);
    }
}





export const getFullChat = async(req,res,next) =>{
    try {
        
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);
    const userid = claim._id;
    const manangerId = req.query.id
    
    const userContact = await connectionModel.findOne({"connections.user":userid,"connections.manager":manangerId})
    if(userContact){
        const messages = await chatModel.find({connection:userContact._id}).sort('createdAt')
        res.status(200).json({
            messages:messages,
            cid:userContact._id,
            userId:userid
        })
    }else{
        res.status(400).json({
            message:"no any connection"
        })
    }
   

    } catch (error) {
        next(error)
        console.log(error.message);
    }
}


//--------MANAGER CHAT LIST -------//


export const getManagerChatLIst = async(req,res,next) =>{
    try {
        
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.MANAGERSECRETKEY);
    const id = claim._id;
    const { search } = req.query;
    let query = { "connections.manager": id };

// if (search) {
//     query['connections.manager'] = { $regex: search, $options: "i" };
// }

const managerContact = await connectionModel.find(query).populate('connections.user');
    
    
    res.status(200).json({
    managerContact,
    managerId:id
})
   

    } catch (error) {
        next(error)
        console.log(error.message);
    }
}




//--------MANAGER FULL CHAT  -------//


export const getManagerFullChat = async(req,res,next) =>{
    try {
        
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.MANAGERSECRETKEY);
    const id = claim._id;
    const userId = req.query.id
    const managerContact = await connectionModel.findOne({"connections.user":userId,"connections.manager":id})

    if(managerContact){
        const messages = await chatModel.find({connection:managerContact._id}).sort('createdAt')
        res.status(200).json({
            messages:messages,
            cid:managerContact._id,
            managerId:id
        })
    }else{
        res.status(400).json({
            message:"no any connection"
        })
    }

    
 
   

    } catch (error) {
        next(error)
        console.log(error.message);
    }
}

//-------- SENT MESSAGE IN USER TO MANAGER  -------//



export const sentMessage = async(req,res,next) =>{
    try {
 
    const {connectionid,from,to,message} = req.body

    const newMessage = new chatModel({
        connection:connectionid,
        sender:from,
        reciever:to,
        message
    })

    await newMessage.save().then(()=>{
        res.json(newMessage)
    }).catch((err)=>{
        console.log(err);
    })
    
    

    } catch (error) {
        next(error)
        console.log(error.message);
    }
}
