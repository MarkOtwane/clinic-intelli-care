const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock user data
const users = [
  {
    id: 1,
    email: 'admin@clinic.com',
    password: 'admin123', // In production, this would be hashed
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  },
  {
    id: 2,
    email: 'doctor@clinic.com',
    password: 'doctor123',
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    role: 'DOCTOR'
  },
  {
    id: 3,
    email: 'patient@clinic.com',
    password: 'patient123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'PATIENT'
  }
];

// Mock JWT token (in production, use real JWT)
const generateMockToken = (user) => {
  return `mock-token-${user.id}-${Date.now()}`;
};

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      message: 'Invalid credentials'
    });
  }
  
  const token = generateMockToken(user);
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    accessToken: token,
    user: userWithoutPassword
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, role = 'PATIENT' } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      message: 'User already exists'
    });
  }
  
  const newUser = {
    id: users.length + 1,
    email,
    password,
    firstName: 'New',
    lastName: 'User',
    role: role.toUpperCase()
  };
  
  users.push(newUser);
  const token = generateMockToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.json({
    accessToken: token,
    user: userWithoutPassword
  });
});

app.post('/api/auth/refresh', (req, res) => {
  // Mock refresh - just generate a new token
  const token = generateMockToken({ id: 1 });
  const user = users[0];
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    accessToken: token,
    user: userWithoutPassword
  });
});

app.get('/api/auth/me', (req, res) => {
  // In a real app, you'd verify the JWT token here
  // For mock purposes, return the first user
  const user = users[0];
  const { password: _, ...userWithoutPassword } = user;
  
  res.json(userWithoutPassword);
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Mock notification endpoint
app.get('/api/notifications/unread-count/:userId', (req, res) => {
  res.json(3); // Mock 3 unread notifications
});

// Mock other endpoints that might be called
app.get('/api/blogs', (req, res) => {
  res.json([]);
});

app.get('/api/doctors', (req, res) => {
  res.json([]);
});

app.get('/api/patients', (req, res) => {
  res.json([]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
  console.log('Test users:');
  console.log('Admin: admin@clinic.com / admin123');
  console.log('Doctor: doctor@clinic.com / doctor123');
  console.log('Patient: patient@clinic.com / patient123');
});