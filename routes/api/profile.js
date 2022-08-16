const express = require('express')
const router = express.Router()
const authentication = require('../../middleware/authentication')
const ProfileModel = require('../../model/Profile')
const { body, validationResult } = require('express-validator')

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await ProfileModel.find({})
        res.json(profiles)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Server Error' })
    }
})

// @route   GET api/profile/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params
        const profile = await ProfileModel.findOne({ user: user_id })
        res.json(profile)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Server Error' })
    }
})

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authentication, async (req, res) => {
    // destruture id from req
    const { user: { id } } = req
    try {
        // find profile by id
        const profile = await ProfileModel.findOne({ user: id }).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' })
        }
        return res.json(profile)
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ errors: [{ msg: error.message }] })
    }
})

// @route   POST api/profile
// @desc    Create or update profile
// @access  Private
router.post('/', [authentication, [
    body('occupation').not().isEmpty().withMessage('Occupation required'),
    body('skills').not().isEmpty().withMessage('Skills required')
]], async (req, res) => {
    const errors = validationResult(req)
    // response with 400 if errors raised
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const { user: { id } } = req
        let profile = await ProfileModel.findOne({ user: id })
        // update profile if exists otherwise create one
        if (profile) {
            const profileId = profile.id
            profile = {
                ...req.body,
                skills: req.body.skills.split(',').map(skill => skill.trim())
            }
            profile = await ProfileModel.findOneAndUpdate({ id: profileId }, profile)
            return res.json({ msg: 'Update profile successfully', profile })
        } else {
            profile = {
                user: id,
                ...req.body,
                skills: req.body.skills.split(',').map(skill => skill.trim())
            }
            profile = await ProfileModel.create(profile)
            return res.json({ msg: 'Create profile successfully', profile })
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ errors: [{ msg: error.message }] })
    }
})

// @route   DELETE api/profile/
// @desc    Delete current user profile
// @access  Private
router.delete('/', authentication, async (req, res) => {
    try {
        const { user: { id } } = req
        const profile = await ProfileModel.findOneAndDelete({ user: id })
        res.json({ "delete profile": "success", profile })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ errors: [{ msg: error.message }] })
    }
})


module.exports = router