import { useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Inbox,
  MessageSquare,
  Stethoscope,
} from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { SPEC_ICONS, STATUS } from "../../constants/status.js";
import { useApp } from "../../contexts/AppContext.jsx";
import {
  Card,
  Modal,
  SectionTitle,
  StatusBadge,
} from "../../components/ui/Base.jsx";

export const PatientRdvPage = ({ user }) => {
  const { rdvs, messages, markMsgRead } = useApp();
  const [tab, setTab] = useState("rdv");
  const [filter, setFilter] = useState("tous");
  const [openMsg, setOpenMsg] = useState(null);

  const mes = rdvs.filter((r) => r.patient_id === user.patient_id);
  const shown =
    filter === "tous" ? mes : mes.filter((r) => r.statut === filter);

  const myMsgs = messages.filter((m) => m.to_patient_id === user.patient_id);
  const unread = myMsgs.filter((m) => !m.lu).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 22,
          background: C.gray100,
          borderRadius: 10,
          padding: 4,
        }}
      >
        {[
          {
            id: "rdv",
            label: "Mes rendez-vous",
            Icon: Calendar,
          },
          {
            id: "msgs",
            label: `Messagerie${unread > 0 ? ` (${unread})` : ""}`,
            Icon: MessageSquare,
          },
        ].map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: active ? C.white : "transparent",
                color: active ? C.navy : C.gray500,
                fontWeight: active ? 800 : 500,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: active ? C.shadow : "none",
                transition: "all 0.15s",
              }}
            >
              <t.Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "rdv" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: 7,
              overflowX: "auto",
              marginBottom: 18,
              paddingBottom: 2,
            }}
          >
            {["tous", "confirme", "en_attente", "annule"].map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 99,
                    border: `1.5px solid ${
                      active ? C.tealDk : C.border
                    }`,
                    background: active ? C.tealDk : C.white,
                    color: active ? "#fff" : C.gray500,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  {f === "tous" ? "Tous" : STATUS[f]?.label}
                </button>
              );
            })}
          </div>

          {shown.length === 0 && (
            <Card style={{ padding: "48px", textAlign: "center" }}>
              <Calendar
                size={32}
                color={C.gray400}
                style={{
                  margin: "0 auto 12px",
                  display: "block",
                }}
              />
              <div style={{ color: C.gray500 }}>
                Aucun rendez-vous trouvé.
              </div>
            </Card>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {shown.map((rdv) => {
              const I = SPEC_ICONS[rdv.specialite] || Stethoscope;
              return (
                <Card
                  key={rdv.id}
                  left={STATUS[rdv.statut]?.text || C.gray400}
                  style={{ padding: "16px 20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: C.navy,
                          fontFamily: "Georgia,serif",
                        }}
                      >
                        Dr. {rdv.medecin_prenom} {rdv.medecin_nom}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 3,
                        }}
                      >
                        <I
                          size={12}
                          color={C.tealDk}
                          strokeWidth={2}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: C.tealDk,
                            fontWeight: 600,
                          }}
                        >
                          {rdv.specialite}
                        </span>
                      </div>
                    </div>
                    <StatusBadge statut={rdv.statut} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: C.gray500,
                      }}
                    >
                      <Calendar size={12} />
                      {rdv.date}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: C.gray500,
                      }}
                    >
                      <Clock size={12} />
                      {rdv.heure}
                    </span>
                  </div>
                  {rdv.motif && (
                    <div
                      style={{
                        marginTop: 9,
                        padding: "8px 12px",
                        background: C.tealLt,
                        borderRadius: 8,
                        fontSize: 12,
                        color: C.tealDk,
                        fontWeight: 600,
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      <FileText size={12} />
                      {rdv.motif}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {tab === "msgs" && (
        <div>
          <SectionTitle sub="Messages reçus de la secrétaire">
            Messagerie
          </SectionTitle>
          {myMsgs.length === 0 && (
            <Card style={{ padding: "48px", textAlign: "center" }}>
              <Inbox
                size={32}
                color={C.gray400}
                style={{
                  margin: "0 auto 12px",
                  display: "block",
                }}
              />
              <div style={{ color: C.gray500 }}>
                Aucun message reçu.
              </div>
            </Card>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 9,
            }}
          >
            {myMsgs.map((msg) => (
              <Card
                key={msg.id}
                hover
                onClick={() => {
                  setOpenMsg(msg);
                  if (!msg.lu) markMsgRead(msg.id);
                }}
                left={!msg.lu ? C.tealDk : C.border}
                style={{ padding: "14px 18px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: C.grad,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    SC
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: !msg.lu ? 800 : 600,
                          fontSize: 14,
                          color: C.navy,
                        }}
                      >
                        {msg.sujet}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: C.gray400,
                        }}
                      >
                        {msg.date}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.gray500,
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Secrétaire · {msg.corps.slice(0, 60)}...
                    </div>
                  </div>
                  {!msg.lu && (
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: C.tealDk,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>

          {openMsg && (
            <Modal
              title={openMsg.sujet}
              onClose={() => setOpenMsg(null)}
              width={480}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: C.tealLt,
                  borderRadius: 10,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: C.grad,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  SC
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: C.navy,
                    }}
                  >
                    Secrétaire médicale
                  </div>
                  <div
                    style={{ fontSize: 12, color: C.tealDk }}
                  >
                    {openMsg.date}
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: C.gray700,
                  lineHeight: 1.7,
                  margin: "0 0 20px",
                }}
              >
                {openMsg.corps}
              </p>
              <button
                onClick={() => setOpenMsg(null)}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 10,
                  border: "none",
                  background: C.gradBtn,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Fermer
              </button>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
};

