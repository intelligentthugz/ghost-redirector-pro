const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load links from JSON
let links = {};
const linksFile = path.join(__dirname, 'links.json');
if (fs.existsSync(linksFile)) {
  links = JSON.parse(fs.readFileSync(linksFile));
}

// Admin panel (secret)
app.get('/admin', (req, res) => {
  res.render('admin', { links });
});

// Add new redirect link
app.get('/add', (req, res) => {
  const { code, url } = req.query;
  if (!code || !url) return res.send('Missing code or URL');
  links[code] = url;
  fs.writeFileSync(linksFile, JSON.stringify(links, null, 2));
  res.send(`Added link: /goto/${code}`);
});

// Redirect logic
app.get('/goto/:code', (req, res) => {
  const dest = links[req.params.code];
  if (!dest) return res.status(404).send('Not found');
  res.render('cloak', { url: dest });
});

// Root
app.get('/', (req, res) => {
  res.redirect('https://google.com'); // fallback
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
