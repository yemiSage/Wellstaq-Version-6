import type {Metadata} from 'next';
import { Inter, Funnel_Display } from 'next/font/google';
import './globals.css'; // Global styles
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const funnelDisplay = Funnel_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Wellstaq',
  description: 'Track your wellness journey, join vibrant clubs, compete on leaderboards, and get AI-powered wellness coaching.',
  icons: {
    icon: 'https://res.cloudinary.com/dv7yvatu2/image/upload/v1772170704/wellstaq_logo_raxmmg.png',
  },
  openGraph: {
    title: 'Wellstaq - Wellness & Community',
    description: 'Track your wellness journey, join vibrant clubs, compete on leaderboards, and get AI-powered wellness coaching.',
    images: [
      {
        url: 'https://res.cloudinary.com/dv7yvatu2/image/upload/v1773334436/sports-men-standing-white-wall_mz07zp.jpg',
        width: 1200,
        height: 630,
        alt: 'Wellstaq Preview',
      },
    ],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${funnelDisplay.variable}`} suppressHydrationWarning>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
