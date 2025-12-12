const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load User Model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Register Page
router.get('/register', (req, res) => {
    res.render('auth/register', {
        errors: [],
        username: '',
        email: '',
        password: '',
        password2: ''
    });
});

// Register Handler
router.post('/register', async (req, res) => {
    const { username, email, password, password2 } = req.body;
    let errors = [];

    // Validation
    if (!username || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        return res.render('auth/register', { errors, username, email, password, password2 });
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            errors.push({ msg: 'Email already exists' });
            return res.render('auth/register', { errors, username, email, password, password2 });
        }

        // Create new user
        const newUser = new User({ username, email, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');

    } catch (err) {
        console.error(err);
        res.send('Server error');
    }
});

// Login Handler
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handler
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
});

module.exports = router;
