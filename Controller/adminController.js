import userModal from '../Modals/userModel.js'
import bcrypt from 'bcryptjs';
import  Jwt  from 'jsonwebtoken';






//----------ADMIN LOGIN------------//

export const adminLogin = async(req,res,next) => {

    try {

        const { email,password } = req.body
        const adminData = await userModal.findOne({email:email})

        if(!adminData){
            res.status(400).json({
                message:"incorrect email"
            })
        }

        if(!(await bcrypt.compare(password,adminData.password) )){
            res.status(400).json({
                message:"password is incorrect"
            })
        }
        
        if(adminData.is_admin){
            const token = Jwt.sign({_id:adminData._id},"adminSecret")  
            res.json(token) 
        }else{
            return res.status(400).json({
                message:"you are not admin"
            })
        }

        
    } catch (error) {
        next(error)
        console.log(error.message);
    }
}
