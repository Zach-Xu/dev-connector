const express = require('express')
const connectDB = require('./config/db')

// import routes
const authRouter = require('./routes/api/auth')
const postsRouter = require('./routes/api/posts')
const profileRouter = require('./routes/api/profile')
const usersRouter = require('./routes/api/users')


const app = express()
connectDB()

const PORT = process.env.PORT || 3002

app.get('/', (req,res)=> {
    res.send('API running')
})

app.use('/api/auth', authRouter)
app.use('/api/posts', postsRouter)
app.use('/api/profile', profileRouter)
app.use('/api/users', usersRouter)

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})
