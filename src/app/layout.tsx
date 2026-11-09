import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "BreatheIQ — Understand Your Air. Protect Your Health.",
  description:
    "Real-time Air Quality Intelligence Platform. Monitor AQI, track pollutants, explore interactive maps, compare locations, and get health insights powered by authentic public APIs.",
  keywords: ["air quality", "AQI", "pollution", "PM2.5", "environment", "health"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Leaflet CSS — loaded before map renders */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className={`${geist.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!bg-slate-800 !text-slate-100 !border !border-slate-700",
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
