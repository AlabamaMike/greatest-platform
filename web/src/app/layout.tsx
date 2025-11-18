import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'Nexus - Empowering Communities',
  description: 'A comprehensive platform for healthcare, education, economic empowerment, and crisis response',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
