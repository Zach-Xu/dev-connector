const mongoose = require('mongoose')
const {Schema} = mongoose

const PostSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    text:{
        type:String,
        required:true
    },
    name:{
        type:String
    },
    avatar:{
        type:String
    },
    likes:[
        {
            user:{
                type:Schema.Types.ObjectId,
                ref:'user'
            }
        }
    ],
    comments:[
        {
            user:{
                type:Schema.Types.ObjectId,
                ref:'user'
            },
            text:{
                type:String,
                required:true
            },
            name:{
                type:String
            },
            avatar:{
                type:String
            },
            date:{
                type:Date,
                default:Date.now
            }
        }
    ],
    createdDate:{
        type:Date,
        default:Date.now
    }
})

const PostModel = mongoose.model('post',PostSchema)

module.exports = PostModel
