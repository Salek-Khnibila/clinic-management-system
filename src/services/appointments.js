import api from './api';

// Appointment services
export const appointmentService = {
  // Get all appointments
  getAll: async () => {
    try {
      const response = await api.get('/appointments');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Get appointments for current user
  getUserAppointments: async (userId) => {
    try {
      const response = await api.get(`/appointments/user/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Create new appointment
  create: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Update appointment
  update: async (id, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Delete appointment
  delete: async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Get available slots for a doctor and date
  getAvailableSlots: async (doctorId, date) => {
    try {
      const response = await api.get(`/appointments/slots/${doctorId}/${date}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },
};
