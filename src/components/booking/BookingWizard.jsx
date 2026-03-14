import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { CRN_A, CRN_M } from "../../constants/data.js";
import { useApp } from "../../contexts/AppContext.jsx";
import { Btn, Card, MiniCalendar } from "../ui/Base.jsx";

export const BookingWizard = ({ med, onClose, onConfirm }) => {
  const { rdvs } = useApp();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [motif, setMotif] = useState("");
  const [done, setDone] = useState(false);

  const booked = rdvs
    .filter(
      (r) =>
        r.medecin_id === med.id &&
        r.date === date &&
        r.statut !== "annulé"
    )
    .map((r) => r.heure);

  const confirm = () => {
    onConfirm({
      medecin_id: med.id,
      date,
      heure: slot,
      motif,
      statut: "en attente",
    });
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: C.greenLt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle size={32} color={C.green} strokeWidth={2} />
        </div>
        <h3
          style={{
            color: C.navy,
            fontSize: 20,
            fontWeight: 900,
            margin: "0 0 8px",
            fontFamily: "Georgia,serif",
          }}
        >
          Demande envoyée !
        </h3>
        <p
          style={{
            color: C.gray500,
            fontSize: 13,
            margin: "0 0 18px",
          }}
        >
          Votre RDV est visible par la secrétaire et le médecin en temps réel.
        </p>
        <div
          style={{
            background: C.tealLt,
            borderRadius: 10,
            padding: "14px",
            fontSize: 13,
            color: C.navy,
            marginBottom: 20,
            textAlign: "left",
            border: `1px solid ${C.teal}22`,
          }}
        >
          <div style={{ fontWeight: 800 }}>
            Dr. {med.prenom} {med.nom}
          </div>
          <div
            style={{
              color: C.tealDk,
              marginTop: 5,
              display: "flex",
              gap: 14,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Calendar size={12} />
              {date}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Clock size={12} />
              {slot}
            </span>
          </div>
        </div>
        <Btn full onClick={onClose}>
          Fermer
        </Btn>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: 22 }}
      >
        {[
          { n: 1, l: "Date" },
          { n: 2, l: "Heure" },
          { n: 3, l: "Motif" },
        ].map((s, i) => (
          <div
            key={s.n}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < 2 ? 1 : "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: step >= s.n ? C.tealDk : C.gray100,
                  color: step >= s.n ? "#fff" : C.gray400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 12,
                  border: `2px solid ${
                    step >= s.n ? C.tealDk : C.border
                  }`,
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                {step > s.n ? (
                  <CheckCircle size={13} strokeWidth={3} />
                ) : (
                  s.n
                )}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: step === s.n ? 700 : 400,
                  color: step === s.n ? C.navy : C.gray400,
                }}
              >
                {s.l}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: step > s.n ? C.tealDk : C.border,
                  margin: "0 8px",
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          background: C.tealLt,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: `1px solid ${C.teal}22`,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            background: C.grad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          {med.prenom[0]}
          {med.nom[0]}
        </div>
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 13,
              color: C.navy,
            }}
          >
            Dr. {med.prenom} {med.nom}
          </div>
          <div
            style={{
              fontSize: 11,
              color: C.tealDk,
            }}
          >
            {med.specialite} · {med.tarif}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div>
          <MiniCalendar
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setSlot("");
            }}
          />
          <div
            style={{
              marginTop: 14,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Btn
              onClick={() => date && setStep(2)}
              disabled={!date}
              icon={ArrowRight}
            >
              Choisir l&apos;heure
            </Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          {[
            { l: "🌅 Matin", s: CRN_M },
            { l: "🌆 Après-midi", s: CRN_A },
          ].map((g) => (
            <div key={g.l} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.gray500,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 9,
                }}
              >
                {g.l}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 7,
                }}
              >
                {g.s.map((h) => {
                  const free = !booked.includes(h);
                  const sel = slot === h;
                  return (
                    <div
                      key={h}
                      onClick={() => free && setSlot(h)}
                      style={{
                        padding: "9px 0",
                        borderRadius: 8,
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: free ? "pointer" : "not-allowed",
                        background: sel
                          ? C.tealDk
                          : free
                          ? C.white
                          : C.gray100,
                        color: sel
                          ? "#fff"
                          : free
                          ? C.navy
                          : C.gray400,
                        border: `1.5px solid ${
                          sel
                            ? C.tealDk
                            : free
                            ? C.border
                            : "transparent"
                        }`,
                        textDecoration: free ? "none" : "line-through",
                        transition: "all 0.12s",
                      }}
                    >
                      {h}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              gap: 9,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <Btn
              variant="ghost"
              onClick={() => setStep(1)}
              icon={ChevronLeft}
            >
              Retour
            </Btn>
            <Btn onClick={() => slot && setStep(3)} disabled={!slot}>
              Continuer
            </Btn>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <Card
            style={{
              background: C.gray50,
              borderRadius: 10,
              padding: "14px",
              marginBottom: 16,
              border: `1px solid ${C.border}`,
            }}
          >
            {[
              ["Médecin", `Dr. ${med.prenom} ${med.nom}`],
              ["Date", date],
              ["Heure", slot],
              ["Tarif", med.tarif],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: 13,
                }}
              >
                <span
                  style={{ color: C.gray500, fontWeight: 600 }}
                >
                  {k}
                </span>
                <span
                  style={{ color: C.navy, fontWeight: 700 }}
                >
                  {v}
                </span>
              </div>
            ))}
          </Card>
          <div style={{ marginBottom: 16 }}>
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
              Motif de consultation *
            </label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Décrivez vos symptômes..."
              rows={4}
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: 9,
                border: `1.5px solid ${C.border}`,
                fontSize: 14,
                color: C.navy,
                outline: "none",
                fontFamily: "inherit",
                resize: "none",
                boxSizing: "border-box",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.teal)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <Btn
              variant="ghost"
              onClick={() => setStep(2)}
              icon={ChevronLeft}
            >
              Retour
            </Btn>
            <Btn
              variant="success"
              onClick={confirm}
              disabled={!motif}
              style={{ flex: 1 }}
              icon={CheckCircle}
            >
              Confirmer
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
};

