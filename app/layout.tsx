import type { Metadata } from "next";
import { Oswald, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import TratorScroll from "@/components/TratorScroll";
import { MARCA } from "@/lib/marca";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: `${MARCA.nome} | ${MARCA.secundario}`,
  description: MARCA.descricao,
  icons: {
    icon: "/FavIcon/icon_v3.png",
    shortcut: "/FavIcon/icon_v3.png",
    apple: "/FavIcon/apple_icon_v3.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">
        <Nav />
        {children}
        <TratorScroll />
      </body>
    </html>
  );
}