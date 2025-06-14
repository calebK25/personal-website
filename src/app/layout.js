import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import AppWrapper from "./components/AppWrapper";
import ClientLayout from "./components/ClientLayout";

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
      <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <AppWrapper>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AppWrapper>
        </AuthProvider>
        </body>
      </html>
  );
}
