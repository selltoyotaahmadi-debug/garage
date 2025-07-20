import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Enable CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// مسیر فایل‌های JSON
const dataPath = __dirname;

// بررسی وجود پوشه داده
try {
  if (!fs.existsSync(dataPath)) {
    try {
      fs.mkdirSync(dataPath, { recursive: true });
      console.log(`Created data directory at ${dataPath}`);
    } catch (mkdirError) {
      console.error('Error creating data directory:', mkdirError);
      console.log('Will attempt to continue without creating directory...');
    }
    console.log(`Created data directory at ${dataPath}`);
  }
} catch (error) {
  console.error('Error creating data directory:', error);
  console.log('Continuing without creating directory...');
}

// خواندن فایل JSON
app.get('/api.php', (req, res) => {
  const file = req.query.file;
  
  if (!file) {
    return res.status(400).json({ error: 'File parameter is required' });
  }
  
  const filePath = path.join(dataPath, `${file}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      console.log(`Read file: ${filePath}`);
      res.json(JSON.parse(data));
    } else {
      console.log(`File not found, creating default: ${filePath}`);
      // اگر فایل وجود نداشت، یک فایل خالی ایجاد کنید
      let defaultContent = {};
      
      // اگر فایل users.json بود، کاربر پیش‌فرض را اضافه کن
      if (file === 'users') {
        defaultContent = {
          users: [
            {
              id: "1",
              username: "admin",
              password: "123456",
              name: "مدیر سیستم",
              role: "admin",
              isActive: true,
              createdAt: new Date().toISOString()
            },
            {
              id: "2",
              username: "amir",
              password: "123456",
              name: "امیر اسد پور",
              role: "mechanic",
              isActive: true,
              createdAt: new Date().toISOString()
            },
            {
              id: "3",
              username: "mohammad",
              password: "123456",
              name: "محمد ده ده بزرگی",
              role: "mechanic",
              isActive: true,
              createdAt: new Date().toISOString()
            },
            {
              id: "4",
              username: "reza",
              password: "123456",
              name: "رضا کرمی",
              role: "mechanic",
              isActive: true,
              createdAt: new Date().toISOString()
            },
            {
              id: "5",
              username: "arian",
              password: "123456",
              name: "آریان پیشرو",
              role: "warehouse",
              isActive: true,
              createdAt: new Date().toISOString()
            },
            {
              id: "6",
              username: "sajad",
              password: "123456",
              name: "سجاد کیوان شکوه",
              role: "warehouse",
              isActive: true,
              createdAt: new Date().toISOString()
            }
          ]
        };
      } else if (file === 'customers') {
        defaultContent = { customers: [] };
      } else if (file === 'vehicles') {
        defaultContent = { vehicles: [] };
      } else if (file === 'jobCards') {
        defaultContent = { jobCards: [] };
      } else if (file === 'inventory') {
        defaultContent = { inventory: [] };
      } else if (file === 'suppliers') {
        defaultContent = { suppliers: [] };
      } else if (file === 'partRequests') {
        defaultContent = { partRequests: [] };
      } else if (file === 'vehicleDamages') {
        defaultContent = { vehicleDamages: [] };
      } else if (file === 'session') {
        defaultContent = { currentUser: null };
      }
      
      fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
      res.json(defaultContent);
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file', details: error.message });
  }
});

// نوشتن در فایل JSON
app.post('/api.php', (req, res) => {
  const file = req.query.file;
  
  if (!file) {
    return res.status(400).json({ error: 'File parameter is required' });
  }
  
  const data = req.body;
  
  if (!data) {
    return res.status(400).json({ error: 'No data provided' });
  }
  
  const filePath = path.join(dataPath, `${file}.json`);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Wrote file: ${filePath}`);
    res.json({ success: true, file: filePath });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file', details: error.message });
  }
});

// Serve static files from the 'dist' directory
app.use('/', express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Data directory: ${dataPath}`);
});