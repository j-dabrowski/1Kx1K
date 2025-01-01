import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const port = 1000;

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.use(express.json({limit: '50mb'}));

// Serve the HTML file at the root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '../pages/index.html'));
});

// Start the server
app.listen(port, () => {
console.log(`Server running at http://localhost:${port}`);
});

app.post('/api/save-image', (req, res) => {
    const { imageData, groupId } = req.body;
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `group_${groupId}_${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, base64Data, 'base64');
    
    res.send(`/uploads/${filename}`);
});