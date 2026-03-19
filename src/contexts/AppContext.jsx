import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { appointmentService, doctorService, patientService, messageService } from "../services/data.js";

const AppCtx = createContext(null);

export const useApp = () => useContext(AppCtx);

export const AppProvider = ({ children }) => {
  const [rdvs, setRdvs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Get current user from JWT or localStorage
        const token = localStorage.getItem('token');
        let currentUser = null;
        
        if (token) {
          // Decode JWT to get user ID (handle both id and sub)
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUser = payload;
          console.log("RAW USER PAYLOAD:", currentUser);
          
          // Normalize user ID (handle both id and sub)
          currentUser.id = currentUser.id || currentUser.sub;
          console.log("NORMALIZED USER:", currentUser);
          
          // Set user in context
          setUser(currentUser);
        }
        
        // Load user-specific appointments if user is logged in
        const appointmentsRes = currentUser 
          ? await appointmentService.getUserAppointments(currentUser.id)
          : { success: true, data: [] };
        
        console.log("APPOINTMENTS RESPONSE:", appointmentsRes);
        
        // Load other data in parallel
        const [doctorsRes, patientsRes, messagesRes] = await Promise.all([
          doctorService.getAll(),
          patientService.getAll(),
          messageService.getAllMessages(),
        ]);

        if (appointmentsRes.success) setRdvs(appointmentsRes.data || []);
        if (doctorsRes.success) setDoctors(doctorsRes.data || []);
        if (patientsRes.success) setPatients(patientsRes.data || []);
        if (messagesRes.success) setMessages(messagesRes.data || []);
        
      } catch (error) {
        console.error('Failed to load initial data:', error);
        // Fallback to mock data if API fails
        setRdvs([]);
        setMessages([]);
        setDoctors([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const addRdv = useCallback(
    async (appointmentData) => {
      try {
        const result = await appointmentService.create(appointmentData);
        if (result.success) {
          // Add the new appointment with complete data to the state
          setRdvs((prev) => {
            // Remove any existing appointment with same ID (in case of duplicate)
            const filtered = prev.filter(r => r.id !== result.data.id);
            // Add the new appointment with all doctor details
            return [...filtered, result.data].sort((a, b) => {
              const dateCompare = a.date.localeCompare(b.date);
              if (dateCompare !== 0) return dateCompare;
              return a.heure.localeCompare(b.heure);
            });
          });
          return { success: true };
        }
        return { success: false, message: result.message };
      } catch (error) {
        console.error('Failed to create appointment:', error);
        return { success: false, message: "Failed to create appointment" };
      }
    },
    []
  );

  const validateRdv = useCallback(
    async (id) => {
      try {
        const result = await appointmentService.update(id, { statut: "confirme" });
        if (result.success) {
          setRdvs((prev) =>
            prev.map((r) => (r.id === id ? { ...r, statut: "confirme" } : r))
          );
          return { success: true };
        }
        return { success: false, message: result.message };
      } catch (error) {
        console.error('Failed to validate appointment:', error);
        return { success: false, message: "Failed to validate appointment" };
      }
    },
    []
  );

  const annulerRdv = useCallback(
    async (id) => {
      try {
        // Update statut to 'annule' — do NOT delete the record
        const result = await appointmentService.update(id, { statut: "annule" });
        if (result.success) {
          setRdvs((prev) =>
            prev.map((r) => (r.id === id ? { ...r, statut: "annule" } : r))
          );
          return { success: true };
        }
        return { success: false, message: result.message };
      } catch (error) {
        console.error('Failed to cancel appointment:', error);
        return { success: false, message: "Failed to cancel appointment" };
      }
    },
    []
  );

  const reporterRdv = useCallback(
    async (id, date) => {
      try {
        const result = await appointmentService.update(id, { date, statut: "reporte" });
        if (result.success) {
          setRdvs((prev) =>
            prev.map((r) => (r.id === id ? { ...r, date, statut: "reporte" } : r))
          );
          return { success: true };
        }
        return { success: false, message: result.message };
      } catch (error) {
        console.error('Failed to reschedule appointment:', error);
        return { success: false, message: "Failed to reschedule appointment" };
      }
    },
    []
  );

  const setArrivee = useCallback(
    async (id, arrivee) => {
      try {
        const result = await appointmentService.update(id, { arrivee });
        if (result.success) {
          setRdvs((prev) =>
            prev.map((r) => (r.id === id ? { ...r, arrivee } : r))
          );
          return { success: true };
        }
        return { success: false, message: result.message };
      } catch (error) {
        console.error('Failed to update arrival status:', error);
        return { success: false, message: "Failed to update arrival status" };
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (messageData) => {
      try {
        const result = await messageService.sendToPatient(messageData);
        if (result.success) {
          setMessages((prev) => [...prev, result.data]);
          return { success: true };
        }
        return { success: false, message: result.message };
      } catch (error) {
        console.error('Failed to send message:', error);
        return { success: false, message: "Failed to send message" };
      }
    },
    []
  );

  const markMsgRead = useCallback(
    async (id) => {
      try {
        const result = await messageService.markAsRead(id);
        if (result.success) {
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, lu: true } : m))
          );
          return { success: true };
        }
        return { success: false, message: result.message };
      } catch (error) {
        console.error('Failed to mark message as read:', error);
        return { success: false, message: "Failed to mark message as read" };
      }
    },
    []
  );

  const refreshData = useCallback(
    async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentUser = { ...payload, id: payload.id || payload.sub };
        
        console.log("REFRESHING DATA FOR USER:", currentUser);
        
        // Reload appointments
        const appointmentsRes = await appointmentService.getUserAppointments(currentUser.id);
        if (appointmentsRes.success) {
          setRdvs(appointmentsRes.data || []);
          console.log("REFRESHED APPOINTMENTS:", appointmentsRes.data);
        }
        
        // Reload other data if needed
        const [doctorsRes, patientsRes, messagesRes] = await Promise.all([
          doctorService.getAll(),
          patientService.getAll(),
          messageService.getAllMessages(),
        ]);

        if (doctorsRes.success) setDoctors(doctorsRes.data || []);
        if (patientsRes.success) setPatients(patientsRes.data || []);
        if (messagesRes.success) setMessages(messagesRes.data || []);
        
        return { success: true };
      } catch (error) {
        console.error('Failed to refresh data:', error);
        return { success: false, message: "Failed to refresh data" };
      }
    },
    []
  );

  const value = {
    rdvs,
    messages,
    doctors,
    patients,
    user,
    loading,
    addRdv,
    validateRdv,
    annulerRdv,
    reporterRdv,
    setArrivee,
    sendMessage,
    markMsgRead,
    refreshData,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

