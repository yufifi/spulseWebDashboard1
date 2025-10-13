import React from "react";
import "../styles/global.css";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ChartContainer({ title, children }: Props) {
  return (
    <div
      className="card"
      style={{
        height: "380px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <h3 style={{ marginBottom: "12px" }}>{title}</h3>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}
