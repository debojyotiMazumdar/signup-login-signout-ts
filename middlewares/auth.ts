import User from "../models/user";
import {Request,Response,NextFunction} from "express";

export default function(req:Request,res:Response,next:NextFunction){
    let token = req.cookies.auth;
    User.findByToken(token,(err:any,user:any)=>{
    
        if(err){ 
            console.log(err);
            return; 
        };
        if(user){
            return res.status(400).json({
                error:true,
                message:"You are already logged in"
            });
        };

        
        User.findOne({"email":req.body.email},function(err:any,user:any){
            if(!user) return res.json({isAuth:false,message:"Auth failed,email not found"});

            user.comparepassword(req.body.password,)
        });
    }