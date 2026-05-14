export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">Briefly</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
