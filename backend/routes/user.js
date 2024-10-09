const express = require('express');
const router = express.Router();
const zod = require("zod");
const { User, Account } = require('../db.js');
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config.js");
const authMiddleware = require('../middleware.js');




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
    //Create account and give user a fake balance anywhere between 1 and 10000
    const userId= dbUser._id
    await Account.create({
        userId,
        balance:1+Math.random()*10000
    })
    res.status(201).json({
        message: "User created successfully",
        token: token
    })

})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})

router.post("/signin", async(req,res) => {
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

const updateBody = zod.object({
    password: zod.string().optional,
	firstName: zod.string().optional,
	lastName: zod.string().optional,
})

router.put("/", authMiddleware, async (req,res)=> {
    const {success}= updateBody.safeParse(req.body);
    if(!success) {
        return res.status(411).json(
            {
                message: "Error while updating information"
            }
        )
    }

    await User.updateOne({_id:req.userId}, req.body);

    res.json({
        message: "Upadted successfully"
    })
})

router.get("/bulk", authMiddleware, async(req,res) => {
    const filter = req.query.filter || "";

    const users= await User.find({
        $or:[{
            'firstName':
            {
            "$regex":filter, $options: 'i'
        }},{'lastName':{
            "$regex":filter, $options: 'i'
        }}]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;