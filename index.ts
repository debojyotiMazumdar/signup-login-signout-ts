import express from "express";
import mongoose,{ConnectOptions} from "mongoose";
import bodyparser from "body-parser";
import cookieparser from "cookie-parser";
import config from "./config/config";
import User from "./models/user";
import validator from "validator";


const app=express();

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(cookieparser());


//connecting database
mongoose.connect(config["dbUri"] as string,{useNewUrlParser:true,useUnifiedTopology:true} as ConnectOptions)
        .then(()=>{
            console.log("database connected");
        }).catch((e)=>{
            console.log("error while connecting db");
        });

app.get('/',function(req,res){
    res.status(200).send("Welcome to the signup-login-wignout app");
});

app.post('/api/register',function(req,res){
    //taking the user
    const newUser=new User(req.body);
    if(!validator.isEmail(newUser.email as string)) return res.status(400).json({message:"enter correct email address"});
    if (newUser.password!=newUser.confirmpassword) return res.status(400).json({message:"password and confirmpassword don't match"});

    User.findOne({email:newUser.email},function(err:any,user:any){
        if(user) return  res.status(400).json({auth:false,message:"email already exists"});

        newUser.save((err:any,doc:any)=>{
                if(err){
                    console.log(err);
                    return res.status(400).json({success:false});
                }
                res.status(200).json({
                    success:true,
                    user:doc
                });
        });
    });
});


//listen port 

const port = config["port"] as number;
const host = config["host"] as string;
app.listen(port,()=>{
    console.log(`url: http://${host}:${port}`);
});


