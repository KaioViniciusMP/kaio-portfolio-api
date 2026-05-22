import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "kaio-portfolio-api",
  description: "API de certificacoes do portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}