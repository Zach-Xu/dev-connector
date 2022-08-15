const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const UserModel = require('../../model/User')
const bcrypt = require('bcryptjs')
const gravtar = require('gravatar')
const jwt = require('jsonwebtoken')
const config = require('config')

// @route   GET api/users
// @desc  
// @access  Public
router.get('/', (req, res) => {
    res.send('Users API')
})

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
    // request body validation
    body('name').not().isEmpty().withMessage('Name can not be empty'),
    body('email').isEmail().withMessage('Not a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Passowrd must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req)
    // response with 400 if errors raised
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { name, email, password } = req.body
    try {
        let user = await UserModel.findOne({email})
        if(user) {
            console.log('user', user);
            return res.status(400).json({errors:[{msg:'Email already exists'}]})
        }
        const salt = await bcrypt.genSalt(10)
        // hash password
        const hashedPassword = await bcrypt.hash(password, salt)
        // get avatar using gravtar
        const avatar =  gravtar.url(email, {s:'200', r:'pg', d:'mm'})
        // store user in MongoDB
        user = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            avatar
        })   
        const payload = {
            user:{
                id:user.id
            }
        }
        console.log('payload',payload);
        // sign payload into token
        const token = jwt.sign(payload, config.get('jwtPrivateKey'), { expiresIn: 60 * 60 })
        res.send({message:'User registered successfully', token})
    } catch (error) {
        console.log('Server Error', error);
        return res.status(500).json({errors:[{msg:error.message}]})
    }

})

module.exports = router