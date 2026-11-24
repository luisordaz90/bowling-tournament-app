// app/components/Navigation.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Trophy, Users, UserPlus, Calendar, BarChart3, Menu, X, Globe } from 'lucide-react';
import { useState, useTransition } from 'react';

function LanguageSwitcher() {
  const locale = useLocale();
  const [, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    startTransition(() => {
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center space-x-1 text-sm">
      <Globe className="h-3.5 w-3.5 text-gray-400" />
      <button
        onClick={() => switchLocale('en')}
        className={`px-1 ${locale === 'en' ? 'text-blue-600 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => switchLocale('es')}
        className={`px-1 ${locale === 'es' ? 'text-blue-600 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
      >
        ES
      </button>
    </div>
  );
}

const Navigation = () => {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('tournaments'), href: '/tournaments', icon: Trophy },
    { name: t('teams'), href: '/teams', icon: Users },
    { name: t('players'), href: '/players', icon: UserPlus },
    { name: t('matches'), href: '/matches', icon: Calendar },
    { name: t('statistics'), href: '/statistics', icon: BarChart3 },
  ];

  if (isLoading) return <div>{tCommon('loading')}</div>;

  if (!user) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Bowling Manager</span>
            </Link>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <a
                href="/auth/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('signIn')}
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
          {/* Logo — links to dashboard */}
          <Link href="/" className="flex items-center">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Bowling Manager</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
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
              <LanguageSwitcher />
              <span className="text-sm text-gray-600">
                {t('welcome', { name: String(user.name || user.email || '') })}
              </span>
              <a
                href="/auth/logout"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t('signOut')}
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
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
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
                <div className="mt-2">
                  <LanguageSwitcher />
                </div>
                <a
                  href="/auth/logout"
                  className="mt-3 block text-base font-medium text-gray-600 hover:text-gray-900"
                >
                  {t('signOut')}
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
