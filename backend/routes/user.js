const express = require('express');
const router = express.Router();
const zod = require("zod");
const { User } = require('./db');
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");


const signupSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

router.post("/signup", async (req,res) => {
    const body = req.body;
    const {success} = signupSchema.safeParse(body);
    if(!success) {
        return res.json({
            message:"Email already taken/Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username:body.username 
    })

    if(user._id) {
        return res.status(411).json({
            message: "Email already taken/ Incorrect inputs"
        })
    }

    const dbUser = await User.create(body);
    const token = jwt.sign({
        userId: dbUser._id
    }, JWT_SECRET)

    res.status(201).json({
        message: "User created successfully",
        token: token
    })

})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})

router.post("/signin", async(req,res) {
    const body = req.body;
    const {success} = signinSchema.safeParse(body);
    if(!success){
        return res.status(411).json(
            {
                message: "Error while logging in"
            }
        )
    }

    const existingUser= await User.findOne({
        username:body.username,
        password:body.password
    })

    if(!existingUser) {
        return res.status(411).json(
            {
                message: "Error while logging in"
            }) 
    }
    const token = jwt.sign({userId: existingUser._id}, JWT_SECRET);

    res.json({
        token:token
    });



})

module.exports = router;