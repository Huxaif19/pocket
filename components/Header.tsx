export function Header() {
  return (
    <header className="mb-16 text-center animate-fade-in">
      <div className="mb-4 inline-block rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold tracking-widest text-gold uppercase shadow-[0_0_20px_rgba(197,160,89,0.1)] border border-gold/20">
        Professional Image Optimizer
      </div>
      <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-7xl">
        <span className="gold-text-gradient">Pocket</span>
      </h1>
      <p className="mx-auto max-w-lg text-lg text-zinc-400">
        Engineered for precision. Compress images without losing the details that matter.
      </p>
    </header>
  );
}
