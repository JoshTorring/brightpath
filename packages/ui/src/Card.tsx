import React from "react";
import "./theme.css";
export const Card: React.FC<React.PropsWithChildren<{title?: string}>> = ({title, children}) => (
  <section style={{background:"white", borderRadius:16, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
    {title && <h2 style={{marginTop:0, color:"var(--bp-ink)"}}>{title}</h2>}
    {children}
  </section>
);
