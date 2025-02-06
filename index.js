import express from "express";
import mongoose from "mongoose";
import env from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

import {body,validationResult} from "express-validator";
import { User } from "./models/user.models.js";
import {authenticate} from "./auth.js";



export const app=express();
app.use(express.json());

env.config();

const connectDB=async()=>{
    try{
        const con=await mongoose.connect(`${process.env.DATABASE_URL}`);
        console.log("DataBase Connected");
    }
    catch(err)
    {
        console.log("DataBase not Connected",err);
    }

}
connectDB().then(()=>{
    app.listen(process.env.port,()=>{
        console.log("Server is running on port",process.env.port);
    })
}).catch((err)=>{
    console.log("Server is not running",err);
});


app.post("/signup",body('username').isLength({min:3}),body('email').isEmail(),body('password').isLength({min:3}),async (req,res)=>{
    
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.json({message:"Data is not valid",errors:errors.array()});
    }
    
    const {username,email,password}=req.body;

    console.log(username,email,password);
    if(!username || !email || !password)
    {
        return res.json({message:"Please fill all the details"});
    }
    const user= await User.findOne({username});
    if(user)
    {
        return res.json({message:"User already exists"});
    }
    let newUser=await User.create({
        username,
        email,
        password
    });
    delete newUser.password;
    return res.json({message:"User created successfully",newUser});
});


app.post("/login",async(req,res)=>{
    const {username,email,password}=req.body;
    if(!username || !email || !password)
    {
        return res.json({message:"Please fill all the details"});
    }
    const user=await User.findOne({username});
    if(!user)
    {
        return res.json({message:"User not found"});
    }
    const isCorrectPassword=await user.checkPassword(password);
    const isCorrectEmail=await user.checkEmail(email);   
    if(isCorrectEmail && isCorrectPassword)
    {
        delete user.password;
        const token=jwt.sign({username:username},process.env.SECRET_KEY);   
        return res.json({message :"User Logged in successfully",user,token});
    }
    else
    {
        return res .json({message:"Invalid credentials"});
    }
})

app.post("/userdetails",authenticate,async(req,res)=>{
    const {username}=req.body;
    console.log(username);
    const user=await User.findOne({username});
    return res.json({user});
})


app.patch("/update",authenticate,async(req,res)=>{
    const {username,email,password}=req.body;
    let user=await User.findOne({username});
    let newEmail=email||user.email;
    let newPassword=password|| user.password;
    user=await User.findOneAndUpdate({username},{
        email:newEmail,
        password:newPassword},
        {new:true});

        return res.json({message:"Updated Credentials",user});
    });


    app.post("/delete",authenticate,async(req,res)=>{
        const {username}=req.body;
        const user=await User.findOneAndDelete({username});
        return res.json({message:"User Deleted Successfully"});
    })
    