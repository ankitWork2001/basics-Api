import {app}  from "./index.js";
import jwt from "jsonwebtoken";

const authenticate=async(req,res,next)=>{
    const {token}=req.body;
    if(!token)
    {
        return res.json({message :"Token is required"});
    }
    try{
        const result=jwt.verify(token,process.env.SECRET_KEY);
        req.body.username=result.username;
        // console.log(result);
        next();
    }
    catch(error)
    {
        // console.log(error);
        return res.json({message:"Invalid token"});
    }
}

export  {authenticate};