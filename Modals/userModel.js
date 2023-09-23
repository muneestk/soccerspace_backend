import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({

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
    is_admin:{
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

const userModel = mongoose.model("user",userSchema);
export default userModel;