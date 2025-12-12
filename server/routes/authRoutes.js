const express = require('express');
const router = express.Router();        // <-- REQUIRED
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    let isMatch = false;

    // If password in DB is hashed (starts with $2...), use bcrypt
    if (user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password);
    } 
    // Otherwise compare plain-text password directly
    else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;                // <-- REQUIRED EXPORT
