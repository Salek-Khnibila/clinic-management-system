import api from './api';

// ═══════════════════════════════════════
// Appointment services
// ═══════════════════════════════════════
export const appointmentService = {
  // Get all appointments (admin / secretary view)
  getAll: async () => {
    try {
      const response = await api.get('/appointments');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Get appointments for a specific user (patient or doctor)
  getUserAppointments: async (userId) => {
    try {
      const response = await api.get(`/appointments/user/${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Create new appointment
  create: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Update appointment (statut, date, arrivee …)
  update: async (id, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Permanently delete an appointment
  delete: async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Get available slots for a doctor on a given date
  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await api.get(`/appointments/slots/${doctorId}/${date}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },
};

// ═══════════════════════════════════════
// Doctor services
// ═══════════════════════════════════════
export const doctorService = {
  getAll: async () => {
    try {
      const response = await api.get('/doctors');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/doctors/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getBySpecialty: async (specialty) => {
    try {
      const response = await api.get(`/doctors/specialty/${encodeURIComponent(specialty)}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getByCity: async (city) => {
    try {
      const response = await api.get(`/doctors/city/${encodeURIComponent(city)}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  search: async (query) => {
    try {
      const response = await api.get(`/doctors/search?q=${encodeURIComponent(query)}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },
};

// ═══════════════════════════════════════
// Patient services
// ═══════════════════════════════════════
export const patientService = {
  getAll: async () => {
    try {
      const response = await api.get('/patients');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  update: async (id, patientData) => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },
};

// ═══════════════════════════════════════
// Message services
// ═══════════════════════════════════════
export const messageService = {
  // Get all messages (secretary / admin view)
  getAllMessages: async () => {
    try {
      const response = await api.get('/messages');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Get messages for a specific patient
  getPatientMessages: async (patientId) => {
    try {
      const response = await api.get(`/messages/patient/${patientId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Send message to a patient
  sendToPatient: async (messageData) => {
    try {
      // 🔥 Validation des champs requis
      const requiredFields = ['sender', 'to_patient_id', 'sujet', 'corps'];
      const missing = requiredFields.filter(field => !messageData[field]);
      
      if (missing.length > 0) {
        return { 
          success: false, 
          message: `Champs manquants: ${missing.join(', ')}` 
        };
      }

      // 🔥 Validation des types
      if (typeof messageData.to_patient_id !== 'number') {
        return { 
          success: false, 
          message: 'to_patient_id doit être un nombre' 
        };
      }

      if (typeof messageData.sender !== 'string' || messageData.sender.trim() === '') {
        return { 
          success: false, 
          message: 'sender doit être une chaîne de caractères non vide' 
        };
      }

      // 🔥 Nettoyage des données
      const cleanedData = {
        sender: messageData.sender.trim(),
        to_patient_id: parseInt(messageData.to_patient_id),
        sujet: messageData.sujet.trim(),
        corps: messageData.corps.trim(),
        date: messageData.date || new Date().toISOString().split('T')[0]
      };

      const response = await api.post('/messages', cleanedData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Mark a message as read
  markAsRead: async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },
};
