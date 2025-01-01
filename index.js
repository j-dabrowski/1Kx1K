import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const port = 1000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Create directories
const uploadsDir = path.join(__dirname, 'public', 'uploads');
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '../pages/index.html'));
});

app.post('/api/save-image', (req, res) => {
    const { imageData, groupId } = req.body;
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const filename = `group_${groupId}_${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, base64Data, 'base64');
    res.send(`/uploads/${filename}`);
});

app.post('/api/save-group', (req, res) => {
  const { sessionId, userId, pixels, image } = req.body;
  const sessionFile = path.join(dataDir, `session_${sessionId}.json`);
  
  let groups = [];
  if (fs.existsSync(sessionFile)) {
      groups = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      // Update existing group if it exists
      const existingGroupIndex = groups.findIndex(g => 
          JSON.stringify([...g.pixels].sort()) === JSON.stringify([...pixels].sort())
      );
      
      if (existingGroupIndex !== -1) {
          groups[existingGroupIndex] = { userId, pixels, image };
      } else {
          groups.push({ userId, pixels, image });
      }
  } else {
      groups.push({ userId, pixels, image });
  }
  
  fs.writeFileSync(sessionFile, JSON.stringify(groups, null, 2));
  res.json({ success: true });
});

app.get('/api/load-groups', (req, res) => {
    const { sessionId } = req.query;
    const sessionFile = path.join(dataDir, `session_${sessionId}.json`);
    
    if (fs.existsSync(sessionFile)) {
        const groups = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        res.json(groups);
    } else {
        res.json([]);
    }
});

app.get('/api/load-all-groups', (req, res) => {
  const allGroups = {};
  try {
      const files = fs.readdirSync(dataDir);
      files.forEach(file => {
          if (file.endsWith('.json')) {
              const sessionId = file.replace('session_', '').replace('.json', '');
              const data = fs.readFileSync(path.join(dataDir, file), 'utf8');
              allGroups[sessionId] = JSON.parse(data);
          }
      });
      res.json(allGroups);
  } catch (error) {
      console.error('Error loading groups:', error);
      res.status(500).json({ error: 'Failed to load groups' });
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));