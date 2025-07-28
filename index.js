const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load or create links.json
let links = {};
const filePath = path.join(__dirname, 'links.json');
if (fs.existsSync(filePath)) {
  links = JSON.parse(fs.readFileSync(filePath));
} else {
  fs.writeFileSync(filePath, JSON.stringify(links));
}

// Admin Panel (with static HTML)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Add a redirect link
app.post('/add', (req, res) => {
  const { code, url } = req.body;
  if (!code || !url) {
    return res.status(400).send('Code and URL are required.');
  }
  links[code] = url;
  fs.writeFileSync(filePath, JSON.stringify(links, null, 2));
  res.send(`Redirect added: /goto/${code}`);
});

// Handle redirection
app.get('/goto/:code', (req, res) => {
  const code = req.params.code;
  const url = links[code];
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).send('Redirect code not found.');
  }
});

app.listen(PORT, () => {
  console.log(`Ghost Redirector PRO+ is running on port ${PORT}`);
});
