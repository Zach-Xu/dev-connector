const express = require('express')
const router = express.Router()
const authentication = require('../../middleware/authentication')
const ProfileModel = require('../../model/Profile')
const { body, validationResult } = require('express-validator')
const config = require('config')
const request = require('request')

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
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' })
        }
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

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', [authentication, [
    body('title').not().isEmpty().withMessage('Title required'),
    body('company').not().isEmpty().withMessage('Company required'),
    body('location').not().isEmpty().withMessage('location required'),
    body('from').not().isEmpty().withMessage('Started date required'),
    body('to').if((value, { req }) => !req.body.current).not().isEmpty().withMessage('End date required')
]], async (req, res) => {
    const errors = validationResult(req)
    // response with 400 if errors raised
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const { user: { id } } = req
        // find profile by id
        const profile = await ProfileModel.findOne({ user: id })
        // insert new experience to the front
        profile.experience = [{ ...req.body }, ...profile.experience]
        await profile.save()
        res.json({ msg: 'add experience successfully', experience: profile.experience })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ errors: [{ msg: error.message }] })
    }
})

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience
// @access  Private
router.delete('/experience/:exp_id', authentication, async (req, res) => {
    try {
        const { exp_id } = req.params
        const { user: { id } } = req
        // get user profile
        const profile = await ProfileModel.findOne({ user: id })
        if (!profile) {
            res.status(400).json({ errors: [{ msg: 'Profile not found' }] })
        }
        // remove experience from the list
        const newExperienceList = profile.experience.filter(item => item.id != exp_id)
        // assign new list to experience
        profile.experience = newExperienceList
        await profile.save()
        res.json({ msg: 'delete experience successfully', experience: profile.experience })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ errors: [{ msg: error.message }] })
    }
})

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post('/education', [authentication, [
    body('school').not().isEmpty().withMessage('School required'),
    body('degree').not().isEmpty().withMessage('Degree required'),
    body('fieldofstudy').not().isEmpty().withMessage('Field of study required'),
    body('from').not().isEmpty().withMessage('Started date required'),
    body('to').if((value, { req }) => !req.body.current).not().isEmpty().withMessage('End date required')
]], async (req, res) => {
    const errors = validationResult(req)
    // response with 400 if errors raised
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const { user: { id } } = req
        // find profile by id
        const profile = await ProfileModel.findOne({ user: id })
        // insert new education to the front
        profile.education = [{ ...req.body }, ...profile.education]
        await profile.save()
        res.json({ msg: 'add education successfully', education: profile.education })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ errors: [{ msg: error.message }] })
    }
})

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education
// @access  Private
router.delete('/education/:edu_id', authentication, async (req, res) => {
    try {
        const { edu_id } = req.params
        const { user: { id } } = req
        // get user profile
        const profile = await ProfileModel.findOne({ user: id })
        if (!profile) {
            res.status(400).json({ errors: [{ msg: 'Profile not found' }] })
        }
        // remove education from the list
        const newEducationList = profile.education.filter(item => item.id != edu_id)
        // assign new list to education
        profile.education = newEducationList
        await profile.save()
        res.json({ msg: 'delete education successfully', education: profile.education })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ errors: [{ msg: error.message }] })
    }
})

// @route   GET api/profile/github/:username
// @desc    Get user repo from github
// @access  Public
router.get('/github/:username', async (req, res) => {
    try {
        const { username } = req.params
        const clientID = config.get('githubClientID')
        const clientSecret = config.get('githubSecret')
        // set up request config
        const options = {
            uri: `https://api.github.com/users/${username}/repos?per_page=5&sort=created:asc&client_id=${clientID}&client_secret=${clientSecret}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        }
        // send request
        request(options, (error, response, body) => {
            if (error) {
                console.error(error)
            }
            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No github repo found' })
            }
            return res.json(JSON.parse(body))
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

module.exports = router
