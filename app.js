const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


let books = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 299 },
  { id: 2, title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', price: 250 }
];

// GET /books - retrieve all books
app.get('/books', (req, res) => {
  res.json(books);
});


app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json(book);
});


app.post('/books', (req, res) => {
  const { title, author, price } = req.body;
  if (!title || !author || price === undefined || price === '' || isNaN(price)) {
    return res.status(400).json({ message: 'Title, author and a valid price are required' });
  }
  const newBook = {
    id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
    title,
    author,
    price: Number(price)
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  const { title, author, price } = req.body;
  if (title) book.title = title;
  if (author) book.author = author;
  if (price !== undefined && price !== '') {
    if (isNaN(price)) {
      return res.status(400).json({ message: 'Price must be a number' });
    }
    book.price = Number(price);
  }
  res.json(book);
});


app.delete('/books/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }
  const deletedBook = books.splice(index, 1);
  res.json({ message: 'Book deleted', book: deletedBook[0] });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});