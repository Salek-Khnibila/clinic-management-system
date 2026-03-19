import { useState } from "react";
import {
  Clock,
  Inbox,
  MapPin,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import { C } from "../../constants/designTokens.js";
import {
  MONTHS,
  SPECS,
  VILLES,
} from "../../constants/data.js";
import { SPEC_ICONS } from "../../constants/status.js";
import { useApp } from "../../contexts/AppContext.jsx";
import { BookingWizard } from "../../components/booking/BookingWizard.jsx";
import { DoctorCard } from "../../components/doctor/DoctorCard.jsx";
import {
  Card,
  Modal,
  SectionTitle,
  StatusBadge,
} from "../../components/ui/Base.jsx";

export const PatientAccueil = ({ user }) => {
  const { rdvs, addRdv, messages, doctors } = useApp();
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("");
  const [ville, setVille] = useState("");
  const [bookMed, setBookMed] = useState(null);

  const myMsgs = messages.filter((m) => m.to_patient_id === user.patient_id);
  const unread = myMsgs.filter((m) => !m.lu).length;

  const filtered = doctors.filter(
    (m) =>
      (!spec || m.specialite === spec) &&
      (!ville || m.ville === ville) &&
      (!search ||
        `${m.prenom} ${m.nom} ${m.specialite}`
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

  const prochains = rdvs
    .filter(
      (r) =>
        r.patient_id === user.patient_id &&
        (r.statut === "confirme" || r.statut === "en_attente")
    )
    .slice(0, 2);

  return (
    <div>
      {unread > 0 && (
        <div
          style={{
            background: C.tealLt,
            border: `1px solid ${C.teal}44`,
            borderRadius: 10,
            padding: "11px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Inbox size={17} color={C.tealDk} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.tealDk,
            }}
          >
            Vous avez {unread} message
            {unread > 1 ? "s" : ""} non lu
            {unread > 1 ? "s" : ""} de la secrétaire
          </span>
        </div>
      )}

      <div
        style={{
          background: C.grad,
          borderRadius: 16,
          padding: "28px 24px",
          marginBottom: 22,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            Votre santé, notre priorité
          </div>
          <h1
            style={{
              margin: "0 0 4px",
              fontSize: 22,
              fontWeight: 900,
              color: "#fff",
              fontFamily: "Georgia,serif",
            }}
          >
            Bonjour, {user.prenom} 👋
          </h1>
          <p
            style={{
              margin: "0 0 18px",
              color: "rgba(255,255,255,0.75)",
              fontSize: 13,
            }}
          >
            Trouvez un médecin et prenez rendez-vous en ligne
          </p>
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: 9,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Search size={17} color={C.tealDk} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Médecin, spécialité..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: 14,
                color: C.navy,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 7,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 18,
        }}
      >
        <button
          onClick={() => setSpec("")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 13px",
            borderRadius: 99,
            border: `1.5px solid ${!spec ? C.tealDk : C.border}`,
            background: !spec ? C.tealLt : C.white,
            color: !spec ? C.tealDk : C.gray500,
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          <Stethoscope size={12} strokeWidth={2} />
          Tous
        </button>
        {SPECS.map((s) => {
          const I = SPEC_ICONS[s] || Stethoscope;
          const active = spec === s;
          return (
            <button
              key={s}
              onClick={() => setSpec(active ? "" : s)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 13px",
                borderRadius: 99,
                border: `1.5px solid ${active ? C.tealDk : C.border}`,
                background: active ? C.tealLt : C.white,
                color: active ? C.tealDk : C.gray500,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              <I size={12} strokeWidth={2} />
              {s}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div style={{ position: "relative" }}>
          <MapPin
            size={13}
            color={C.gray400}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <select
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            style={{
              paddingLeft: 28,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 8,
              border: `1.5px solid ${ville ? C.tealDk : C.border}`,
              fontSize: 12,
              color: ville ? C.tealDk : C.gray500,
              background: ville ? C.tealLt : C.white,
              fontFamily: "inherit",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="">Toutes les villes</option>
            {VILLES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        {(spec || ville || search) && (
          <button
            onClick={() => {
              setSpec("");
              setVille("");
              setSearch("");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "7px 11px",
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
            Effacer
          </button>
        )}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: C.gray400,
            fontWeight: 600,
          }}
        >
          {filtered.length} médecin
          {filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {prochains.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: C.navy,
              marginBottom: 10,
              fontFamily: "Georgia,serif",
            }}
          >
            Prochains rendez-vous
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: 9,
            }}
          >
            {prochains.map((rdv) => {
              return (
                <Card
                  key={rdv.id}
                  left={C.tealDk}
                  style={{
                    padding: "13px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: C.tealLt,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize:15,
                        fontWeight: 900,
                        color: C.tealDk,
                        lineHeight: 1,
                      }}
                    >
                      {rdv.date.split("-")[2]}
                    </span>
                    <span
                      style={{ fontSize: 9, color: C.gray400 }}
                    >
                      {
                        MONTHS[
                          parseInt(rdv.date.split("-")[1]) - 1
                        ].slice(0, 3)
                      }
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.navy,
                      }}
                    >
                      Dr. {rdv.medecin_prenom} {rdv.medecin_nom}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.gray500,
                        display: "flex",
                        gap: 7,
                        marginTop: 2,
                      }}
                    >
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
                      {rdv.medecin_specialite && (
                        <span style={{ color: C.gray400 }}>
                          • {rdv.medecin_specialite}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge statut={rdv.statut} />
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <SectionTitle
        sub={`${filtered.length} médecin${
          filtered.length !== 1 ? "s" : ""
        } disponible${filtered.length !== 1 ? "s" : ""}`}
      >
        Médecins
      </SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {filtered.map((m) => (
          <DoctorCard key={m.id} med={m} onBook={setBookMed} />
        ))}
      </div>

      {bookMed && (
        <Modal
          title="Prendre rendez-vous"
          onClose={() => setBookMed(null)}
        >
          <BookingWizard
            med={bookMed}
            onConfirm={(r) => {
              addRdv({ ...r, patient_id: user.patient_id });
            }}
            onClose={() => setBookMed(null)}
          />
        </Modal>
      )}
    </div>
  );
};

