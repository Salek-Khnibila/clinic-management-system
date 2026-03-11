import { createContext, useCallback, useContext, useState } from "react";
import { INIT_MSGS, INIT_RDV } from "../constants/data.js";

const AppCtx = createContext(null);

export const useApp = () => useContext(AppCtx);

export const AppProvider = ({ children }) => {
  const [rdvs, setRdvs] = useState(INIT_RDV);
  const [messages, setMessages] = useState(INIT_MSGS);

  const addRdv = useCallback(
    (r) =>
      setRdvs((prev) => [
        ...prev,
        { ...r, id: prev.length + 1, arrivee: "en attente" },
      ]),
    []
  );

  const validateRdv = useCallback(
    (id) =>
      setRdvs((prev) =>
        prev.map((r) => (r.id === id ? { ...r, statut: "confirmé" } : r))
      ),
    []
  );

  const annulerRdv = useCallback(
    (id) =>
      setRdvs((prev) =>
        prev.map((r) => (r.id === id ? { ...r, statut: "annulé" } : r))
      ),
    []
  );

  const reporterRdv = useCallback(
    (id, d) =>
      setRdvs((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, date: d, statut: "reporté" } : r
        )
      ),
    []
  );

  const setArrivee = useCallback(
    (id, a) =>
      setRdvs((prev) =>
        prev.map((r) => (r.id === id ? { ...r, arrivee: a } : r))
      ),
    []
  );

  const today = new Date().toISOString().split("T")[0];

  const sendMessage = useCallback(
    ({ to_patient_id, sujet, corps }) =>
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          from: "secretaire",
          to_patient_id,
          sujet,
          corps,
          date: today,
          lu: false,
        },
      ]),
    [today]
  );

  const markMsgRead = useCallback(
    (id) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, lu: true } : m))
      ),
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
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

