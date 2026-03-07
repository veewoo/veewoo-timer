import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Veewoo Daily Task Timer",
  authors: [
    {
      name: "Veewoo",
      url: "https://veewoo.vercel.app/",
    },
  ],
  description:
    "Boost your productivity with Daily Task Timer! Stay focused by timing your tasks, setting daily goals, and tracking your progress. Perfect for students, professionals, or anyone looking to manage their time better. Simple, efficient, and customizable for all your needs!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="viewport-fit=cover, width=device-width,initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no"
        />
        <link rel="apple-touch-icon" href="/customicon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="BGBG01" />
        <meta name="apple-mobile-web-app-title" content="BGBG01" />
        <meta name="msapplication-starturl" content="/" />
        <link rel="manifest" href="manifest.json" />
      </head>

      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
