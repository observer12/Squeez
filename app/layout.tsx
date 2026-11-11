import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Squeez — Find the businesses everyone else misses",
  description: "Find underserved businesses, qualify opportunities and turn discovery into meaningful client relationships with Squeez.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
