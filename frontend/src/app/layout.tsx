import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { SessionExpiryGuard } from "@/components/auth/SessionExpiryGuard";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Kukalakala | Plataforma de candidaturas",
  description:
    "Plataforma para candidatos encontrarem oportunidades e empresas gerirem candidaturas com contexto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={poppins.variable}>
        <ToastProvider>
          <SessionExpiryGuard />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
