"use client";

import { useCompression } from "../hooks/useCompression";
import { usePersistence } from "../hooks/usePersistence";
import { Header } from "../components/Header";
import { Dropzone } from "../components/Dropzone";
import { PreviewStrip } from "../components/PreviewStrip";
import { CompressionSettings } from "../components/CompressionSettings";
import { CompressionResults } from "../components/CompressionResults";
import { FeatureCards } from "../components/FeatureCards";
import { Footer } from "@/components/Footer";

export default function Home() {
  const compression = useCompression();
  
  // Persistence logic
  usePersistence({
    mode: compression.mode,
    format: compression.format,
    quality: compression.quality,
    targetSizeKb: compression.targetSizeKb,
    stats: compression.stats,
    resultBlob: compression.resultBlob,
    setMode: compression.setMode,
    setFormat: compression.setFormat,
    setQuality: compression.setQuality,
    setTargetSizeKb: compression.setTargetSizeKb,
    setStats: compression.setStats,
    setResultBlob: compression.setResultBlob,
    setResultUrl: compression.setResultUrl,
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      compression.processSelectedFile(droppedFile);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-gold/30">
      <main className="mx-auto max-w-4xl px-6">
        <Header />

        <div className="grid gap-12">
          {/* Main Interaction Area */}
          {!compression.resultBlob ? (
            <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="glass-morphism rounded-3xl p-8 transition-all hover:border-gold/30">
                {!compression.file ? (
                  <Dropzone
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => compression.fileInputRef.current?.click()}
                    fileInputRef={compression.fileInputRef}
                    onFileChange={compression.handleFileChange}
                  />
                ) : (
                  <div className="space-y-8">
                    <PreviewStrip
                      previewUrl={compression.previewUrl}
                      file={compression.file}
                      onReset={compression.reset}
                    />

                    <CompressionSettings
                      mode={compression.mode}
                      setMode={compression.setMode}
                      format={compression.format}
                      setFormat={compression.setFormat}
                      quality={compression.quality}
                      setQuality={compression.setQuality}
                      targetSizeKb={compression.targetSizeKb}
                      setTargetSizeKb={compression.setTargetSizeKb}
                      targetUnit={compression.targetUnit}
                      setTargetUnit={compression.setTargetUnit}
                    />

                    {/* Action Button */}
                    <button
                      onClick={compression.compressImage}
                      disabled={compression.isCompressing}
                      className="group relative w-full overflow-hidden rounded-2xl bg-zinc-100 py-5 text-lg font-black text-zinc-950 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gold translate-y-full transition-transform group-hover:translate-y-0" />
                      <span className="relative flex items-center justify-center gap-3">
                        {compression.isCompressing ? (
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
                    
                    {compression.error && (
                      <p className="text-center text-xs font-bold text-red-400 animate-fade-in">{compression.error}</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <CompressionResults
              resultUrl={compression.resultUrl}
              stats={compression.stats}
              onDownload={compression.downloadResult}
              onNewImage={compression.reset}
            />
          )}

          <FeatureCards />

          {/* Footer */}
          <Footer/>
        </div>
      </main>
    </div>
  );
}
