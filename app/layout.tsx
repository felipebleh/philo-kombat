import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./kierkegaard.css";
import "./beauvoir.css";
import "./foucault.css";
import "./arendt.css";
import "./wittgenstein.css";
import "./angela-davis.css";
import "./paulo-freire.css";
import "./fanon.css";
import "./krenak.css";
import "./turing.css";
import "./deleuze.css";
import "./superintelligence.css";
import "./felipe.css";
import "./plato.css";
import "./aristotle.css";
import "./augustine.css";
import "./marx.css";
import "./descartes.css";
import "./versus-selection.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Philo Kombat — Uma batalha de ideias",
  description:
    "Jogo educacional de luta em que filósofos transformam conceitos em golpes.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
