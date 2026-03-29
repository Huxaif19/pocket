"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type CompressionMode = "quality" | "targetSize";
type OutputFormat = "webp" | "jpeg" | "png" | "avif";

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: string;
  appliedQuality: number;
  appliedScale: number;
  format: string;
}

export default function Home() {
  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<CompressionMode>("quality");
  const [format, setFormat] = useState<OutputFormat>("webp");
  const [quality, setQuality] = useState<number>(80);
  const [targetSizeKb, setTargetSizeKb] = useState<number>(200);
  
  const [isCompressing, setIsCompressing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processSelectedFile(selected);
    }
  };

  const processSelectedFile = (selected: File) => {
    if (!selected.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setFile(selected);
    setError(null);
    setResultBlob(null);
    setResultUrl(null);
    setStats(null);
    
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultBlob(null);
    setResultUrl(null);
    setStats(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const compressImage = async () => {
    if (!file) return;

    setIsCompressing(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("outputFormat", format);
    formData.append("mode", mode);
    
    if (mode === "quality") {
      formData.append("quality", quality.toString());
    } else {
      formData.append("targetSizeKb", targetSizeKb.toString());
    }

    try {
      const response = await fetch("/api/v1/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Compression failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setResultBlob(blob);
      setResultUrl(url);

      // Extract stats from headers
      setStats({
        originalSize: Number(response.headers.get("X-Original-Size")),
        compressedSize: Number(response.headers.get("X-Compressed-Size")),
        savedBytes: Number(response.headers.get("X-Saved-Bytes")),
        savedPercent: response.headers.get("X-Saved-Percent") || "0",
        appliedQuality: Number(response.headers.get("X-Applied-Quality")),
        appliedScale: Number(response.headers.get("X-Applied-Scale") || "1.0"),
        format: response.headers.get("Content-Type")?.split("/")[1] || format,
      });

      // Scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      setError(err.message || "Something went wrong during compression.");
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;
    
    // Extract name without extension
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const finalName = `${baseName}-compression.${format}`;

    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Persistence & Cleanup ---
  
  // Hydrate on mount
  useEffect(() => {
    const saved = localStorage.getItem("pocketState");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMode(parsed.mode || "quality");
        setFormat(parsed.format || "webp");
        setQuality(parsed.quality || 80);
        setTargetSizeKb(parsed.targetSizeKb || 200);
        
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.resultData) {
          // Convert base64 back to Blob
          const res = fetch(parsed.resultData).then(res => res.blob()).then(blob => {
            setResultBlob(blob);
            setResultUrl(URL.createObjectURL(blob));
          });
        }
      } catch (e) {
        console.error("Failed to hydrate state", e);
      }
    }
  }, []);

  // Persist on change
  useEffect(() => {
    const state = {
      mode,
      format,
      quality,
      targetSizeKb,
      stats,
    };

    if (!resultBlob) {
      localStorage.setItem("pocketState", JSON.stringify(state));
      return;
    }

    // If we have a blob, convert to base64 and try to save
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        localStorage.setItem("pocketState", JSON.stringify({
          ...state,
          resultData: reader.result
        }));
      } catch (e) {
        // If quota exceeded, just save stats without the image data
        localStorage.setItem("pocketState", JSON.stringify(state));
      }
    };
    reader.readAsDataURL(resultBlob);
  }, [mode, format, quality, targetSizeKb, stats, resultBlob]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-gold/30">
      <main className="mx-auto max-w-4xl px-6 py-4 md:py-8">
        {/* Header */}
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

        <div className="grid gap-12">
          {/* Main Interaction Area */}
          {!resultBlob ? (
            <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="glass-morphism rounded-3xl p-8 transition-all hover:border-gold/30">
                {!file ? (
                  // Step 1: Dropzone
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 transition-all hover:bg-zinc-900/80 hover:border-gold/40"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="mb-4 rounded-full bg-zinc-800 p-4 transition-transform group-hover:scale-110 group-hover:bg-gold/10">
                      <svg className="h-8 w-8 text-zinc-400 group-hover:text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-xl font-medium text-zinc-300">Drop image here</p>
                    <p className="mt-2 text-sm text-zinc-500">or click to browse files</p>
                  </div>
                ) : (
                  // Step 2: Settings & Preview
                  <div className="space-y-8">
                    {/* Preview Strip */}
                    <div className="flex items-center gap-6 rounded-2xl bg-zinc-900/50 p-4 border border-white/5">
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-zinc-800 shadow-xl">
                        {previewUrl && (
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-bold text-zinc-200">{file.name}</p>
                        <p className="text-sm font-medium text-zinc-500">{formatSize(file.size)} • {file.type.split("/")[1].toUpperCase()}</p>
                      </div>
                      <button
                        onClick={reset}
                        className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Remove file"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

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

                    {/* Action Button */}
                    <button
                      onClick={compressImage}
                      disabled={isCompressing}
                      className="group relative w-full overflow-hidden rounded-2xl bg-zinc-100 py-5 text-lg font-black text-zinc-950 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gold translate-y-full transition-transform group-hover:translate-y-0" />
                      <span className="relative flex items-center justify-center gap-3">
                        {isCompressing ? (
                          <>
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Optimizing...
                          </>
                        ) : (
                          <>
                            Compress Image
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>
                    
                    {error && (
                      <p className="text-center text-xs font-bold text-red-400 animate-fade-in">{error}</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          ) : (
            // Step 3: Success / Results
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
                  onClick={downloadResult}
                  className="flex-1 rounded-2xl gold-gradient py-5 text-lg font-black text-zinc-950 transition-all hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(197,160,89,0.5)]"
                >
                   Download File
                   <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                </button>
                <button
                  onClick={reset}
                  className="rounded-2xl bg-zinc-900 px-8 py-5 text-lg font-bold text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-100 border border-white/5 active:scale-[0.99]"
                >
                  New Image
                </button>
              </div>
            </section>
          )}

          {/* Footer Features */}
          <footer className="grid grid-cols-1 gap-6 md:grid-cols-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {[
              { title: "Smart Compression", desc: "Binary search algorithms find the best quality within your limit." },
              { title: "Next-Gen Formats", desc: "Export effortlessly to AVIF and WebP for ultimate web performance." },
              { title: "Privacy First", desc: "All processing happens in memory. No persistent storage is ever used." },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6">
                <h3 className="mb-2 text-sm font-bold text-gold">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </footer>
        </div>
      </main>
    </div>
  );
}
