# Backend API Documentation

This document describes the required API endpoints for the clinic management system.

## Base URL
```
http://localhost:3001/api
```

## Authentication Endpoints

### POST /auth/login
**Description**: Authenticate user and return JWT tokens
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "patient|medecin|secretaire"
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "prenom": "Ahmed",
    "nom": "Alami",
    "email": "patient@clinique.ma",
    "role": "patient"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def50200-..."
}
```

### POST /auth/register
**Description**: Register new user
**Request Body**:
```json
{
  "prenom": "John",
  "nom": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient"
}
```

### POST /auth/refresh
**Description**: Refresh JWT access token
**Request Body**:
```json
{
  "refreshToken": "def50200-..."
}
```

### POST /auth/forgot-password
**Description**: Request password reset
**Request Body**:
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
**Description**: Reset password with token
**Request Body**:
```json
{
  "token": "reset-token-here",
  "newPassword": "newPassword123"
}
```

## Appointment Endpoints

### GET /appointments
**Description**: Get all appointments
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2025-03-10",
      "heure": "09:00",
      "motif": "Douleur thoracique",
      "statut": "confirmé",
      "patient_id": 1,
      "medecin_id": 1,
      "arrivee": "en salle"
    }
  ]
}
```

### GET /appointments/user/:userId
**Description**: Get appointments for specific user

### POST /appointments
**Description**: Create new appointment
**Request Body**:
```json
{
  "medecin_id": 1,
  "patient_id": 1,
  "date": "2025-03-15",
  "heure": "10:30",
  "motif": "Consultation générale",
  "statut": "en attente"
}
```

### PUT /appointments/:id
**Description**: Update appointment
**Request Body**: Any appointment field to update

### DELETE /appointments/:id
**Description**: Cancel/delete appointment

### GET /appointments/slots/:doctorId/:date
**Description**: Get available time slots for doctor on specific date
**Response**:
```json
{
  "success": true,
  "data": {
    "morning": ["08:00", "08:30", "09:00"],
    "afternoon": ["14:00", "14:30", "15:00"]
  }
}
```

## Doctor Endpoints

### GET /doctors
**Description**: Get all doctors
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "prenom": "Hassan",
      "nom": "Karim",
      "specialite": "Cardiologie",
      "ville": "Casablanca",
      "note": 4.8,
      "avis": 124,
      "dispo": true,
      "tarif": "300 MAD",
      "exp": "15 ans"
    }
  ]
}
```

### GET /doctors/:id
**Description**: Get doctor by ID

### GET /doctors/specialty/:specialty
**Description**: Get doctors by specialty

### GET /doctors/city/:city
**Description**: Get doctors by city

### GET /doctors/search?q=query
**Description**: Search doctors by name

## Patient Endpoints

### GET /patients
**Description**: Get all patients

### GET /patients/:id
**Description**: Get patient by ID

### PUT /patients/:id
**Description**: Update patient information

## Message Endpoints

### GET /messages
**Description**: Get all messages

### GET /messages/patient/:patientId
**Description**: Get messages for specific patient

### POST /messages
**Description**: Send message to patient
**Request Body**:
```json
{
  "to_patient_id": 1,
  "sujet": "Rappel RDV",
  "corps": "Message content here...",
  "from": "secretaire"
}
```

### PUT /messages/:id/read
**Description**: Mark message as read

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  prenom VARCHAR(100),
  nom VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('patient', 'medecin', 'secretaire'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE,
  heure TIME,
  motif TEXT,
  statut ENUM('en attente', 'confirmé', 'annulé', 'reporté'),
  patient_id INT,
  medecin_id INT,
  arrivee ENUM('en attente', 'en salle', 'absent'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (medecin_id) REFERENCES users(id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  from VARCHAR(50),
  to_patient_id INT,
  sujet VARCHAR(255),
  corps TEXT,
  date DATE,
  lu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (to_patient_id) REFERENCES users(id)
);
```

## Error Responses
All endpoints should return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## Security Notes
- Use JWT tokens with 24-hour expiration
- Implement rate limiting (100 requests per minute)
- Hash passwords with bcrypt
- Validate all input data
- Use HTTPS in production
