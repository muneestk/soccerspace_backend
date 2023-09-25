import  Express  from "express";
const adminRoute = Express()
import { adminLogin, blockManager, blockUser, managerList, unBlockManager, unBlockUser, userList } from "../Controller/adminController.js";
import { adminAuth } from "../middleware/Auth.js";



adminRoute.post('/login',adminLogin)

adminRoute.get('/usersList' , adminAuth , userList)
adminRoute.get('/managerList' , adminAuth , managerList)

adminRoute.patch('/unBlockUser', adminAuth , unBlockUser)
adminRoute.patch('/blockUser' , adminAuth , blockUser )
adminRoute.patch('/unBlockManager' , adminAuth , unBlockManager )
adminRoute.patch('/blockManager', adminAuth , blockManager )


export default adminRoute