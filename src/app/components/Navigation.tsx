// // // app/components/Navigation.tsx
// // 'use client';

// // import { useUser } from '@auth0/nextjs-auth0';
// // import Link from 'next/link';
// // import { usePathname } from 'next/navigation';
// // import { Trophy, Users, UserPlus, Calendar, BarChart3, Menu, X } from 'lucide-react';
// // import { useState } from 'react';

// // const Navigation = () => {
// //   const { user, isLoading } = useUser();
// //   const pathname = usePathname();
// //   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// //   const navigation = [
// //     { name: 'Tournaments', href: '/tournaments', icon: Trophy },
// //     { name: 'Teams', href: '/teams', icon: Users },
// //     { name: 'Players', href: '/players', icon: UserPlus },
// //     { name: 'Matches', href: '/matches', icon: Calendar },
// //     { name: 'Statistics', href: '/statistics', icon: BarChart3 },
// //   ];

// //   if (isLoading) return <div>Loading...</div>;

// //   if (!user) {
// //     return (
// //       <nav className="bg-white shadow-lg">
// //         <div className="max-w-7xl mx-auto px-4">
// //           <div className="flex justify-between h-16">
// //             <div className="flex items-center">
// //               <Trophy className="h-8 w-8 text-blue-600" />
// //               <span className="ml-2 text-xl font-bold text-gray-900">Bowling Manager</span>
// //             </div>
// //             <div className="flex items-center">
// //               <a
// //                 href="/auth/login"
// //                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
// //               >
// //                 Sign In
// //               </a>
// //             </div>
// //           </div>
// //         </div>
// //       </nav>
// //     );
// //   }

// //   return (
// //     <nav className="bg-white shadow-lg">
// //       <div className="max-w-7xl mx-auto px-4">
// //         <div className="flex justify-between h-16">
// //           {/* Logo */}
// //           <div className="flex items-center">
// //             <Trophy className="h-8 w-8 text-blue-600" />
// //             <span className="ml-2 text-xl font-bold text-gray-900">Bowling Manager</span>
// //           </div>

// //           {/* Desktop Navigation */}
// //           <div className="hidden md:flex items-center space-x-8">
// //             {navigation.map((item) => {
// //               const isActive = pathname.startsWith(item.href);
// //               return (
// //                 <Link
// //                   key={item.name}
// //                   href={item.href}
// //                   className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
// //                     isActive
// //                       ? 'text-blue-600 bg-blue-50'
// //                       : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
// //                   }`}
// //                 >
// //                   <item.icon className="h-4 w-4 mr-2" />
// //                   {item.name}
// //                 </Link>
// //               );
// //             })}
// //           </div>

// //           {/* User Menu */}
// //           <div className="flex items-center space-x-4">
// //             <div className="hidden md:flex items-center space-x-4">
// //               <span className="text-sm text-gray-600">
// //                 Welcome, {user.name || user.email}
// //               </span>
// //               <a
// //                 href="/auth/logout"
// //                 className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
// //               >
// //                 Sign Out
// //               </a>
// //             </div>

// //             {/* Mobile menu button */}
// //             <button
// //               className="md:hidden"
// //               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
// //             >
// //               {mobileMenuOpen ? (
// //                 <X className="h-6 w-6 text-gray-600" />
// //               ) : (
// //                 <Menu className="h-6 w-6 text-gray-600" />
// //               )}
// //             </button>
// //           </div>
// //         </div>

// //         {/* Mobile Navigation */}
// //         {mobileMenuOpen && (
// //           <div className="md:hidden">
// //             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
// //               {navigation.map((item) => {
// //                 const isActive = pathname.startsWith(item.href);
// //                 return (
// //                   <Link
// //                     key={item.name}
// //                     href={item.href}
// //                     className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
// //                       isActive
// //                         ? 'text-blue-600 bg-blue-50'
// //                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
// //                     }`}
// //                     onClick={() => setMobileMenuOpen(false)}
// //                   >
// //                     <item.icon className="h-4 w-4 mr-2" />
// //                     {item.name}
// //                   </Link>
// //                 );
// //               })}
// //             </div>
// //             <div className="pt-4 pb-3 border-t border-gray-200">
// //               <div className="px-4">
// //                 <div className="text-base font-medium text-gray-800">
// //                   {user.name || user.email}
// //                 </div>
// //                 <a
// //                   href="/auth/logout"
// //                   className="mt-3 block text-base font-medium text-gray-600 hover:text-gray-900"
// //                 >
// //                   Sign Out
// //                 </a>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </nav>
// //   );
// // };

