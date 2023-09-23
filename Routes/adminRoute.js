import  Express  from "express";
const adminRoute = Express()
import { adminLogin } from "../Controller/adminController.js";



adminRoute.post('/login',adminLogin)


export default adminRoute