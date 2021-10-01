import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import config from "../config/config";
import jwt from "jsonwebtoken";
import { NextFunction } from "express";



export interface UserDocument extends mongoose.Document{
    firstname:string;
    lastname:string;
    email:string;
    password:string;
    confirmpassword:string;
    //comparePassword(candidatePassword:string): Promise<boolean>;
}

const userSchema = new Schema({
    firstname:{type:String,required:true,maxlength:100},
    lastname:{type:String,required:true,maxlength:100},
    email:{type:String,required:true,trim:true},
    password:{type:String,required:true,minlength:6},
    confirmpassword:{type:String,required:true,minlength:6},
    token:{type:String}
});

userSchema.pre("save",async function(next){
    let user = this;

    //only hash the password if it has been modified
    if(!user.isModified("password")) return next();

    //random additional data
    const salt = await bcrypt.genSalt(config["saltWorkFactor"]);

    const hash = await bcrypt.hashSync(user.password,salt);

    //replace passsword with hash
    user.password = hash;

    return next();
})

userSchema.methods.comparepassword = function(candidatePassword:string){
    const user = this as UserDocument;

    return bcrypt.compare(candidatePassword,user.password).catch((e)=>false);

}

userSchema.methods.generateToken = function(next){
    let user = this;
    const env = process.env.NODE_ENV;
    const privateKey= process.env.SECRET;
    var token = jwt.sign(user._id.toHexString(),privateKey as string);


    user.token = token;

    user.save(function(err:any,user:any){
            if(err){
                console.log(err);
            }
            return next(null,user);
    });
}

userSchema.methods.findByToken = function(token:any,next:any){
    let user = this;
    jwt.verify(token,config["privatekey"],function(err:any,decode:any){
        user.findOne({"_id":decode,"token":token},function(err:any,decode:any){
            if(err) return next(err);
            return next(null,user);
        })
    })
}


const User = mongoose.model<UserDocument>("User",userSchema);

export default User;
