// import { Auth0Provider } from '@auth0/nextjs-auth0';
// import { auth0 } from "../lib/auth0" // Adjust path if your auth0 client is elsewhere
// import './globals.css'
// import { Inter } from 'next/font/google'
// import Navigation from './components/Navigation';

// const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Bowling Tournament Manager',
//   description: 'Manage your bowling tournaments with ease',
// }

// export default async function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const session = await auth0.getSession()

//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <Auth0Provider user={session?.user}>
//           <div className="min-h-screen bg-gray-50">
//             <Navigation />
//             <main>{children}</main>
//           </div>
//         </Auth0Provider>
//       </body>
//     </html>
//   )
// }

// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Auth0Provider } from '@auth0/nextjs-auth0';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bowling Tournament Manager',
  description: 'Manage bowling tournaments, teams, players, and statistics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Auth0Provider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main>{children}</main>
          </div>
        </Auth0Provider>
      </body>
    </html>
  );
}
