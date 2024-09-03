const { registerUser, authenticateUser } = require('../services/authService');

exports.signUp = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const { user, token } = await registerUser(username, email, password);
    res.status(201).json({ username: user.username, email: user.email, role: user.role, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, token } = await authenticateUser(email, password);
    res.status(200).json({ username: user.username, email: user.email, role: user.role, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
