import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shader Field Guide — learn by changing the field',
  description: 'A bounded, browser-first GLSL learning lab with five visual lessons, local notebook saves, and real shader exports.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
