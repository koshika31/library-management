const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

const booksFilePath = path.join(__dirname, 'file', 'books.json');
const issuedBooksFilePath = path.join(__dirname, 'file', 'issued_books.json');

app.get('/api/books', (req, res) => {
    fs.readFile(booksFilePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.json([]);
            }
            return res.status(500).send('Error reading books file.');
        }
        res.json(JSON.parse(data || '[]'));
    });
});

app.get('/api/issued-books', (req, res) => {
    fs.readFile(issuedBooksFilePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.json([]);
            }
            return res.status(500).send('Error reading issued books file.');
        }
        res.json(JSON.parse(data || '[]'));
    });
});

// API to save books
app.post('/api/books', (req, res) => {
    const { data } = req.body;
    const jsonData = JSON.stringify(data || [], null, 2);
    fs.writeFile(booksFilePath, jsonData, 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error saving books file.');
        }
        res.send('Books saved successfully.');
    });
});
 
// API to save issued books
app.post('/api/issued-books', (req, res) => {
    const { data } = req.body;
    const jsonData = JSON.stringify(data || [], null, 2);
    fs.writeFile(issuedBooksFilePath, jsonData, 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error saving issued books file.');
        }
        res.send('Issued books saved successfully.');
    });
});

// Handle serving the main HTML file on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
