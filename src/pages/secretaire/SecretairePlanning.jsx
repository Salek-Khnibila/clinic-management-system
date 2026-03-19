import { useState } from "react";
import {
  Calendar,
  Clock,
  ClipboardList,
  Filter,
  RefreshCw,
  Stethoscope,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { STATUS } from "../../constants/status.js";
import { useApp } from "../../contexts/AppContext.jsx";
import {
  ArriveeBadge,
  Btn,
  Card,
  Modal,
  SectionTitle,
  StatusBadge,
} from "../../components/ui/Base.jsx";

export const SecretairePlanning = () => {
  const { rdvs, doctors, validateRdv, annulerRdv, reporterRdv, setArrivee } =
    useApp();

  const [fMed, setFMed] = useState("");
  const [fStat, setFStat] = useState("");
  const [fDate, setFDate] = useState("");
  const [repMod, setRepMod] = useState(null);
  const [newDate, setNewDate] = useState("");

  const filtered = rdvs.filter(
    (r) =>
      (!fMed || r.medecin_id === parseInt(fMed, 10)) &&
      (!fStat || r.statut === fStat) &&
      (!fDate || r.date === fDate)
  );

  const enAtt = rdvs.filter((r) => r.statut === "en attente");

  return (
    <div>
      <SectionTitle sub={`${filtered.length} rendez-vous`}>
        Planning global
      </SectionTitle>

      {enAtt.length > 0 && (
        <div
          style={{
            background: C.amberLt,
            borderRadius: 10,
            padding: "11px 15px",
            marginBottom: 16,
            border: `1px solid ${C.amber}44`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Clock size={17} color={C.amber} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#92400E",
            }}
          >
            {enAtt.length} RDV en attente
          </span>
          <button
            onClick={() => setFStat("en attente")}
            style={{
              marginLeft: "auto",
              fontSize: 12,
              fontWeight: 700,
              color: C.amber,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Filtrer →
          </button>
        </div>
      )}

      <Card style={{ padding: "13px 15px", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            {
              val: fMed,
              set: setFMed,
              Ic: Stethoscope,
              opts: [
                { v: "", l: "Tous médecins" },
                ...doctors.map((m) => ({
                  v: m.id,
                  l: `Dr. ${m.nom}`,
                })),
              ],
            },
            {
              val: fStat,
              set: setFStat,
              Ic: Filter,
              opts: [
                { v: "", l: "Tous statuts" },
                ...Object.entries(STATUS).map(([k, v]) => ({
                  v: k,
                  l: v.label,
                })),
              ],
            },
          ].map(({ val, set, Ic, opts }, i) => (
            <div key={i} style={{ position: "relative" }}>
              <Ic
                size={13}
                color={C.gray400}
                style={{
                  position: "absolute",
                  left: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <select
                value={val}
                onChange={(e) => set(e.target.value)}
                style={{
                  paddingLeft: 26,
                  paddingRight: 11,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 8,
                  border: `1.5px solid ${C.border}`,
                  fontSize: 12,
                  color: C.gray700,
                  background: C.white,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {opts.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div style={{ position: "relative" }}>
            <Calendar
              size={13}
              color={C.gray400}
              style={{
                position: "absolute",
                left: 9,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="date"
              value={fDate}
              onChange={(e) => setFDate(e.target.value)}
              style={{
                paddingLeft: 26,
                paddingRight: 11,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 8,
                border: `1.5px solid ${C.border}`,
                fontSize: 12,
                color: C.gray700,
                background: C.white,
                fontFamily: "inherit",
                cursor: "pointer",
                outline: "none",
              }}
            />
          </div>
          {(fMed || fStat || fDate) && (
            <button
              onClick={() => {
                setFMed("");
                setFStat("");
                setFDate("");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "8px 11px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                fontSize: 12,
                color: C.gray500,
                background: C.white,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <X size={12} />
              Reset
            </button>
          )}
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <Card style={{ padding: "40px", textAlign: "center" }}>
            <ClipboardList
              size={32}
              color={C.gray400}
              style={{ margin: "0 auto 12px", display: "block" }}
            />
            <div style={{ color: C.gray500 }}>Aucun résultat.</div>
          </Card>
        )}

        {filtered.map((rdv) => {
          return (
            <Card
              key={rdv.id}
              left={STATUS[rdv.statut]?.text || C.gray400}
              style={{ padding: "15px 18px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <ArriveeBadge
                  statut={rdv.arrivee || "en attente"}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: C.navy,
                    }}
                  >
                    {rdv.patient_prenom} {rdv.patient_nom}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.gray500,
                      display: "flex",
                      gap: 10,
                      marginTop: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Stethoscope size={10} />
                      Dr. {rdv.medecin_nom}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Calendar size={10} />
                      {rdv.date}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Clock size={10} />
                      {rdv.heure}
                    </span>
                  </div>
                </div>
                <StatusBadge statut={rdv.statut} />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 10,
                  padding: "8px 11px",
                  background: C.gray50,
                  borderRadius: 8,
                }}
              >
                <UserCheck size={13} color={C.gray500} />
                <span
                  style={{
                    fontSize: 12,
                    color: C.gray500,
                    fontWeight: 600,
                  }}
                >
                  Arrivée :
                </span>
                <ArriveeBadge statut={rdv.arrivee || "en attente"} />
                <select
                  value={rdv.arrivee || "en attente"}
                  onChange={(e) =>
                    setArrivee(rdv.id, e.target.value)
                  }
                  style={{
                    marginLeft: "auto",
                    padding: "4px 8px",
                    borderRadius: 7,
                    border: `1px solid ${C.border}`,
                    fontSize: 11,
                    color: C.gray700,
                    outline: "none",
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <option value="en attente">En attente</option>
                  <option value="en salle">En salle</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {rdv.statut === "en attente" && (
                  <Btn
                    variant="success"
                    size="sm"
                    icon={Clock}
                    onClick={() => validateRdv(rdv.id)}
                  >
                    Valider
                  </Btn>
                )}
                {rdv.statut !== "annulé" && (
                  <Btn
                    variant="ghost"
                    size="sm"
                    icon={RefreshCw}
                    onClick={() => {
                      setRepMod(rdv);
                      setNewDate("");
                    }}
                  >
                    Reporter
                  </Btn>
                )}
                {rdv.statut !== "annulé" && (
                  <Btn
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => annulerRdv(rdv.id)}
                  >
                    Annuler
                  </Btn>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {repMod && (
        <Modal
          title="Reporter le rendez-vous"
          onClose={() => setRepMod(null)}
          width={380}
        >
          <div
            style={{
              background: C.gray50,
              borderRadius: 9,
              padding: "11px 13px",
              marginBottom: 14,
              fontSize: 13,
              color: C.gray700,
            }}
          >
            {repMod.patient_prenom} — {repMod.heure} · {repMod.date}
          </div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: C.gray500,
              textTransform: "uppercase",
              letterSpacing: 0.7,
              marginBottom: 7,
            }}
          >
            Nouvelle date
          </label>
          <div style={{ position: "relative", marginBottom: 18 }}>
            <Calendar
              size={13}
              color={C.gray400}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: 32,
                paddingRight: 12,
                paddingTop: 10,
                paddingBottom: 10,
                borderRadius: 8,
                border: `1.5px solid ${C.border}`,
                fontSize: 14,
                color: C.navy,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <Btn
              onClick={() => {
                reporterRdv(repMod.id, newDate);
                setRepMod(null);
              }}
              disabled={!newDate}
              style={{ flex: 1, padding: "11px" }}
            >
              Confirmer
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => setRepMod(null)}
              style={{ flex: 1, padding: "11px" }}
            >
              Annuler
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

