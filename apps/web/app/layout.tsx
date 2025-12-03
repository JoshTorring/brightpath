"use client";
import "./globals.css";
import { NhsHeader } from "@brightpath/ui/src/NhsHeader";
import { usePathname } from "next/navigation";
import React from "react";

const gradientForPath = (pathname: string) => {
  if (pathname.startsWith("/family")) {
    return "page-gradient-family";
  }
  if (pathname.startsWith("/practitioner")) {
    return "page-gradient-practitioner";
  }
  if (pathname === "/") {
    return "page-gradient-home";
  }
  return "page-gradient-default";
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const gradientClass = gradientForPath(pathname || "/");

  return (
    <html lang="en">
      <body className={`text-slate-900 ${gradientClass}`}>
        <div className="min-h-screen flex flex-col w-full">
          <NhsHeader />
          <main className="flex-1 w-full px-4 py-6 md:px-8 lg:px-12">
            <div className="w-full space-y-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
