import { useEffect } from "react";
import { CompressionMode, OutputFormat, CompressionStats } from "../types/compression";

interface PersistenceProps {
  mode: CompressionMode;
  format: OutputFormat;
  quality: number;
  targetSizeKb: number;
  stats: CompressionStats | null;
  resultBlob: Blob | null;
  setMode: (m: CompressionMode) => void;
  setFormat: (f: OutputFormat) => void;
  setQuality: (q: number) => void;
  setTargetSizeKb: (s: number) => void;
  setStats: (s: CompressionStats | null) => void;
  setResultBlob: (b: Blob | null) => void;
  setResultUrl: (u: string | null) => void;
}

export function usePersistence({
  mode, format, quality, targetSizeKb, stats, resultBlob,
  setMode, setFormat, setQuality, setTargetSizeKb, setStats, setResultBlob, setResultUrl
}: PersistenceProps) {
  
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
          fetch(parsed.resultData)
            .then(res => res.blob())
            .then(blob => {
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
    const state = { mode, format, quality, targetSizeKb, stats };

    if (!resultBlob) {
      localStorage.setItem("pocketState", JSON.stringify(state));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        localStorage.setItem("pocketState", JSON.stringify({
          ...state,
          resultData: reader.result
        }));
      } catch (e) {
        localStorage.setItem("pocketState", JSON.stringify(state));
      }
    };
    reader.readAsDataURL(resultBlob);
  }, [mode, format, quality, targetSizeKb, stats, resultBlob]);
}
