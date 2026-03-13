import api from './api';

// Appointment services
export const appointmentService = {
  // Get all appointments
  getAll: async () => {
    try {
      const response = await api.get('/appointments');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get appointments for current user
  getUserAppointments: async (userId) => {
    try {
      const response = await api.get(`/appointments/user/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Create new appointment
  create: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update appointment
  update: async (id, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete appointment
  delete: async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get available slots for a doctor and date
  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await api.get(`/appointments/slots/${doctorId}/${date}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// Doctor services
export const doctorService = {
  // Get all doctors
  getAll: async () => {
    try {
      const response = await api.get('/doctors');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get doctor by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/doctors/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get doctors by specialty
  getBySpecialty: async (specialty) => {
    try {
      const response = await api.get(`/doctors/specialty/${specialty}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get doctors by location
  getByLocation: async (city) => {
    try {
      const response = await api.get(`/doctors/city/${city}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Search doctors
  search: async (query) => {
    try {
      const response = await api.get(`/doctors/search?q=${encodeURIComponent(query)}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// Patient services
export const patientService = {
  // Get all patients
  getAll: async () => {
    try {
      const response = await api.get('/patients');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get patient by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update patient profile
  update: async (id, patientData) => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// Message services
export const messageService = {
  // Get messages for a patient
  getPatientMessages: async (patientId) => {
    try {
      const response = await api.get(`/messages/patient/${patientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Send message to patient
  sendToPatient: async (messageData) => {
    try {
      const response = await api.post('/messages', messageData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};
