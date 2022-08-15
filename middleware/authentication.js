const jwt = require('jsonwebtoken')
const config = require('config')
const UserModel = require('../model/User')

// middleware for verify token
module.exports = (req, res, next) => {
    const token = req.header('x-auth-token')
    if(!token){
       return res.status(401).json({msg:'Token required'})
    }
    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
        const {user} = decoded
        // store user info in the request
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({msg:'Invalid token'})
    }
}
