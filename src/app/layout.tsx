import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nobatesalamat.ir"),
  title: {
    default: "نوبت سلامت | نوبت‌دهی آنلاین پزشکان در سراسر ایران",
    template: "%s | نوبت سلامت",
  },
  description:
    "نوبت سلامت؛ مرجع نوبت‌دهی آنلاین پزشک، مشاوره تلفنی و تصویری. بیش از ۱۲ هزار پزشک متخصص در تهران، مشهد، اصفهان و سراسر کشور — رزرو رایگان، بدون کارمزد.",
  keywords: ["نوبت دکتر", "نوبت دهی آنلاین", "پزشک", "مشاوره آنلاین", "نوبت سلامت"],
};

export const viewport: Viewport = {
  themeColor: "#0e5c4f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.variable} bg-paper font-sans text-ink antialiased`}>{children}</body>
    </html>
  );
}
