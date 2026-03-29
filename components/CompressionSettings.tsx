import { CompressionMode, OutputFormat } from "../types/compression";

interface CompressionSettingsProps {
  mode: CompressionMode;
  setMode: (mode: CompressionMode) => void;
  format: OutputFormat;
  setFormat: (format: OutputFormat) => void;
  quality: number;
  setQuality: (quality: number) => void;
  targetSizeKb: number;
  setTargetSizeKb: (targetSizeKb: number) => void;
}

export function CompressionSettings({
  mode, setMode, format, setFormat, quality, setQuality, targetSizeKb, setTargetSizeKb
}: CompressionSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Settings Grid */}
      <div className="grid gap-8 md:grid-cols-2">
          {/* Format Selection */}
          <div className="space-y-4">
          <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Target Format</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
            {(["webp", "jpeg", "png", "avif"] as OutputFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`rounded-xl py-2 text-sm font-bold uppercase transition-all ${
                  format === f 
                    ? "bg-gold text-zinc-950 shadow-[0_0_15px_rgba(197,160,89,0.4)]" 
                    : "bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mode / Quality Switch */}
        <div className="space-y-4">
          <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Optimization Mode</label>
          <div className="flex rounded-xl bg-zinc-900 p-1 border border-white/5">
            <button
              onClick={() => setMode("quality")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                mode === "quality" ? "bg-zinc-800 text-gold shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Quality
            </button>
            <button
              onClick={() => setMode("targetSize")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                mode === "targetSize" ? "bg-zinc-800 text-gold shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              File Size
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Sliders / Inputs */}
      <div className="rounded-2xl bg-zinc-900/30 p-6 border border-white/5">
        {mode === "quality" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Compression Level</span>
              <span className="rounded bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">{quality}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-gold"
            />
            <div className="flex justify-between text-[10px] uppercase tracking-tighter text-zinc-600 font-bold">
              <span>Maximum Compression</span>
              <span>Highest Quality</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Target File Size</label>
              <span className="rounded bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">Limit Applied</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={targetSizeKb}
                onChange={(e) => setTargetSizeKb(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl bg-zinc-800 p-4 pr-12 text-2xl font-bold text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-gold/50 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-600">KB</div>
            </div>
            <p className="text-[10px] uppercase tracking-tighter text-zinc-600 font-bold">
              Backend will find the highest quality setting within this limit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
