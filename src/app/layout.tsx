import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LocationProvider } from '@/context/LocationContext';

export const metadata: Metadata = {
  title: 'BreatheIQ — Real-Time Air Quality Intelligence Platform',
  description: 'Understand Your Air. Protect Your Health. Authentic real-time air quality monitoring, predictive analytics, interactive maps, and health advisories.',
  authors: [{ name: 'BreatheIQ Open Platform' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <LocationProvider>
            {children}
          </LocationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
