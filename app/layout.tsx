import Providers from '@/util/Providers';
import './globals.css';
import 'devextreme/dist/css/dx.light.css';
import { GeistSans } from 'geist/font/sans';
import NavTabs from '@/components/shared/NavTabs';
import { ClerkProvider } from '@clerk/nextjs';

let title = 'Inventory/Production';
let description = 'This app will manage the inventory and production';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${GeistSans.variable} dx-viewport`}>
          <NavTabs />
          <main className="p-5">
            <Providers>{children}</Providers>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
