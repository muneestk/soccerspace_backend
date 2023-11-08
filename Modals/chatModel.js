import mongoose from "mongoose";

const chatScheema = new mongoose.Schema({
    connection:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"connection"
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    reciever:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    message:{
        type:String,
        required:true
    }
},
{
    timestamps:true
})

const chatModel = mongoose.model("chat",chatScheema)
export default chatModel