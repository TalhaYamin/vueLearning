const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ error: 'Authorization required' });

    try {
        const token = authorization.split(' ')[1];
        const payload = jwt.verify(token, 'YOUR_SECRET_KEY');
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
