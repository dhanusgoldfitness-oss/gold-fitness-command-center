import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gold Fitness AI Command Center",
  description: "AI secretary and team for Gold Fitness Kengeri",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0b0b0b] text-neutral-100">
        {children}
      </body>
    </html>
  );
}
