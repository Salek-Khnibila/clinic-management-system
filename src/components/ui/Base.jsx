import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { C } from "../../constants/designTokens.js";
import { ARRIVEE, STATUS } from "../../constants/status.js";
import { Star, X, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { DAYS, MONTHS } from "../../constants/data.js";

export const Avatar = ({ name = "", color = C.teal, size = 40 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `linear-gradient(135deg,${color}99,${color})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 800,
      fontSize: size * 0.34,
      flexShrink: 0,
    }}
  >
    {name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()}
  </div>
);

export const StatusBadge = ({ statut }) => {
  const s = STATUS[statut] || STATUS["en_attente"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: s.bg,
        color: s.text,
        borderRadius: 6,
        padding: "3px 9px",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <s.Icon size={11} strokeWidth={2.5} />
      {s.label}
    </span>
  );
};

export const ArriveeBadge = ({ statut }) => {
  const s = ARRIVEE[statut] || ARRIVEE["en_attente"];
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        borderRadius: 6,
        padding: "3px 9px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {s.label}
    </span>
  );
};

export const Stars = ({ note }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={12}
        fill={i <= Math.round(note) ? "#F59E0B" : "none"}
        stroke={i <= Math.round(note) ? "#F59E0B" : C.gray400}
        strokeWidth={1.5}
      />
    ))}
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: C.gray700,
        marginLeft: 3,
      }}
    >
      {note}
    </span>
  </div>
);

export const Btn = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  full = false,
  disabled = false,
  icon: Icon,
  style: sx = {},
}) => {
  const pad = { sm: "7px 13px", md: "10px 20px", lg: "13px 28px" }[size] || "10px 20px";
  const fs = { sm: 12, md: 13, lg: 15 }[size] || 13;
  const vs = {
    primary: {
      background: C.gradBtn,
      color: "#fff",
      border: "none",
      boxShadow: `0 2px 8px ${C.teal}33`,
    },
    outline: {
      background: "transparent",
      color: C.tealDk,
      border: `1.5px solid ${C.teal}`,
    },
    ghost: {
      background: C.gray100,
      color: C.gray700,
      border: `1px solid ${C.border}`,
    },
    danger: {
      background: "linear-gradient(135deg,#DC2626,#EF4444)",
      color: "#fff",
      border: "none",
    },
    success: {
      background: "linear-gradient(135deg,#059669,#10B981)",
      color: "#fff",
      border: "none",
    },
    purple: {
      background: "linear-gradient(135deg,#7C3AED,#8B5CF6)",
      color: "#fff",
      border: "none",
    },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: pad,
        borderRadius: 8,
        fontWeight: 700,
        fontSize: fs,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        opacity: disabled ? 0.5 : 1,
        width: full ? "100%" : "auto",
        transition: "all 0.15s",
        ...vs[variant],
        ...sx,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.opacity = "0.87";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {Icon && <Icon size={fs + 1} strokeWidth={2} />}
      {children}
    </button>
  );
};

export const Card = ({ children, style: sx = {}, hover = false, onClick, left }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bgCard,
        borderRadius: 12,
        boxShadow: hov ? C.shadowH : C.shadow,
        border: `1px solid ${C.border}`,
        transition: "all 0.2s",
        transform: hov ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default",
        borderLeft: left ? `4px solid ${left}` : undefined,
        ...sx,
      }}
    >
      {children}
    </div>
  );
};

export const Modal = ({ title, onClose, children, width = 500 }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(13,33,55,0.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3000,
      backdropFilter: "blur(8px)",
      padding: 16,
    }}
  >
    <div
      style={{
        background: C.white,
        borderRadius: 16,
        padding: "28px",
        width: "100%",
        maxWidth: width,
        boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 800,
            color: C.navy,
            fontFamily: "Georgia,serif",
          }}
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: C.gray100,
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={15} color={C.gray500} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const StatCard = ({ label, value, Icon, color, sub, onClick }) => (
  <Card
    hover={!!onClick}
    onClick={onClick}
    style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}
  >
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: 12,
        background: `${color}1A`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={22} color={color} strokeWidth={1.8} />
    </div>
    <div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 900,
          color: C.navy,
          lineHeight: 1,
          fontFamily: "Georgia,serif",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.gray500, marginTop: 2 }}>{label}</div>
      {sub && (
        <div style={{ fontSize: 11, color: color, fontWeight: 700, marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  </Card>
);

export const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 18 }}>
    <h2
      style={{
        margin: 0,
        fontSize: 20,
        fontWeight: 800,
        color: C.navy,
        fontFamily: "Georgia,serif",
      }}
    >
      {children}
    </h2>
    {sub && (
      <p style={{ margin: "4px 0 0", fontSize: 13, color: C.gray500 }}>{sub}</p>
    )}
  </div>
);

export const MiniCalendar = ({ selected, onSelect }) => {
  const today = new Date();
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const fd = new Date(y, m, 1).getDay();
  const off = fd === 0 ? 6 : fd - 1;
  const dim = new Date(y, m + 1, 0).getDate();
  const cells = [
    ...Array(off).fill(null),
    ...Array.from({ length: dim }, (_, i) => i + 1),
  ];
  const toKey = (d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isPast = (d) => new Date(toKey(d)) < new Date(today.toDateString());

  return (
    <Card style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <button
          onClick={() => (m === 0 ? (setM(11), setY(y - 1)) : setM(m - 1))}
          style={{
            border: `1px solid ${C.border}`,
            background: C.white,
            borderRadius: 8,
            width: 32,
            height: 32,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={15} color={C.gray500} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>
          {MONTHS[m]} {y}
        </span>
        <button
          onClick={() => (m === 11 ? (setM(0), setY(y + 1)) : setM(m + 1))}
          style={{
            border: `1px solid ${C.border}`,
            background: C.white,
            borderRadius: 8,
            width: 32,
            height: 32,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={15} color={C.gray500} />
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 2,
          marginBottom: 6,
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 10,
              fontWeight: 700,
              color: C.gray400,
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const past = isPast(d);
          const sel = toKey(d) === selected;
          const isT = toKey(d) === today.toISOString().split("T")[0];
          return (
            <div
              key={i}
              onClick={() => !past && onSelect(toKey(d))}
              style={{
                textAlign: "center",
                padding: "7px 2px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: sel ? 800 : 400,
                cursor: past ? "default" : "pointer",
                background: sel ? C.tealDk : isT ? C.tealLt : "transparent",
                color: sel
                  ? "#fff"
                  : past
                    ? C.gray400
                    : isT
                      ? C.tealDk
                      : C.gray900,
                transition: "all 0.1s",
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
// ── Toast individuel ──────────────────────────────────────────────────────────
const TOAST_STYLES = {
  success: { bg: "#ECFDF5", border: "#10B981", color: "#059669", Icon: CheckCircle },
  error:   { bg: "#FEF2F2", border: "#EF4444", color: "#DC2626", Icon: XCircle     },
  warning: { bg: "#FFFBEB", border: "#F59E0B", color: "#D97706", Icon: AlertTriangle },
  info:    { bg: "#F0FDFA", border: "#0D9488", color: "#0F766E", Icon: Info         },
};

const Toast = ({ id, type = "info", message, onClose }) => {
  const s = TOAST_STYLES[type] || TOAST_STYLES.info;
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(t);
  }, [id, onClose]);

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      background: s.bg, border: `1px solid ${s.border}`,
      borderLeft: `4px solid ${s.border}`,
      borderRadius: 10, padding: "12px 14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      minWidth: 280, maxWidth: 380,
      animation: "slideIn 0.2s ease",
    }}>
      <s.Icon size={16} color={s.color} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1, fontSize: 13, color: s.color, fontWeight: 600, lineHeight: 1.4 }}>
        {message}
      </span>
      <button onClick={() => onClose(id)} style={{
        border: "none", background: "none", cursor: "pointer",
        color: s.color, padding: 0, lineHeight: 1, flexShrink: 0,
      }}>
        <X size={14} />
      </button>
    </div>
  );
};

// ── Contexte Toast global ─────────────────────────────────────────────────────
const ToastCtx = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  toast.success = (msg) => toast(msg, "success");
  toast.error   = (msg) => toast(msg, "error");
  toast.warning = (msg) => toast(msg, "warning");
  toast.info    = (msg) => toast(msg, "info");

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24,
        display: "flex", flexDirection: "column", gap: 8,
        zIndex: 9999,
      }}>
        <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
        {toasts.map(t => (
          <Toast key={t.id} {...t} onClose={remove} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
// ── Indicateur de force du mot de passe ──────────────────────────────────────
export const getPasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (pwd.length >= 12)        score++;
  if (/[A-Z]/.test(pwd))       score++;
  if (/[0-9]/.test(pwd))       score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

export const PasswordStrengthBar = ({ password }) => {
  const strength = getPasswordStrength(password);
  const label = ["", "Très faible", "Faible", "Moyen", "Fort", "Très fort"][strength];
  const color = ["", C.red, C.red, C.amber, C.green, C.tealDk][strength];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i <= strength ? color : C.border,
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 11, color: C.gray400 }}>Min. 8 car., 1 majuscule, 1 chiffre</span>
      </div>
    </div>
  );
};