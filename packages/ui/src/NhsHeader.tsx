import React from "react";
import "./theme.css";
export const NhsHeader: React.FC<{title?: string}> = ({title="BrightPath"}) => (
  <header style={{background:"var(--bp-nhs-blue)", color:"white", padding:"12px 16px"}}>
    <div style={{maxWidth:960, margin:"0 auto", display:"flex", alignItems:"center", gap:12}}>
      <div style={{fontWeight:800, letterSpacing:0.5}}>NHS • BrightPath</div>
      <div style={{opacity:0.9}} aria-hidden>│</div>
      <h1 style={{fontSize:18, margin:0}}>{title}</h1>
    </div>
  </header>
);
