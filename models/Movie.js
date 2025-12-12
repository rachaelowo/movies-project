const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    genres: {
        type: [String],
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        required: true
    },
    poster: {
        type: String,
        default: '' 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true      // ownership: who added the movie
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Movie', MovieSchema);
