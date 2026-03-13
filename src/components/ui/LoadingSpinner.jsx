import React from "react";
import { C } from "../../constants/designTokens.js";

export const LoadingSpinner = ({ size = 40, text = "Chargement..." }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: 16,
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${C.tealLt}`,
        borderTop: `3px solid ${C.teal}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
    <div
      style={{
        fontSize: 14,
        color: C.gray500,
        fontWeight: 500,
      }}
    >
      {text}
    </div>
  </div>
);
