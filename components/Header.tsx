export function Header() {
  return (
    <header className="mb-5 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end animate-fade-in">
      {/* Left Side: Personal Branding */}
      <div className="flex flex-col items-start space-y-2">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
           huzaif ahmad shah
        </h2>
        <div className="inline-block rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold tracking-widest text-gold uppercase border border-gold/20">
          Professional Image Optimizer
        </div>
        <a 
          href="https://portfolio-one-rust-51.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group mt-2 flex items-center gap-1.5 text-xs font-bold text-zinc-400 transition-all hover:text-gold"
        >
          <span>View Portfolio</span>
          <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Right Side / Main Title: Pocket */}
      <div className="text-left md:text-right">
        <h1 className="text-6xl font-black tracking-tighter md:text-8xl">
          <span className="gold-text-gradient">Pocket</span>
        </h1>
        <p className="max-w-xs text-sm font-medium leading-relaxed text-zinc-500 md:ml-auto">
          Precision-engineered compression. No detail left behind.
        </p>
      </div>
    </header>
  );
}
