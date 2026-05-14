export default function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-50 flex justify-between items-center w-full px-6 py-3 bg-surface/70 dark:bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 shadow-md shadow-black/40">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim cursor-pointer">menu</span>
        <span className="text-2xl font-semibold tracking-tight leading-snug font-bold text-primary dark:text-primary-fixed-dim tracking-tight">Briefly</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim cursor-pointer hover:bg-surface-container-high/50 transition-colors p-1 rounded-full">notifications</span>
        <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim cursor-pointer hover:bg-surface-container-high/50 transition-colors p-1 rounded-full">help_outline</span>
        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden ml-sm cursor-pointer">
          <img alt="User profile settings" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY9YKI_91DcEoht7Xh0mBrgooTLOTgjLtALWiCCTcKBmkQrsBOL0qlYKZRC6JXJ6PbhuGDAaW97cxhnGEvD897CdptFKlVSY9LFFJ2d3AdRNxUSpwRr2R7cmnGXlCqXHShyP5dVwMr1xabrXOKXbpb-a6k9eVqwryTrLohMJp_f_2wKxjqsu9z2m8xSquNv2p0lP2Ckug85wPvl-z68bLkEHnig55b4O5Xma8yCh9MEf6nOo5okORIfcFnMJenrp0zJFgfT2oo6xs"/>
        </div>
      </div>
    </header>
  );
}
