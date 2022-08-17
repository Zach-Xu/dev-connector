const express = require('express')
const router = express.Router()
const authentication = require('../../middleware/authentication')
const { body, validationResult } = require('express-validator')

const PostModel = require('../../model/Post')
const UserModel = require('../../model/User')

// @route   GET api/posts
// @desc    Get all posts 
// @access  Private
router.get('/', authentication, async (req, res) => {
    try {
        const posts = await PostModel.find()
        res.json(posts)
    } catch (error) {
        console.error(error)
        res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

// @route   GET api/posts/:post_id
// @desc    Get post by post id 
// @access  Private
router.get('/:post_id', authentication, async (req, res) => {
    try {
        const { post_id } = req.params
        const post = await PostModel.findById(post_id)
        if (!post) {
            res.status(404).json({ msg: 'Post not found' })
        }
        res.json(post)
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        console.error(error)
        res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [authentication, [
    body('text').not().isEmpty().withMessage('Text required')
]], async (req, res) => {
    const errors = validationResult(req)
    // response with 400 if errors raised
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        // verify if user exists
        const { user: { id } } = req
        const user = await UserModel.findById(id).select('-password')
        if (!user) {
            return res.status(404).json({ msg: 'User not found' })
        }
        const { name, avatar } = user
        // create post object 
        let post = {
            user: id,
            name,
            avatar,
            text: req.body.text
        }
        post = await PostModel.create(post)
        return res.json({ msg: 'Post added successfully', post })
    } catch (error) {
        console.error(error)
        res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

// @route   DELETE api/posts/:post_id
// @desc    Delete a post by post id 
// @access  Private
router.delete('/:post_id', authentication, async (req, res) => {
    try {
        const { post_id } = req.params
        let post = await PostModel.findById(post_id)
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        // compare user got from token with the user of the post
        const { user: { id } } = req
        if (post.user.toString() !== id) {
            return res.status(403).json({ msg: 'Not the author of the post' })
        }
        await PostModel.deleteOne({ id: post_id })
        res.json({ msg: 'Post deleted successfully', post })
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        console.error(error)
        res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

// @route   PUT api/posts/like/:post_id
// @desc    Like a post 
// @access  Private
router.put('/like/:post_id', authentication, async (req, res) => {
    try {
        const { post_id } = req.params
        const post = await PostModel.findById(post_id)
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        // mapping like to user id
        const { user: { id } } = req
        const mapLikeToUserId = post.likes.map(like => like.user.toString())
        // can not like the same post twice
        if (mapLikeToUserId.includes(id)) {
            return res.status(400).json({ msg: 'Post already been liked' })
        }
        // add object that countains userId info to likes if this post not liked by the user
        post.likes = [{ user: id }, ...post.likes]
        post.save()
        res.json({ msg: 'Post liked successfully', likes: post.likes })
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        console.error(error)
        res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

// @route   PUT api/posts/unlike/:post_id
// @desc    Cancel like on a post 
// @access  Private
router.put('/unlike/:post_id', authentication, async (req, res) => {
    try {
        const { post_id } = req.params
        const post = await PostModel.findById(post_id)
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        // mapping like to user id
        const mapLikeToUserId = post.likes.map(like => like.user.toString())
        // post must be liked by current user before it can be unliked
        const { user: { id } } = req
        if (mapLikeToUserId.includes(id)) {
            // remove user from the likes list
            post.likes = post.likes.filter(like => like.user.toString() !== id)
            await post.save()
            return res.json({ msg: 'Unliked successfully', likes: post.likes })
        }
        return res.status(400).json({ msg: 'Post not yet been liked' })

    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        console.error(error)
        res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

// @route   POST api/posts/comment/:post_id
// @desc    Leave a comment on a post 
// @access  Private
router.post('/comment/:post_id', [authentication,
    body('text').not().isEmpty().withMessage('Text required')
], async (req, res) => {
    const errors = validationResult(req)
    // response with 400 if errors raised
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const { post_id } = req.params
        const post = await PostModel.findById(post_id)
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        // get user info
        const { user: { id } } = req
        const { text } = req.body
        const user = await UserModel.findById(id)
        // create comment object
        const comment = {
            user: id,
            text,
            name: user.name,
            avatar: user.avatar
        }
        post.comments = [comment, ...post.comments]
        await post.save()
        res.json({ msg: 'Post commented successfully', comments: post.comments })
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        console.error(error)
        res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

// @route   DELETE api/posts/comment/:post_id/:cmt_id
// @desc    Delete a comment from a post
// @access  Private
router.delete('/comment/:post_id/:cmt_id', authentication, async (req, res) => {
    try {
        const { post_id, cmt_id } = req.params
        const post = await PostModel.findById(post_id)
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        // mapping comments to user id
        const mapCmtToId = post.comments.map(cmt => cmt.id)
        if (mapCmtToId.includes(cmt_id)) {
            post.comments = post.comments.filter(cmt => cmt.id !== cmt_id)
            await post.save()
            return res.json({ msg: 'Comment deleted successfully', comments: post.comments })
        }
        res.status(404).json({msg:'Comment not found'})
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        console.error(error)
        res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})


module.exports = router