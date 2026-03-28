import { Montserrat } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Loader from "../app/components/Loader";
import SessionWrapper from "../app/components/SessionWrapper";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "chatrealfam",
  description:
    "Learn how to grow your business through marketing tools, tactics, and strategies",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children, session }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        <SessionWrapper session={session}>
          <Suspense fallback={<Loader />}>{children}</Suspense>
        </SessionWrapper>
      </body>
    </html>
  );
}
