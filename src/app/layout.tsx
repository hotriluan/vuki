import './globals.css';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { getSiteUrl, siteName, siteTagline } from '@/lib/seo';
import { ThemeProvider } from '@/context/ThemeContext';
import { Instrumentation } from '@/components/Instrumentation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteTagline,
  applicationName: siteName,
  openGraph: {
    title: siteName,
    description: siteTagline,
    url: '/',
    siteName,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteTagline
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="application-name" content={siteName} />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <Instrumentation />
        <ThemeProvider>
          <CurrencyProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
