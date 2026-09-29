import type { Metadata, Viewport } from "next";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/900.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "عمار للتسوق — كل احتياجات بيتك لباب بيتك", template: "%s | عمار للتسوق" },
  description: "سوبر ماركت عمار في حلب: خضار وفواكه، ألبان، مواد غذائية ومنظفات. اطلب أونلاين وادفع عند الاستلام.",
  applicationName: "عمار للتسوق",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/brand/mark.svg", apple: "/brand/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "عمار", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#E11A21", width: "device-width", initialScale: 1, maximumScale: 5 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
