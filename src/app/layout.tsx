import type { Metadata, Viewport } from "next";
import { Caveat, Nunito } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "600"] });

export const metadata: Metadata = {
  title: "Ensemble — estudos, agenda, finanças e bem-estar",
  description: "Ensemble: o app que organiza seus estudos, sua agenda, suas finanças e seu bem-estar em um só lugar.",
};

export const viewport: Viewport = {
  themeColor: "#2f6bf2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${caveat.variable}`} suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
