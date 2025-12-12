const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { ensureAuthenticated } = require('../middleware/auth');


router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find().populate('user');
        res.render('movies/index', { movies });
    } catch (error) {
        console.log(error);
        res.send('Error loading movies');
    }
});

// GET: New movie form (protected)
router.get('/new', ensureAuthenticated, (req, res) => {
    res.render('movies/new', {
        title: '',
        description: '',
        year: '',
        genres: '',
        rating: '',
        poster: '',
        errors: []
    });
});

// POST: Create new movie (protected)
router.post('/', ensureAuthenticated, async (req, res) => {
    const { title, description, year, genres, rating, poster } = req.body;

    let errors = [];

    // Validation
    if (!title || !description || !year || !genres || !rating) {
        errors.push({ msg: 'Please fill all required fields' });
    }

    if (errors.length > 0) {
        return res.render('movies/new', {
            errors,
            title,
            description,
            year,
            genres,
            rating,
            poster
        });
    }

    try {
        const newMovie = new Movie({
            title,
            description,
            year,
            genres: genres.split(',').map(g => g.trim()),
            rating,
            poster,
            user: req.user.id
        });

        await newMovie.save();
        req.flash('success_msg', 'Movie added successfully');
        res.redirect('/movies');
    } catch (error) {
        console.log(error);
        res.send('Error saving movie');
    }
});

// GET: Show movie details
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).populate('user');
        if (!movie) return res.send('Movie not found');
        res.render('movies/show', { movie });
    } catch (error) {
        console.log(error);
        res.send('Error loading movie');
    }
});

// GET: Edit movie form (protected + ownership)
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.send('Movie not found');

        // Ownership check
        if (movie.user.toString() !== req.user.id) {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('/movies');
        }

        res.render('movies/edit', { 
            movie,
            errors: [] // optional if you want validation feedback in edit form
        });
    } catch (error) {
        console.log(error);
        res.send('Error loading edit page');
    }
});

// PUT: Update movie
router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.send('Movie not found');

        // Ownership check
        if (movie.user.toString() !== req.user.id) {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('/movies');
        }

        const { title, description, year, genres, rating, poster } = req.body;

        movie.title = title;
        movie.description = description;
        movie.year = year;
        movie.genres = genres.split(',').map(g => g.trim());
        movie.rating = rating;
        movie.poster = poster;

        await movie.save();

        req.flash('success_msg', 'Movie updated successfully');
        res.redirect('/movies/' + movie.id);
    } catch (error) {
        console.log(error);
        res.send('Error updating movie');
    }
});

// DELETE: Movie
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.send('Movie not found');

        // Ownership check
        if (movie.user.toString() !== req.user.id) {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('/movies');
        }

        await Movie.findByIdAndDelete(req.params.id);

        req.flash('success_msg', 'Movie deleted successfully');
        res.redirect('/movies');
    } catch (error) {
        console.log(error);
        res.send('Error deleting movie');
    }
});

module.exports = router;
