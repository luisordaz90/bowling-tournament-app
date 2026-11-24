// app/components/Breadcrumb.tsx
'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-1 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-gray-700">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-3.5 w-3.5 mx-1 text-gray-400 flex-shrink-0" />
              {isLast || !item.href ? (
                <span className="font-medium text-gray-900 truncate max-w-[200px]">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-gray-700 truncate max-w-[200px]">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
