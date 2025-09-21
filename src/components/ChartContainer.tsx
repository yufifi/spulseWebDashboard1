import React from "react";
import "../styles/global.css";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ChartContainer({ title, children }: Props) {
  return (
    <div className="card" style={{ height: "300px" }}>
      <h3 style={{ marginBottom: "12px" }}>{title}</h3>
      {children}
    </div>
  );
}
