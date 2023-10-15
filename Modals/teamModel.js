
import mongoose from "mongoose";
const scheema = mongoose.Schema

const teamScheema = await mongoose.Schema({

    teamName:{
        type:String,
        required:true
    },
    managerName:{
        type:String,
        required:true
    },
    teamLocation:{
        type:String,
        required:true
    },
    teamLogo:{
        type:String,
        required:true
    },
    mobNo:{
        type:Number,
        required:true
    },
    altMobNo:{
        type:Number,
        required:true
    },
   userId:{
        type:scheema.Types.ObjectId,
        ref:'user',
        required:true
   },
    tournamentId:{
        type:scheema.Types.ObjectId,
        ref:'tournament',
        required:true
    },
   paymentMethod:{
        type:String,
        default:'online payment'
   },
   paymentStatus:{
        type:String,
        default:'pending'
   },

})

const teamModel = mongoose.model('team',teamScheema);
export default teamModel;