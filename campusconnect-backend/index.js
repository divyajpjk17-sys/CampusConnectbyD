const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

// Setup Multer for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

// Helper to read data
const readData = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// Helper to write data
const writeData = (filename, data) => {
  const filePath = path.join(__dirname, 'data', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- Endpoints ---

// Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Users & Auth
app.get('/api/users', (req, res) => res.json(readData('users.json')));
app.get('/api/users/:id', (req, res) => {
  const users = readData('users.json');
  const user = users.find(u => u.id === req.params.id);
  user ? res.json(user) : res.status(404).json({ error: 'Not found' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readData('users.json');
  const user = users.find(u => u.email === email && u.password === password);
  user ? res.json(user) : res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/register', (req, res) => {
  const newUser = req.body;
  const users = readData('users.json');
  newUser.id = Date.now().toString();
  users.push(newUser);
  writeData('users.json', users);
  res.json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const users = readData('users.json');
  const index = users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    writeData('users.json', users);
    res.json(users[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const createPostEndpoint = (resourceName) => {
  const filename = `${resourceName}.json`;
  
  app.get(`/api/${resourceName}`, (req, res) => {
    res.json(readData(filename));
  });

  app.post(`/api/${resourceName}`, (req, res) => {
    const newItem = req.body;
    const items = readData(filename);
    newItem.id = Date.now().toString();
    newItem.createdAt = new Date().toISOString();
    
    if (resourceName === 'lost-found') {
      const users = readData('users.json');
      let notifs = readData('notifications.json');
      users.forEach(u => {
        if (u.id !== newItem.userId) {
          notifs.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: u.id,
            actorId: newItem.userId,
            actorName: newItem.authorName,
            actorAvatar: newItem.authorAvatar,
            type: 'lost_found',
            message: `${newItem.authorName} posted a Lost & Found item.`,
            createdAt: new Date().toISOString(),
            read: false
          });
        }
      });
      writeData('notifications.json', notifs);
    }
    
    items.unshift(newItem);
    writeData(filename, items);
    res.json(newItem);
  });

  app.put(`/api/${resourceName}/:id`, (req, res) => {
    const items = readData(filename);
    const index = items.findIndex(i => i.id === req.params.id);
    if (index !== -1) {
      items[index] = { ...items[index], ...req.body };
      writeData(filename, items);
      res.json(items[index]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  app.delete(`/api/${resourceName}/:id`, (req, res) => {
    let items = readData(filename);
    const itemExists = items.find(i => i.id === req.params.id);
    if (itemExists) {
      items = items.filter(i => i.id !== req.params.id);
      writeData(filename, items);

      // Cascade delete
      const postId = req.params.id;
      
      let comments = readData('comments.json');
      comments = comments.filter(c => c.postId !== postId);
      writeData('comments.json', comments);

      let likes = readData('likes.json');
      likes = likes.filter(l => l.postId !== postId);
      writeData('likes.json', likes);

      let saved = readData('savedposts.json');
      saved = saved.filter(s => s.postId !== postId);
      writeData('savedposts.json', saved);

      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });
};

createPostEndpoint('posts');
createPostEndpoint('internships');
createPostEndpoint('stories');
createPostEndpoint('blogs');
createPostEndpoint('lost-found');


// Comments
app.get('/api/comments', (req, res) => res.json(readData('comments.json')));
app.get('/api/comments/:postId', (req, res) => {
  const comments = readData('comments.json');
  res.json(comments.filter(c => c.postId === req.params.postId));
});
app.post('/api/comments', (req, res) => {
  const newComment = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
  const comments = readData('comments.json');
  comments.push(newComment);
  writeData('comments.json', comments);
  
  // Increment post comment count
  const postTypes = ['posts', 'internships', 'stories', 'blogs', 'lost-found'];
  for (let type of postTypes) {
    const items = readData(`${type}.json`);
    const item = items.find(i => i.id === req.body.postId);
    if (item) {
      item.comments = (item.comments || 0) + 1;
      writeData(`${type}.json`, items);
      break;
    }
  }
  res.json(newComment);
});
app.delete('/api/comments/:id', (req, res) => {
  let comments = readData('comments.json');
  comments = comments.filter(c => c.id !== req.params.id);
  writeData('comments.json', comments);
  res.json({ success: true });
});

// Likes
app.get('/api/likes', (req, res) => res.json(readData('likes.json')));
app.post('/api/likes', (req, res) => {
  const { postId, userId } = req.body;
  let likes = readData('likes.json');
  const existing = likes.find(l => l.postId === postId && l.userId === userId);
  
  if (existing) {
    likes = likes.filter(l => l.id !== existing.id);
  } else {
    likes.push({ id: Date.now().toString(), postId, userId, createdAt: new Date().toISOString() });
  }
  writeData('likes.json', likes);

  // Update post like count
  const postTypes = ['posts', 'internships', 'stories', 'blogs', 'lost-found'];
  let currentLikes = 0;
  for (let type of postTypes) {
    const items = readData(`${type}.json`);
    const item = items.find(i => i.id === postId);
    if (item) {
      item.likes = existing ? Math.max(0, (item.likes || 1) - 1) : (item.likes || 0) + 1;
      currentLikes = item.likes;
      writeData(`${type}.json`, items);
      break;
    }
  }
  res.json({ liked: !existing, currentLikes });
});

// Saved Posts
app.get('/api/saved', (req, res) => res.json(readData('savedposts.json')));
app.post('/api/saved', (req, res) => {
  const { postId, userId } = req.body;
  let saved = readData('savedposts.json');
  const existing = saved.find(s => s.postId === postId && s.userId === userId);
  
  if (existing) {
    saved = saved.filter(s => s.id !== existing.id);
  } else {
    saved.push({ id: Date.now().toString(), postId, userId, createdAt: new Date().toISOString() });
  }
  writeData('savedposts.json', saved);
  res.json({ saved: !existing });
});

// Connections
app.get('/api/connections', (req, res) => res.json(readData('connections.json')));
app.post('/api/connections', (req, res) => {
  const { fromUserId, toUserId, action } = req.body; // action: 'request', 'accept', 'decline'
  let connections = readData('connections.json');
  
  if (action === 'request') {
    const exists = connections.find(c => c.fromUserId === fromUserId && c.toUserId === toUserId);
    if (!exists) {
      connections.push({ id: Date.now().toString(), fromUserId, toUserId, status: 'pending', createdAt: new Date().toISOString() });
    }
  } else if (action === 'accept') {
    const conn = connections.find(c => c.fromUserId === fromUserId && c.toUserId === toUserId);
    if (conn) conn.status = 'accepted';
  } else if (action === 'decline') {
    connections = connections.filter(c => !(c.fromUserId === fromUserId && c.toUserId === toUserId));
  }
  writeData('connections.json', connections);
  res.json({ success: true });
});

// Messages
app.get('/api/messages', (req, res) => res.json(readData('messages.json')));
app.post('/api/messages', (req, res) => {
  const msg = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString(), read: false };
  const messages = readData('messages.json');
  messages.push(msg);
  writeData('messages.json', messages);
  res.json(msg);
});

// Notifications
app.get('/api/notifications', (req, res) => res.json(readData('notifications.json')));
app.post('/api/notifications', (req, res) => {
  const notif = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString(), read: false };
  const notifications = readData('notifications.json');
  notifications.unshift(notif);
  writeData('notifications.json', notifications);
  res.json(notif);
});
app.put('/api/notifications/:id', (req, res) => {
  const notifications = readData('notifications.json');
  const index = notifications.findIndex(n => n.id === req.params.id);
  if (index !== -1) {
    notifications[index] = { ...notifications[index], ...req.body };
    writeData('notifications.json', notifications);
    res.json(notifications[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
