import { RefObject } from "react";

interface DropzoneProps {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Dropzone({ onDragOver, onDrop, onClick, fileInputRef, onFileChange }: DropzoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      className="group relative flex h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 transition-all hover:bg-zinc-900/80 hover:border-gold/40"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
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
  );
}
