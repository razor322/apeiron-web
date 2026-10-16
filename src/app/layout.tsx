import type { Metadata } from "next";
import { fontVariables } from "@/app/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Apeiron",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-void">
      <body className={`${fontVariables} font-sans`}>{children}</body>
    </html>
  );
}
