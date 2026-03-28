import { C } from "../../constants/designTokens.js";
import { useMobile } from "../../hooks/useMobile.js";

export const Logo = ({ size = 36, full = false }) => {
  const isMobile = useMobile();
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0D2137" />
            <stop offset="50%" stopColor="#0891B2" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect
          x="14"
          y="2"
          width="20"
          height="44"
          rx="6"
          fill="url(#lg1)"
          opacity="0.95"
        />
        <rect
          x="2"
          y="14"
          width="44"
          height="20"
          rx="6"
          fill="url(#lg1)"
          opacity="0.95"
        />
        <circle cx="24" cy="24" r="4" fill="white" opacity="0.9" />
        <circle cx="12" cy="36" r="4" fill="#0D2137" opacity="0.85" />
        <circle cx="36" cy="12" r="5" fill="#06B6D4" opacity="0.85" />
        <line
          x1="24"
          y1="24"
          x2="12"
          y2="36"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="24"
          y1="24"
          x2="36"
          y2="12"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </svg>
      {full && (
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "Georgia,serif",
              fontWeight: 900,
              fontSize: isMobile ? 12 : 15,
              letterSpacing: isMobile ? 1 : 1.5,
              lineHeight: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span style={{ color: C.navy }}>GESTION </span>
            <span style={{ color: C.tealDk }}>CLINIQUE</span>
          </div>
          <div
            style={{
              fontSize: isMobile ? 6 : 7.5,
              letterSpacing: isMobile ? 2 : 2.5,
              color: C.gray400,
              textTransform: "uppercase",
              marginTop: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Simplifier · Optimiser · Améliorer
          </div>
        </div>
      )}
    </div>
  );
};

