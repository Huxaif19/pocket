import { useState, useRef } from "react";
import { CompressionMode, OutputFormat, CompressionStats } from "../types/compression";

export function useCompression() {
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

  const processSelectedFile = (selected: File) => {
    if (!selected.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setFile(selected);
    setError(null);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setStats(null);
    
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processSelectedFile(selected);
    }
  };

  const reset = () => {
    setFile(null);
    if (previewUrl) setPreviewUrl(null);
    setResultBlob(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    setStats(null);
    setError(null);
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

      setStats({
        originalSize: Number(response.headers.get("X-Original-Size")),
        compressedSize: Number(response.headers.get("X-Compressed-Size")),
        savedBytes: Number(response.headers.get("X-Saved-Bytes")),
        savedPercent: response.headers.get("X-Saved-Percent") || "0",
        appliedQuality: Number(response.headers.get("X-Applied-Quality")),
        appliedScale: Number(response.headers.get("X-Applied-Scale") || "1.0"),
        format: response.headers.get("Content-Type")?.split("/")[1] || format,
      });

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
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const finalName = `${baseName}-compression.${format}`;

    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    file, previewUrl, mode, format, quality, targetSizeKb,
    isCompressing, resultBlob, resultUrl, stats, error,
    fileInputRef,
    setMode, setFormat, setQuality, setTargetSizeKb,
    handleFileChange, processSelectedFile, reset, compressImage, downloadResult,
    setStats, setResultBlob, setResultUrl
  };
}
