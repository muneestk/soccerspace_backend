
import mongoose from "mongoose";
const scheema = mongoose.Schema


const fixtureScheema = await mongoose.Schema({

    tournamentId:{
        type:scheema.Types.ObjectId,
        ref:'tournament',
        required:true
    },
    managerId:{
        type:scheema.Types.ObjectId,
        ref:'manager',
        required:true
    },
    matchRound:{
        type : Number,
        required : true
    },
    matches:[{
        team1Id:{
            type:scheema.Types.ObjectId,
            ref:'team',
            required:true
        },
        team2Id:{
            type:scheema.Types.ObjectId,
            ref:'team',
            required:true
        },
        winner:{
            type:scheema.Types.ObjectId,
            ref:'team',
        },
        team1Score:{
            type:Number,
            default:0
        },
        team2Score:{
            type:Number,
            default:0
        },
        matchStatus:{
            type : String,
            default : "pending"
        }
       
}]
})

const fixtureModel = mongoose.model('fixture',fixtureScheema);
export default fixtureModel ;