import { Inter } from 'next/font/google'
import './globals.css'
import { cmsClient } from '@/lib/sleekcms'

const inter = Inter({ subsets: ['latin'] })

import Navbar from '@/components/Navbar';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const client = cmsClient();
  const [home, navbarEntry] = await Promise.all([
    client.getPage('/'),
    client.getEntry('navbar')
  ]);

  const navbarItems = (Array.isArray(navbarEntry)
    ? (navbarEntry[0]?.nav_links || navbarEntry[0]?.items)
    : (navbarEntry?.nav_links || navbarEntry?.items)
  ) || [];

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar
          navbarItems={navbarItems}
          brandTitle={home?.hero?.title || home?.title}
        />
        <div className="min-h-screen">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
