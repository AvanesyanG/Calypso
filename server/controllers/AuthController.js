import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Code from "../models/CodeModel.js";
import {renameSync, unlinkSync} from "fs";
import { configDotenv } from "dotenv";


const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userID) => {
    return jwt.sign({email, userID}, process.env.JWT_KEY, {expiresIn: maxAge});
};

export const signup = async (Request, Response) => {
    try {
      const { email, password, invitationCode } = Request.body;
      console.log(invitationCode)  
      if (!email || !password) {
        return Response.status(400).send("Email and Password are required");
      }
  
      const code = await Code.findOne({ text: invitationCode });
      console.log(code?.text)
      if (!code) {
        return Response.status(403).send("Invitation Code is incorrect.");
      }
  
      if (code.text !== "hello_admin" && code.counter >= 2) {
        return Response.status(403).send("Invitation code has reached its usage limit");
      }
  
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return Response.status(409).send("The user already exists");
      }
  
      if (code.text !== "hello_admin") {
        await Code.findOneAndUpdate(
          { text: invitationCode },
          { $set: { counter: code.counter + 1 } }
        );
      }
  
      
      const user = await User.create({ email, password: password });
  
      const token = createToken(email, user.id);
      Response.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      });
  
      return Response.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          profileSetup: user.profileSetup,
        },
      });
  
    } catch (error) {
      console.error(error);
      return Response.status(500).send("Internal Server Error");
    }
};


// this is old signup function, just keep for a while, then delete

// export const signup = async (Request, Response, next) => {

//     try {
        
//         const {email, password, invitationCode} = Request.body;

//      Just for a start of db and Code collection        
//         Code;

//         const code = await Code.findOne({"text": invitationCode});

//         if(!code) {
//             return Response.status(403).send("Invitation Code is incorrect.");
//         }       

//         if(code && code.text !== "hello_admin") {
//             if(!code || code.counter==2) {
//                 return Response.status(403).send('access denied');
//                 } 
//         }

//         const oldUser = await User.findOne({"email": email });

//         if(oldUser) {
//             return Response.status(409).send("The user already exists");
//         }

       
//        if(!email || !password) {
//             return Response.status(400).send("Email and Password is required");
//         }

//         if (code.text !== "hello_admin") {
//             let newCounter = code.counter + 1;
//             await Code.findOneAndUpdate({"text": invitationCode},{ $set: {counter: newCounter}});   
//         }
        
//         const user = await User.create({email, password});
        
//         Response.cookie("jwt", createToken(email, user.id), {
//         maxAge,
//         }); 

//     return Response.status(201).json({
//     user: {
//         id: user.id,
//         email:user.email,
//         profileSetup: user.profileSetup,
//     },
//     });

//     } catch (error) {
//         return Response.status(500).send("internal Server Error");
//     }

//     next()

// };


export const login = async (Request, Response, next) => {

    try {
        
        const {email, password} = Request.body;
       
        if(!email || !password) {
            return Response.status(400).send("Email and Password is required");
        }

        const user = await User.findOne({email});

        if(!user) {
            return Response.status(404).send("User is not found");
        }

        const auth = await bcrypt.compare(password, user.password);

            if(!auth) {
                return Response.status(400).send("Password is incorrect");
            }                 
        
        Response.cookie("jwt", createToken(email, user.id), {
        maxAge,
        }); 

    return Response.status(200).json({
    user: {
        id: user.id,
        email:user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        color: user.color,
        image: user.image,
    },
    });

    } catch (error) {
        console.log({error});
        return Response.status(500).send("internal Server Error");
    }

    next()

};

export const getUserInfo = async (request, response, next) => {

    try {

        const userData = await User.findById(request.userID);

        if(!userData) return response.status(404).send("User with this UserID not found");

   return response.status(200).json({
        id: userData.id,
        email:userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        color: userData.color,
        image: userData.image,
    });

    } catch (error) {
        console.log({error});
        return response.status(500).send("internal Server Error");
    }

    next()

};

export const updateProfile = async (request, response, next) => {
//
    try {

        const {userID} = request;

        const {firstName, lastName, color } = request.body;

        if(!firstName || !lastName) return Response.status(400).send("First Name, Last Name and color are required");

        const userData = await User.findByIdAndUpdate(userID, {firstName, lastName, color, profileSetup: true}, 
            {new: true, runValidators:true});

   return response.status(200).json({
        id: userData.id,
        email:userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        color: userData.color,
        image: userData.image,
    });

    } catch (error) {
        console.log({error});
        return Response.status(500).send("internal Server Error");
    }
    next()
};
   
    export const addProfileImage = async (request, response, next) => {

        try {
            
        if(!request.file) {
            return response.status(400).send("File is required");
        }

        let date = new Date().toLocaleDateString();

        let fileName = "uploads/profiles/" + date + "_" + request.file.originalname;

        renameSync(request.file.path, fileName);

        const updatedUser = await User.findByIdAndUpdate(request.userID, {image: fileName},
        {new: true, runValidators:true});
    
          return response.status(200).json({
          image: updatedUser.image,
        });
    
        } catch (error) {
            console.log({error});
            return Response.status(500).send("internal Server Error");
        }
        next()
    };

    export const removeProfileImage = async (request, response, next) => {

        try {

        const {userID} = request;

        const user = await User.findById(userID);
            
        if(!user) {
            return response.status(404).send("User not found.");
        }

        if(user.image) {
            unlinkSync(user.image)
        }

        user.image = null;

        await user.save();

  
        return response.status(200).send("Profile image removed succesfsfululy.");
    
        } catch (error) {
            console.log({error});
            return Response.status(500).send("internal Server Error");
        }
        next()
    };

    export const logout = async (request, response, next) => {

        try {

             response.clearCookie("jwt", "", {
                maxAge,
                }); 

                return response.status(200).send("Logout Successful");
    
        } catch (error) {
            console.log({error});
            return Response.status(500).send("internal Server Error");
        }
        next()
    };
