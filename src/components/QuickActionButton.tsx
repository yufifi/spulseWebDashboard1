import React from "react";
import "../styles/global.css";

interface QuickActionButtonProps {
  label: string;
  subtitle: string;
  onClick: () => void;
}

export default function QuickActionButton({ label, subtitle, onClick }: QuickActionButtonProps) {
  return (
    <button className="card" onClick={onClick} style={{ textAlign: "left" }}>
      <h4>{label}</h4>
      <p style={{ fontSize: "14px", color: "#666" }}>{subtitle}</p>
    </button>
  );
}
