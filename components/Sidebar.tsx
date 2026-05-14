"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const getLinkClasses = (path: string, exact: boolean = false) => {
    const isActive = exact ? pathname === path : pathname.startsWith(path);
    return `flex items-center gap-4 rounded-lg px-4 py-3 transition-all border ${isActive
        ? 'bg-secondary-container text-on-secondary-container border-primary/20 shadow-sm'
        : 'text-on-surface-variant border-transparent bg-surface-container-low/30 hover:text-on-surface hover:bg-surface-container-highest/50 hover:border-outline-variant/20'
      }`;
  };

  return (
    <nav className="hidden md:flex flex-col h-full p-4 gap-3 sticky left-0 top-0 h-screen w-64 shrink-0 bg-surface-container border-r border-outline-variant/20 z-40">
      <Link href="/" className="flex items-center gap-3 px-3 py-4 mb-6 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight leading-snug font-black text-on-surface">Briefly</h1>
          <p className="text-xs font-mono font-medium tracking-wide uppercase text-on-surface-variant uppercase tracking-widest mt-1">AI Project Intake</p>
        </div>
      </Link>

      <div className="flex flex-col gap-1 flex-grow">
        <Link className={getLinkClasses('/dashboard', true)} href="/dashboard">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          Dashboard
        </Link>
        <Link className={getLinkClasses('/new-brief')} href="/new-brief">
          <span className="material-symbols-outlined">add_box</span>
          New Brief
        </Link>
        <Link className={getLinkClasses('/brief-history')} href="/brief-history">
          <span className="material-symbols-outlined">history</span>
          Brief History
        </Link>
      </div>

      <div className="mt-auto flex flex-col gap-1">
        <Link className={getLinkClasses('/settings', true)} href="/settings">
          <span className="material-symbols-outlined">settings</span>
          Settings
        </Link>
      </div>
    </nav>
  );
}
