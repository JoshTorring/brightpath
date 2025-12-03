import React, { useEffect, useMemo, useRef, useState } from "react";
import "./theme.css";

const menuItems = [
  { label: "Visit profile", href: "/profile" },
  { label: "Log in", href: "/login" },
  { label: "Log out", href: "/logout" },
];

export const NhsHeader: React.FC<{ title?: string }> = ({ title = "BrightPath" }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  const handleClickOutside = useMemo(
    () =>
      (event: MouseEvent) => {
        if (!dropdownRef.current) return;
        if (!dropdownRef.current.contains(event.target as Node)) {
          closeMenu();
        }
      },
    []
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  return (
    <header style={{ background: "var(--bp-nhs-blue)", color: "white", padding: "12px 16px" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontWeight: 800, letterSpacing: 0.5 }}>NHS • BrightPath</div>
          <div style={{ opacity: 0.9 }} aria-hidden>
            │
          </div>
          <h1 style={{ fontSize: 18, margin: 0 }}>{title}</h1>
        </div>
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={toggleMenu}
            aria-haspopup="true"
            aria-expanded={open}
            aria-label="Profile menu"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "rgba(255,255,255,0.12)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              👤
            </span>
            <span>Profile</span>
            <span aria-hidden style={{ opacity: 0.8 }}>
              {open ? "▲" : "▼"}
            </span>
          </button>
          {open && (
            <div
              role="menu"
              style={{
                position: "absolute",
                right: 0,
                marginTop: 8,
                background: "white",
                color: "#1a1f36",
                minWidth: 180,
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.05)",
                zIndex: 20,
              }}
            >
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  role="menuitem"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    textDecoration: "none",
                    color: "inherit",
                    background: "white",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f2f7ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
