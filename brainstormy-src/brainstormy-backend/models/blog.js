const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, {timestamps: true});

const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog;