import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./providers/ReduxProvider";
import ToastProvider from "./components/ToastProvider";
import ServerAuthWrapper from "./components/ServerAuthWrapper";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TDG",
  description: "TDG",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ReduxProvider>
          <ServerAuthWrapper>
            <Header />
            {children}
          </ServerAuthWrapper>
          <ToastProvider />
        </ReduxProvider>
      </body>
    </html>
  );
}
