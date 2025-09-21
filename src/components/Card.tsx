import React from "react";
import "../styles/global.css";

interface CardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
}

export default function Card({ title, value, subtitle }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {value !== undefined && <div style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</div>}
    </div>
  );
}
