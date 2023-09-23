
import mongoose from "mongoose";

const managerScheema = await mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String,
        default:''
    },
    token:{
        type:String,
        default:''
    },
})

const managerModel = mongoose.model('manager',managerScheema);
export default managerModel;