import Link from 'next/link';

export default function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`w-full bg-surface/30 backdrop-blur-sm border-t border-outline-variant/10 mt-auto ${className}`}>
      <div className="w-full max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-on-surface">Briefly</span>
        </div>

        <div className="text-[11px] font-mono font-medium uppercase tracking-widest text-on-surface-variant flex-1 text-center md:text-right">
          © 2024 Briefly AI • All rights reserved
        </div>
      </div>
    </footer>
  );
}
