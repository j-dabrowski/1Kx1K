import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 1000;

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the HTML file at the root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '../pages/index.html'));
});

// Start the server
app.listen(port, () => {
console.log(`Server running at http://localhost:${port}`);
});