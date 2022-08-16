const express = require('express')
const router = express.Router()
const authentication = require('../../middleware/authentication')
const { body, validationResult } = require('express-validator')
const UserModel = require('../../model/User')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')

// @route   GET api/auth
// @desc    Test router
// @access  Public
router.get('/', authentication, async (req, res) => {
    // destruture id from req and then find user info from DB by the id
    try {
        const { user: { id } } = req
        const user = await UserModel.findById(id).select('-password') // exclude password
        res.send({ msg: 'Auth API', user })
    } catch (error) {
        return res.status(500).json({ errors: [{ msg: error.message }] })
    }
})

// @route   POST api/auth
// @desc    User login
// @access  Public
router.post('/', [
    body('email').isEmail().withMessage('Not a valid email address'),
    body('password').not().isEmpty().withMessage('Passowrd required')
], async (req, res) => {
    const errors = validationResult(req)
    // response with 400 if errors raised
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body
    try {
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })
        }
        // compare password with the one just found from database
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })
        }
        const payload = {
            user: {
                id: user.id
            }
        }
        // sign payload into token
        const token = jwt.sign(payload, config.get('jwtPrivateKey'), { expiresIn: 60 * 60 })
        return res.send({ Login: 'success', token })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ errors: [{ msg: error.message }] })
    }
})

module.exports = router