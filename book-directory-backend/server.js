const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
app.use(bodyParser.json());
app.use(cors());


mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected successfully to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB Atlas', err);
    process.exit(1); 
});


const bookSchema = new mongoose.Schema({
    id:String,
    title: String,
    author: String
});


const Book = mongoose.model('Book', bookSchema);


app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        console.error('Failed to fetch books from the database', err);
        res.status(500).send('Failed to fetch books');
    }
});

app.post('/api/books', async (req, res) => {
    const newBook = req.body;
    try {
        const book = new Book(newBook);
        await book.save();
        res.status(201).json(book);
    } catch (err) {
        console.error('Failed to insert book into the database', err);
        res.status(500).send('Failed to insert book');
    }
});

app.put('/api/books/:id', async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).send('No book id provided');
    }
    const updatedBook = req.body;
    if (!updatedBook) {
        return res.status(400).send('No book data provided');
    }
    try {
        const book = await Book.findByIdAndUpdate(id, updatedBook, { new: true });
        if (!book) {
            return res.status(404).send('Book not found');
        }
        res.json(book);
    } catch (err) {
        console.error('Failed to update book in the database', err);
        res.status(500).send('Failed to update book');
    }
});

app.delete('/api/books/:id', async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).send('No book id provided');
    }
    try {
        const book = await Book.findByIdAndDelete(id);
        if (!book) {
            return res.status(404).send('Book not found');
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Failed to delete book from the database', err);
        res.status(500).send('Failed to delete book');
    }
});