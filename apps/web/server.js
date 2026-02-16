const express = require('express');
const path = require('path');
const app = express();

// Serve PVT mockup (must be before static files)
app.get('/pvt', (req, res) => {
  res.sendFile(path.join(__dirname, '../../PVT/ludus-interactive-mockup.html'));
});

// Serve static files from the React app build directory (excluding /pvt)
app.use(express.static(path.join(__dirname, 'build'), {
  index: false // Don't serve index.html automatically
}));

// Set correct MIME types for CSS and JS files
app.use('/static/css', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
});

app.use('/static/js', (req, res, next) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
});

app.use('/static/media', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
});

// Handle React routing, return all requests to React app (except /pvt)
app.use((req, res) => {
  if (req.path === '/pvt') {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
