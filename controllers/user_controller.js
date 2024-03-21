const user_db = require('../models/user');

const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken')

const JWT_SECRET = "JWT_SECRET"
const bcrypt = require('bcryptjs');

//-----------------------------------------------------------------------
exports.user_signup = ([
    body('email', 'Enter a valid email').isEmail(),
    body('phone_number').notEmpty().withMessage('Marks is required'),
    body('password', 'Password must be atleast of 4 characters and cannot be blank').isLength({ min: 4 }).exists(),

], async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt)

    user = await new user_db({
        name: req.body.name,
        phone_number: req.body.phone_number,
        email: req.body.email,
        password: secPass,
        priority: req.body.priority
    })

    const data = {
        user: {
            id: user._id
        }
    }
    const auth_token = jwt.sign(data, JWT_SECRET);

    user
        .save(user)
        .then(data => {
            success = true;
            res.status(200).json({ success, auth_token, user });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Internal Server Error"
            })
        })
})

//-----------------------------------------------------------------------

exports.user_login = ([
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast of 4 characters and cannot be blank').isLength({ min: 4 }).exists(),

], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await user_db.findOne({ email });
        let success = false;
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        // (i.e., the passwords match), passwordCompare will be true.
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }
        const data = {
            user: {
                id: user._id
            }
        }
        const auth_token = jwt.sign(data, JWT_SECRET);

        success = true;
        res.json({ success, auth_token, user })
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send({
            message: err.message || "Internal Server Error"
        })
    }
})

//----------------------------------------------------------------------------
exports.get_user = (async (req, res) => {
    try {
        let userId= req.user.id;
        const user= await user_db.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
            message: err.message || "Internal Server Error"
        })
    }
})




