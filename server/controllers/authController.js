const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.signUp = async (req, res) => {
    const { username,email, password } = req.body;
    try {
        const user = new User({ username,email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id, role: user.role }, 'YOUR_SECRET_KEY');

        res.status(201).json({
            username: user.username,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.signIn = async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, 'YOUR_SECRET_KEY');

        res.status(200).json({
            username:user.username,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
