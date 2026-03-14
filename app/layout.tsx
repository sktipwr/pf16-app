import type { Metadata } from "next";
import "./globals.css";
import GlobalFooter from "./components/GlobalFooter";

export const metadata: Metadata = {
  title: "16PF Personality Assessment",
  description: "Complete the 16 Personality Factors questionnaire and get a detailed report.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased pb-10">
        {children}
        <GlobalFooter />
      </body>
    </html>
  );
}
