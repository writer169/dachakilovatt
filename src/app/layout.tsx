import './globals.css';

export const metadata = {
  title: 'Magic Link Auth',
  description: 'Simple magic link authentication',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}