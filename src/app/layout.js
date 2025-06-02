import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import AuthProvider from "./components/AuthProvider";

import Nav from "./components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NextJS Page Transitions | Codegrid",
  description: "NextJS Page Transitions | Codegrid",
};

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
          <AuthProvider>
            <Nav />
            {children}
          </AuthProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
