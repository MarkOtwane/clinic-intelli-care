const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  }),
);
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
    role: 'ADMIN',
  },
  {
    id: 2,
    email: 'doctor@clinic.com',
    password: 'doctor123',
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    role: 'DOCTOR',
  },
  {
    id: 3,
    email: 'patient@clinic.com',
    password: 'patient123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'PATIENT',
  },
];

// Mock JWT token (in production, use real JWT)
const generateMockToken = (user) => {
  return `mock-token-${user.id}-${Date.now()}`;
};

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const token = generateMockToken(user);
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    accessToken: token,
    user: userWithoutPassword,
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, role = 'PATIENT' } = req.body;

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({
      message: 'User already exists',
    });
  }

  const newUser = {
    id: users.length + 1,
    email,
    password,
    firstName: 'New',
    lastName: 'User',
    role: role.toUpperCase(),
  };

  users.push(newUser);
  const token = generateMockToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;

  res.json({
    accessToken: token,
    user: userWithoutPassword,
  });
});

app.post('/api/auth/refresh', (req, res) => {
  // Mock refresh - just generate a new token
  const token = generateMockToken({ id: 1 });
  const user = users[0];
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    accessToken: token,
    user: userWithoutPassword,
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

// Mock doctor data
const doctors = [
  {
    id: 2,
    name: 'Dr. Jane Smith',
    specialization: 'Cardiology',
    bio: 'Experienced cardiologist with 15 years of practice',
    phone: '+1234567892',
    experience: 15,
    available: true,
    email: 'doctor@clinic.com',
    licenseNumber: 'MD123456',
    hospital: 'General Hospital',
    totalPatients: 150,
    totalAppointments: 450,
    rating: 4.8,
    createdAt: '2020-01-01',
    updatedAt: '2023-12-01',
  },
];

app.get('/api/doctors/:id', (req, res) => {
  const doctorId = parseInt(req.params.id);
  const doctor = doctors.find((d) => d.id === doctorId);

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  res.json(doctor);
});

app.get('/api/doctors/:id/stats', (req, res) => {
  res.json({
    totalPatients: 150,
    totalAppointments: 450,
    todayAppointments: 3,
    pendingPrescriptions: 2,
  });
});

app.get('/api/patients', (req, res) => {
  res.json([]);
});

// Mock patient data
const patients = [
  {
    id: 3,
    firstName: 'John',
    lastName: 'Doe',
    email: 'patient@clinic.com',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    bloodGroup: 'O+',
    allergies: ['Penicillin'],
    conditions: ['Hypertension'],
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1234567891',
    },
    insuranceInfo: {
      provider: 'Health Insurance Co',
      policyNumber: 'POL123456',
      groupNumber: 'GRP789',
    },
    medicalHistory: [
      {
        id: 1,
        date: '2023-01-15',
        diagnosis: 'Hypertension',
        treatment: 'Lisinopril 10mg daily',
        notes: 'Blood pressure controlled',
        doctorId: 2,
        doctorName: 'Dr. Jane Smith',
      },
    ],
    lastVisit: '2023-12-01',
    totalAppointments: 5,
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2023-12-01',
  },
];

app.get('/api/patients/:id', (req, res) => {
  const patientId = parseInt(req.params.id);
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  res.json(patient);
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
  console.log('Test users:');
  console.log('Admin: admin@clinic.com / admin123');
  console.log('Doctor: doctor@clinic.com / doctor123');
  console.log('Patient: patient@clinic.com / patient123');
});
