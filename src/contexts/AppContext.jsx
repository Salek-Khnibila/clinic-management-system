import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { appointmentService, doctorService, patientService, messageService } from "../services/data.js";

const AppCtx = createContext(null);

export const useApp = () => useContext(AppCtx);

// Décode le JWT et retourne le payload complet
const getTokenPayload = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const getUserIdFromToken = () => {
  const payload = getTokenPayload();
  return payload ? (payload.sub || payload.id || null) : null;
};

const getRoleFromToken = () => {
  const payload = getTokenPayload();
  return payload?.role || null;
};

export const AppProvider = ({ children }) => {
  const [rdvs, setRdvs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const userId = getUserIdFromToken();
      const role   = getRoleFromToken();
      if (!userId || !role) return { success: false };

      // ── Doctors : disponible pour tous les rôles ──────────────────────────
      const doctorsRes = await doctorService.getAll();
      if (doctorsRes.success) setDoctors(doctorsRes.data || []);

      // ── Appointments : selon le rôle ──────────────────────────────────────
      const appointmentsRes = await appointmentService.getUserAppointments(userId);
      if (appointmentsRes.success) setRdvs(appointmentsRes.data || []);

      // ── Patients : secrétaire et médecin uniquement ───────────────────────
      if (role === 'secretaire' || role === 'medecin') {
        const patientsRes = await patientService.getAll();
        if (patientsRes.success) setPatients(patientsRes.data || []);
      } else {
        setPatients([]);
      }

      // ── Messages : selon le rôle ──────────────────────────────────────────
      if (role === 'secretaire') {
        // Secrétaire voit tous les messages
        const messagesRes = await messageService.getAllMessages();
        if (messagesRes.success) setMessages(messagesRes.data || []);
      } else if (role === 'patient') {
        // Patient voit uniquement ses propres messages
        const messagesRes = await messageService.getPatientMessages(userId);
        if (messagesRes.success) setMessages(messagesRes.data || []);
      } else {
        // Médecin n'a pas accès aux messages
        setMessages([]);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to refresh data:', error);
      return { success: false, message: "Failed to refresh data" };
    }
  }, []);

  // Chargement initial au montage
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await refreshData();
      } catch (error) {
        console.error('Failed to load initial data:', error);
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

  const addRdv = useCallback(async (appointmentData) => {
    try {
      const result = await appointmentService.create(appointmentData);
      if (result.success) {
        setRdvs((prev) => {
          const filtered = prev.filter(r => r.id !== result.data.id);
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
  }, []);

  const validateRdv = useCallback(async (id) => {
    try {
      const result = await appointmentService.update(id, { statut: "confirme" });
      if (result.success) { await refreshData(); return { success: true }; }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: "Failed to validate appointment" };
    }
  }, [refreshData]);

  const annulerRdv = useCallback(async (id) => {
    try {
      const result = await appointmentService.update(id, { statut: "annule" });
      if (result.success) { await refreshData(); return { success: true }; }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: "Failed to cancel appointment" };
    }
  }, [refreshData]);

  const reporterRdv = useCallback(async (id, date) => {
    try {
      const result = await appointmentService.update(id, { date, statut: "reporte" });
      if (result.success) { await refreshData(); return { success: true }; }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: "Failed to reschedule appointment" };
    }
  }, [refreshData]);

  const setArrivee = useCallback(async (id, arrivee) => {
    try {
      const result = await appointmentService.update(id, { arrivee });
      if (result.success) { await refreshData(); return { success: true }; }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: "Failed to update arrival status" };
    }
  }, [refreshData]);

  const sendMessage = useCallback(async (messageData) => {
    try {
      const result = await messageService.sendToPatient(messageData);
      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: "Failed to send message" };
    }
  }, []);

  const markMsgRead = useCallback(async (id) => {
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
      return { success: false, message: "Failed to mark message as read" };
    }
  }, []);

  const value = {
    rdvs,
    messages,
    doctors,
    patients,
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