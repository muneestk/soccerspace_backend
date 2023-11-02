
import mongoose from "mongoose";
const scheema = mongoose.Schema


const scorerScheema = await mongoose.Schema({

        scorerName:{
            type:String
        },
        count:{
            type:Number,
            default:1
        },
        matchId:{
            type:scheema.Types.ObjectId,
            required:true
        },
        tournamentId:{
            type:scheema.Types.ObjectId,
            ref:'tournament',
            required:true
        },
        teamId:{
            type:scheema.Types.ObjectId,
            ref:'team',
            required:true
        },
        team:{
            type:String,
            required:true
        },


   
})

const scorerModel = mongoose.model('score',scorerScheema);
export default scorerModel ;