import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Free kids activities in Chicago`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_TAGLINE} ${SITE_DESCRIPTION}`,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Free kids activities in Chicago`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/roscoe-village-bridge.png",
        alt: "Roscoe Village railroad bridge mural",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Free kids activities in Chicago`,
    description: SITE_DESCRIPTION,
    images: ["/images/roscoe-village-bridge.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col overflow-x-hidden">
        <Header />
        <div className="flex-1 pb-20 md:pb-0">{children}</div>
        <Footer />
        <MobileNavigation />
        <Analytics />
      </body>
    </html>
  );
}
