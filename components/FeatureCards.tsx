const FEATURES = [
  { title: "Smart Compression", desc: "Binary search algorithms find the best quality within your limit." },
  { title: "Next-Gen Formats", desc: "Export effortlessly to AVIF and WebP for ultimate web performance." },
  { title: "Privacy First", desc: "All processing happens in memory. No persistent storage is ever used." },
];

export function FeatureCards() {
  return (
    <footer className="grid grid-cols-1 gap-6 md:grid-cols-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
      {FEATURES.map((feature, i) => (
        <div key={i} className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6">
          <h3 className="mb-2 text-sm font-bold text-gold">{feature.title}</h3>
          <p className="text-xs leading-relaxed text-zinc-500">{feature.desc}</p>
        </div>
      ))}
    </footer>
  );
}
