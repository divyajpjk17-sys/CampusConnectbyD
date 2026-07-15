const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const writeData = (filename, data) => {
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2));
};

// V2 Users
const users = [
  { id: '1', name: 'Aditya Sharma', email: 'aditya@student.edu', password: 'password', college: 'Campus Connect Community', department: 'B.Tech CSE', year: 'Final Year', bio: 'AI Enthusiast and Open Source Contributor. Building the future.', avatar: 'https://ui-avatars.com/api/?name=Aditya+Sharma&background=14532D&color=fff' },
  { id: '2', name: 'Priya Nair', email: 'priya@student.edu', password: 'password', college: 'Campus Connect Community', department: 'B.Tech ECE', year: '3rd Year', bio: 'Hardware hacking and IoT.', avatar: 'https://ui-avatars.com/api/?name=Priya+Nair&background=14532D&color=fff' },
  { id: '3', name: 'Rahul Kumar', email: 'rahul@student.edu', password: 'password', college: 'Campus Connect Community', department: 'BSc Physics', year: '2nd Year', bio: 'Exploring the cosmos one equation at a time.', avatar: 'https://ui-avatars.com/api/?name=Rahul+Kumar&background=14532D&color=fff' },
  { id: '4', name: 'Divya Darshini', email: 'divya@student.edu', password: 'password', college: 'Campus Connect Community', department: 'MCA', year: '1st Year', bio: 'Web dev and coffee.', avatar: 'https://ui-avatars.com/api/?name=Divya+Darshini&background=14532D&color=fff' },
  { id: '5', name: 'Megha Joseph', email: 'megha@student.edu', password: 'password', college: 'Campus Connect Community', department: 'BBA', year: 'Final Year', bio: 'Marketing & Strategy.', avatar: 'https://ui-avatars.com/api/?name=Megha+Joseph&background=14532D&color=fff' },
  { id: '6', name: 'Arjun Patel', email: 'arjun@student.edu', password: 'password', college: 'Campus Connect Community', department: 'B.Tech IT', year: '3rd Year', bio: 'Cybersecurity researcher.', avatar: 'https://ui-avatars.com/api/?name=Arjun+Patel&background=14532D&color=fff' }
];

// Generate Posts
const posts = [
  { id: '101', userId: '1', authorName: 'Aditya Sharma', authorAvatar: users[0].avatar, college: users[0].college, department: users[0].department, content: 'Just launched my new machine learning framework! 🚀 Check it out on my GitHub.', category: 'Project', likes: 120, comments: 15, imageUrl: '', createdAt: new Date().toISOString() },
  { id: '102', userId: '4', authorName: 'Divya Darshini', authorAvatar: users[3].avatar, college: users[3].college, department: users[3].department, content: 'Anyone else struggling with the Advanced OS assignment? 😭', category: 'General', likes: 45, comments: 22, imageUrl: '', createdAt: new Date(Date.now() - 86400000).toISOString() }
];

// Internships
const internships = [
  { id: '201', userId: '2', authorName: 'Priya Nair', authorAvatar: users[1].avatar, college: users[1].college, department: users[1].department, company: 'Google', role: 'Hardware Intern', description: 'Google is hiring summer interns for their hardware division. Great opportunity!', category: 'Opportunity', likes: 80, comments: 5, imageUrl: '', createdAt: new Date().toISOString() }
];

// Stories
const stories = [
  { id: '301', userId: '5', authorName: 'Megha Joseph', authorAvatar: users[4].avatar, college: users[4].college, department: users[4].department, content: 'How I balanced academics and my startup during my final year.', category: 'Story', likes: 300, comments: 45, imageUrl: '', createdAt: new Date().toISOString() }
];

// Blogs
const blogs = [
  { id: '501', userId: '3', authorName: 'Rahul Kumar', authorAvatar: users[2].avatar, college: users[2].college, department: users[2].department, title: 'The Future of Quantum Computing', content: 'Quantum computing is rapidly evolving...', category: 'Tech', likes: 50, comments: 10, imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80', createdAt: new Date().toISOString() }
];

// Lost & Found
const lostFound = [
  { id: '601', userId: '6', authorName: 'Arjun Patel', authorAvatar: users[5].avatar, college: users[5].college, department: users[5].department, type: 'lost', content: 'Lost my AirPods in Library Block B. Please DM if found!', category: 'Lost', likes: 5, comments: 2, imageUrl: '', contact: 'arjun@student.edu', createdAt: new Date().toISOString() }
];

// Comments
const comments = [
  { id: 'c1', postId: '101', userId: '4', authorName: 'Divya Darshini', authorAvatar: users[3].avatar, content: 'This looks amazing! Starred it.', createdAt: new Date().toISOString() }
];

// Likes
const likes = [
  { id: 'l1', postId: '101', userId: '4', createdAt: new Date().toISOString() }
];

// Saved Posts
const savedposts = [];

// Messages
const messages = [
  { id: 'm1', fromUserId: '4', toUserId: '1', content: 'Hey Aditya, loved your new ML framework!', read: false, createdAt: new Date().toISOString() },
  { id: 'm2', fromUserId: '1', toUserId: '4', content: 'Thanks Divya! Let me know if you want to contribute.', read: true, createdAt: new Date().toISOString() }
];

// Connections
const connections = [
  { id: 'conn1', fromUserId: '1', toUserId: '4', status: 'accepted', createdAt: new Date().toISOString() }
];

// Notifications
const notifications = [
  { id: 'n1', userId: '1', message: 'Divya Darshini liked your post.', type: 'like', isRead: false, createdAt: new Date().toISOString() }
];

writeData('users.json', users);
writeData('posts.json', posts);
writeData('internships.json', internships);
writeData('stories.json', stories);
writeData('notifications.json', notifications);
writeData('blogs.json', blogs);
writeData('lost-found.json', lostFound);
writeData('comments.json', comments);
writeData('likes.json', likes);
writeData('savedposts.json', savedposts);
writeData('messages.json', messages);
writeData('connections.json', connections);

console.log('CampusConnect V2 Fake data generated successfully!');
