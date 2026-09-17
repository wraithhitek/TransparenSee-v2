import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MainWrapper from "@/components/layout/MainWrapper";

export const metadata: Metadata = {
  title: "TransparenSee — MPLADS AI Monitor",
  description:
    "AI-powered monitoring and accountability dashboard for MPLADS implementation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f6f8fb] font-sans text-[#172033] antialiased">
        <Sidebar />
        <TopBar />
        <MainWrapper>
          {children}
        </MainWrapper>
      </body>
    </html>
  );
}
