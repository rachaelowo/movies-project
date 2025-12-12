const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Home Page (Public)
router.get('/', (req, res) => {
    res.render('home');
});

// Dashboard (Protected)
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        user: req.user
    });
});

module.exports = router;
