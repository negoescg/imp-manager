import Providers from '@/util/Providers';
import './globals.css';
import 'devextreme/dist/css/dx.light.css';
import { Inter } from 'next/font/google';
import NavTabs from '@/components/shared/NavTabs';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from '@/providers/SessionProvider';
import { validateRequest } from '@/lib/auth/lucia';

let title = 'Inventory/Production';
let description = 'This app will manage the inventory and production';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title,
  description,
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  metadataBase: new URL('https://essence-manager.vercel.app'),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessionData = await validateRequest();
  return (
    <html lang="en">
      <body className={`${inter.className} dx-viewport`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <SessionProvider session={sessionData}>
            <>
              <NavTabs />
              <main>
                <Providers>{children}</Providers>
                <Toaster richColors />
              </main>
            </>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
