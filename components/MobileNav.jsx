'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, LayoutDashboard, BookOpen, Tag } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function MobileNav() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  // Only show on public/home pages — hide on dashboard/upload/report/admin
  const hideOn = ['/upload', '/admin'];
  if (hideOn.some(p => pathname.startsWith(p))) return null;

  const navItems = isSignedIn
    ? [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/upload', icon: Upload, label: 'Upload' },
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/pricing', icon: Tag, label: 'Pricing' },
        { href: '/blog', icon: BookOpen, label: 'Blog' },
      ]
    : [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/pricing', icon: Tag, label: 'Pricing' },
        { href: '/blog', icon: BookOpen, label: 'Blog' },
      ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:hidden z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
