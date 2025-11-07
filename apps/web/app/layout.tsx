import "./globals.css";
import { NhsHeader } from "@brightpath/ui/src/NhsHeader";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NhsHeader />
        <main className="max-w-5xl mx-auto p-4 space-y-6">{children}</main>
      </body>
    </html>
  );
}
