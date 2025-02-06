import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";

const userSchema=new Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        trim:true
    }
    
});

userSchema.pre("save",async function(next){
    if(!this.isModified("password"))
    {
        return next();
    }
    this.password=await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.checkPassword=async function(password){
    const result=await bcrypt.compare(password,this.password);
    console.log(result);
    return result;
}

userSchema.methods.checkEmail=async function(email){
    console.log(email,this.email);
    return this.email==email;
}

export const User=mongoose.model("User",userSchema);