"use client";

import Footer from "@/components/Footer";
import Link from "next/link";

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full transition-colors duration-300">
      {/* Consistent Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 shadow-sm transition-colors">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-on-surface">Briefly</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6">
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Features
            </button>
          </nav>
          <Link href="/dashboard" className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-primary/20">
            Open App
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-16 pb-xl md:pt-[120px] md:pb-[80px] px-6 md:px-6 overflow-hidden flex flex-col md:flex-row items-center gap-12 max-w-7xl mx-auto">
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-container/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>

          <div className="flex-1 flex flex-col items-start gap-8 z-10">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container-low/50">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-mono font-medium tracking-wide uppercase text-on-surface-variant uppercase tracking-widest">Briefly AI 2.0</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-on-surface">
              Turn messy client messages into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed-dim to-tertiary-fixed-dim">clean project briefs.</span>
            </h1>

            <p className="text-lg leading-relaxed text-on-surface-variant max-w-[540px]">
              Briefly AI transforms chaotic voice notes, scattered emails, and rough sketches into structured, actionable project specifications in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/new-brief" className="px-10 py-5 rounded-xl bg-primary text-on-primary text-lg font-bold hover:brightness-110 transition-all shadow-xl shadow-primary/25 text-center">
                Generate Brief Now
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full relative z-10 [perspective:1000px]">
            {/* Premium Dashboard Mockup Preview */}
            <div className="bg-[#18181b]/70 backdrop-blur-md border border-[#27272a] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 [transform:rotateY(-5deg)_rotateX(2deg)] hover:[transform:rotateY(0)_rotateX(0)]">
              {/* Fake Top Bar */}
              <div className="h-10 border-b border-outline-variant/30 flex items-center px-3 gap-1 bg-surface-container-highest/50">
                <div className="w-3 h-3 rounded-full bg-error/50"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary/50"></div>
                <div className="w-3 h-3 rounded-full bg-primary/50"></div>
              </div>

              {/* Fake Content Area */}
              <div className="p-4 grid grid-cols-3 gap-3 h-[300px] md:h-[400px]">
                {/* Sidebar Area */}
                <div className="col-span-1 border-r border-outline-variant/20 pr-sm flex flex-col gap-3">
                  <div className="h-8 rounded bg-surface-container-high/50 w-full"></div>
                  <div className="h-8 rounded bg-primary-container/20 border border-primary/30 w-full flex items-center px-3">
                    <span className="w-2 h-2 rounded-full bg-primary mr-sm"></span>
                  </div>
                  <div className="h-8 rounded bg-surface-container-high/50 w-3/4"></div>
                </div>

                {/* Main Area */}
                <div className="col-span-2 flex flex-col gap-4 pl-sm">
                  <div className="h-12 rounded-lg bg-surface-container-high/30 border border-outline-variant/20 flex items-center px-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container mr-sm"></div>
                    <div className="flex-1 h-4 rounded bg-surface-container"></div>
                  </div>

                  {/* AI Generated Block */}
                  <div className="flex-1 rounded-lg bg-surface/50 border border-primary/20 shadow-[0_0_20px_rgba(207,188,255,0.15)] p-3 flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-fixed-dim to-transparent"></div>
                    <div className="h-6 rounded bg-surface-container-high w-1/3"></div>
                    <div className="h-4 rounded bg-surface-container-low w-full mt-3"></div>
                    <div className="h-4 rounded bg-surface-container-low w-5/6"></div>
                    <div className="h-4 rounded bg-surface-container-low w-4/6"></div>
                    <div className="mt-auto flex gap-1">
                      <div className="h-6 rounded-full bg-secondary-container/30 border border-secondary/20 w-16"></div>
                      <div className="h-6 rounded-full bg-tertiary-container/30 border border-tertiary/20 w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 md:px-6 max-w-7xl mx-auto border-t border-outline-variant/10" id="how-it-works">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-on-surface mb-3">How It Works</h2>
            <p className="text-base leading-relaxed text-on-surface-variant max-w-2xl mx-auto">From chaos to clarity in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-2xl font-black text-primary shadow-sm">1</div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">Capture Input</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">Upload voice notes, meeting transcripts, or project screenshots directly into the workspace.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-2xl font-black text-tertiary shadow-sm">2</div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">AI Synthesis</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">Our engine analyzes the data, resolves contradictions, and extracts key requirements automatically.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-2xl font-black text-secondary shadow-sm">3</div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">Confirm & Share</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">Review the structured brief, make final edits, and share a professional link with your client for approval.</p>
            </div>

            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/20 via-tertiary/20 to-secondary/20 -z-0"></div>
          </div>
        </section>

        {/* Features / Benefits Bento Grid */}
        <section className="py-8 md:py-2xl px-6 md:px-6 max-w-7xl mx-auto" id="features">
          <div className="mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-on-surface mb-3">Why Briefly?</h2>
            <p className="text-base leading-relaxed text-on-surface-variant max-w-2xl mx-auto">Stop translating client-speak. Start building.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Benefit 1 */}
            <div className="bg-surface border border-outline-variant/20 rounded-2xl p-8 flex flex-col gap-4 hover:border-primary/50 transition-all group shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">timer</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface mt-2">Save Time</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">Cut intake time by 80%. Automated processing turns raw input into structured briefs instantly.</p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-surface border border-outline-variant/20 rounded-2xl p-8 flex flex-col gap-4 hover:border-tertiary/50 transition-all group shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">blur_off</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface mt-2">Reduce Ambiguity</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">AI highlights missing requirements and conflicting requests before you start the project.</p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-surface border border-outline-variant/20 rounded-2xl p-8 flex flex-col gap-4 hover:border-secondary/50 transition-all group shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">handshake</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface mt-2">Fewer Misunderstandings</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">Generate clear, standardized documentation that both clients and developers agree on.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
