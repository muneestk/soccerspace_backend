
import mongoose from "mongoose";
const scheema = mongoose.Schema

const tournamentScheema = await mongoose.Schema({

    tournamentName:{
        type:String,
        required:true
    },
    teamName:{
        type:String,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    mobileNo:{
        type:Number,
        required:true
    },
    winnersPriceMoney:{
        type:Number,
        required:true
    },
    winnersPriceMoney:{
        type:Number,
        required:true
    },
    tournamentDate:{
        type:Date,
        required:true
    },
    slots:{
        type:Number,
        required:true
    },
    limit:{
        type:String,
        required:true
    },
    logoImage:{
        type:String,
        required:true
    },
    posterImage:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"pending"
    },
    managerId:{
        type:scheema.Types.ObjectId,
        ref:'manager',
        required:true
    },
    is_approuve:{
        type:Boolean,
        default:false
    },
    registeredDate: {
        type: Date,
        default: Date.now 
      },
    Teams: [{
         type: scheema.Types.ObjectId ,
         ref:"team"
     }],


   
   
})

const tournamentModel = mongoose.model('tournament',tournamentScheema);
export default tournamentModel;