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
    is_google_signup:{
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
    },
    token:{
        type:String,
    },
    
})

const userModel = mongoose.model("user",userSchema);
export default userModel;