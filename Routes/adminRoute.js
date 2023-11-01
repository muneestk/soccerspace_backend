import  Express  from "express";
const adminRoute = Express()
import { adminLogin, approveTournament, blockManager, blockUser, loadDashBoard, managerList, rejectTournament, tournamentList, unBlockManager, unBlockUser, userList } from "../Controller/adminController.js";
import { adminAuth } from "../middleware/Auth.js";



adminRoute.post('/login',adminLogin)

adminRoute.get('/usersList' , adminAuth , userList)
adminRoute.get('/managerList' , adminAuth , managerList)
adminRoute.get('/tournamentsList'  , tournamentList)
adminRoute.get('/loadDashBoard'  , adminAuth ,loadDashBoard)

adminRoute.patch('/unBlockUser', adminAuth , unBlockUser)
adminRoute.patch('/blockUser' , adminAuth , blockUser )
adminRoute.patch('/unBlockManager' , adminAuth , unBlockManager )
adminRoute.patch('/blockManager', adminAuth , blockManager )
adminRoute.patch('/approveTournament', adminAuth , approveTournament )
adminRoute.patch('/rejectTournament', adminAuth , rejectTournament )


export default adminRoute