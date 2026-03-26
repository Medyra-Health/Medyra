'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, FileText, User } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function MobileNav() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/upload', icon: Upload, label: 'Upload' },
    { href: '/dashboard', icon: FileText, label: 'Reports' },
    { href: isSignedIn ? '/dashboard' : '/sign-in', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
