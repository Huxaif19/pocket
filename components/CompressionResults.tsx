import Image from "next/image";
import { CompressionStats } from "../types/compression";
import { formatSize } from "../helpers/formatters";

interface CompressionResultsProps {
  resultUrl: string | null;
  stats: CompressionStats | null;
  onDownload: () => void;
  onNewImage: () => void;
}

export function CompressionResults({ resultUrl, stats, onDownload, onNewImage }: CompressionResultsProps) {
  return (
    <section className="animate-fade-in space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Large Result Preview */}
        <div className="md:col-span-2 overflow-hidden rounded-3xl glass-morphism border-gold/40">
          <div className="relative aspect-[4/3] w-full bg-zinc-900">
            {resultUrl && (
              <Image
                src={resultUrl}
                alt="Result"
                fill
                className="object-contain p-4"
              />
            )}
          </div>
        </div>

        {/* Vertical Dashboard */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 rounded-3xl glass-morphism p-6 flex flex-col justify-center text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Saved</p>
            <p className="text-6xl font-black text-gold">{stats?.savedPercent}%</p>
            <p className="mt-2 text-sm font-medium text-zinc-400">{formatSize(stats?.savedBytes || 0)} lighter</p>
          </div>
          
          <div className="rounded-3xl glass-morphism p-6 space-y-3">
             <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-500 uppercase">Original</span>
                <span className="text-zinc-300">{formatSize(stats?.originalSize || 0)}</span>
             </div>
             <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-500 uppercase">Final</span>
                <span className="text-zinc-100">{formatSize(stats?.compressedSize || 0)}</span>
             </div>
             <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-500 uppercase">Scale</span>
                <span className="text-zinc-100">{Math.round((stats?.appliedScale || 1.0) * 100)}%</span>
             </div>
             <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-500 uppercase">Format</span>
                <span className="text-gold uppercase">{stats?.format}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Final Actions */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={onDownload}
          className="flex-1 rounded-2xl gold-gradient py-5 text-lg font-black text-zinc-950 transition-all hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(197,160,89,0.5)]"
        >
           Download File
           <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
           </svg>
        </button>
        <button
          onClick={onNewImage}
          className="rounded-2xl bg-zinc-900 px-8 py-5 text-lg font-bold text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-100 border border-white/5 active:scale-[0.99]"
        >
          New Image
        </button>
      </div>
    </section>
  );
}
