import Image from "next/image";
import { formatSize } from "../helpers/formatters";

interface PreviewStripProps {
  previewUrl: string | null;
  file: File;
  onReset: () => void;
}

export function PreviewStrip({ previewUrl, file, onReset }: PreviewStripProps) {
  return (
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
        onClick={onReset}
        className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
        title="Remove file"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