// // export default Navigation;

// // src/app/components/Navigation.tsx
// 'use client';

// import { useUser } from '@auth0/nextjs-auth0';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Trophy, Users, UserPlus, Calendar, BarChart3, TrendingUp, Menu, X } from 'lucide-react';
// import { useState } from 'react';

// const Navigation = () => {
//   const { user, isLoading } = useUser();
//   const pathname = usePathname();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const navigation = [
//     { name: 'Tournaments', href: '/tournaments', icon: Trophy },
//     { name: 'Teams', href: '/teams', icon: Users },
//     { name: 'Players', href: '/players', icon: UserPlus },
//     { name: 'Matches', href: '/matches', icon: Calendar },
//     { name: 'Statistics', href: '/statistics', icon: BarChart3 },
//     { name: 'Player Stats', href: '/player-statistics', icon: TrendingUp },
//   ];

//   if (isLoading) return <div>Loading...</div>;

//   if (!user) {
//     return (
//       <nav className="bg-white shadow-lg">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <Trophy className="h-8 w-8 text-blue-600" />
//               <span className="ml-2 text-xl font-bold text-gray-900">Bowling Manager</span>
//             </div>
//             <div className="flex items-center">
//               <a
//                 href="/auth/login"
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
//               >
//                 Sign In
//               </a>
//             </div>
//           </div>
//         </div>
//       </nav>
//     );
//   }

//   return (
//     <nav className="bg-white shadow-lg">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex justify-between h-16">
//           {/* Logo */}
//           <div className="flex items-center">
//             <Trophy className="h-8 w-8 text-blue-600" />
//             <span className="ml-2 text-xl font-bold text-gray-900">Bowling Manager</span>
//           </div>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8">
//             {navigation.map((item) => {
//               const isActive = pathname.startsWith(item.href);
//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                     isActive
//                       ? 'text-blue-600 bg-blue-50'
//                       : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//                   }`}
//                 >
//                   <item.icon className="h-4 w-4 mr-2" />
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </div>

//           {/* User Menu */}
//           <div className="flex items-center space-x-4">
//             <div className="hidden md:flex items-center space-x-4">
//               <span className="text-sm text-gray-600">
//                 Welcome, {user.name || user.email}
//               </span>
//               <a
//                 href="/auth/logout"
//                 className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
//               >
//                 Sign Out
//               </a>
//             </div>

//             {/* Mobile menu button */}
//             <button
//               className="md:hidden"
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             >
//               {mobileMenuOpen ? (
//                 <X className="h-6 w-6 text-gray-600" />
//               ) : (
//                 <Menu className="h-6 w-6 text-gray-600" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {mobileMenuOpen && (
//           <div className="md:hidden">
//             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//               {navigation.map((item) => {
//                 const isActive = pathname.startsWith(item.href);
//                 return (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
//                       isActive
//                         ? 'text-blue-600 bg-blue-50'
//                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//                     }`}
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     <item.icon className="h-4 w-4 mr-2" />
//                     {item.name}
//                   </Link>
//                 );
//               })}
//             </div>
//             <div className="pt-4 pb-3 border-t border-gray-200">
//               <div className="px-4">
//                 <div className="text-base font-medium text-gray-800">
//                   {user.name || user.email}
//                 </div>
//                 <a
//                   href="/auth/logout"
//                   className="mt-3 block text-base font-medium text-gray-600 hover:text-gray-900"
//                 >
//                   Sign Out
//                 </a>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navigation;

// src/app/components/Navigation.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Users, UserPlus, Calendar, BarChart3, TrendingUp, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navigation = () => {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Players', href: '/players', icon: UserPlus },
    { name: 'Matches', href: '/matches', icon: Calendar },
    { name: 'Statistics', href: '/statistics', icon: BarChart3 },
    { name: 'Player Stats', href: '/player-statistics', icon: TrendingUp },
    { name: 'Team Stats', href: '/team-statistics', icon: Users },
  ];

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Bowling Manager</span>
            </div>
            <div className="flex items-center">
              <a
                href="/api/auth/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Bowling Manager</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name || user.email}
              </span>
              <a
                href="/api/auth/logout"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4">
                <div className="text-base font-medium text-gray-800">
                  {user.name || user.email}
                </div>
                <a
                  href="/api/auth/logout"
                  className="mt-3 block text-base font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;