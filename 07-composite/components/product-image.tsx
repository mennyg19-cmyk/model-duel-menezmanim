import Image from "next/image";

import { cn } from "@/lib/cn";

// Product photo or fallback glyph. Local-driver uploads (/uploads/<name>) are
// same-origin; Vercel Blob URLs match the remotePattern in next.config.mjs —
// both are optimizable, so this renders through next/image with `fill` inside
// a wrapper that keeps the caller's original sizing classes.
export function ProductImage({
  src,
  alt,
  className,
  glyphSize = 48,
}: {
  src: string | null;
  alt: string;
  className: string;
  glyphSize?: number;
}) {
  if (!src) return <PackageGlyph size={glyphSize} />;
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
    </span>
  );
}

export function PackageGlyph({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3l9 5-9 5-9-5 9-5z" strokeLinejoin="round" />
      <path d="M3 8v8l9 5 9-5V8" strokeLinejoin="round" />
      <path d="M12 13v8" strokeLinecap="round" />
    </svg>
  );
}
