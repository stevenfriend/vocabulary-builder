const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// GET textbook list
app.get('/api/books/list', (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'books.json'));
  const books = JSON.parse(data);
  res.json(books);
});

// GET vocabulary from a book
app.get('/api/vocabulary/:book', (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, 'data', `${req.params.book}.json`));
  const vocabulary = JSON.parse(data);
  res.json(vocabulary);
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Sever running on port ${PORT}`));