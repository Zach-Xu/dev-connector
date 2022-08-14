const express = require('express')

const app = express()

const PORT = process.env.PORT || 3002

app.use('/', (req,res)=> {
    res.send('API running')
})



app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})
