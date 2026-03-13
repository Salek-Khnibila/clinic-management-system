import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { appointmentService, doctorService, patientService, messageService } from "../services/data.js";

const AppCtx = createContext(null);

export const useApp = () => useContext(AppCtx);

export const AppProvider = ({ children }) => {
  const [rdvs, setRdvs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [appointmentsRes, doctorsRes, patientsRes, messagesRes] = await Promise.all([
          appointmentService.getAll(),
          doctorService.getAll(),
          patientService.getAll(),
          messageService.getAll(),
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
          setRdvs((prev) => [...prev, result.data]);
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
        const result = await appointmentService.update(id, { statut: "confirmé" });
        if (result.success) {
          setRdvs((prev) =>
            prev.map((r) => (r.id === id ? { ...r, statut: "confirmé" } : r))
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
        const result = await appointmentService.delete(id);
        if (result.success) {
          setRdvs((prev) =>
            prev.map((r) => (r.id === id ? { ...r, statut: "annulé" } : r))
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
        const result = await appointmentService.update(id, { date, statut: "reporté" });
        if (result.success) {
          setRdvs((prev) =>
            prev.map((r) => (r.id === id ? { ...r, date, statut: "reporté" } : r))
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

  const value = {
    rdvs,
    addRdv,
    validateRdv,
    annulerRdv,
    reporterRdv,
    setArrivee,
    messages,
    sendMessage,
    markMsgRead,
    doctors,
    patients,
    loading,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

