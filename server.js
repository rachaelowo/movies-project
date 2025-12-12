const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();


require('./config/passport')(passport);


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));


app.use(methodOverride('_method'));

app.use(
    session({
        secret: 'secret',                
        resave: false,                   
        saveUninitialized: false,        
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7 
        }
    })
);


app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
    if (req.session) req.session.touch();
    next();
});

app.use(flash());


app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null; 
    next();
});


app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/movies', require('./routes/movies'));


app.get('/auth/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
