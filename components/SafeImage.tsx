"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

/**
 * Image with fallback when src fails (e.g. missing asset).
 * Shows a neutral placeholder instead of broken image.
 */
export default function SafeImage({
  src,
  alt,
  fallbackClassName = "bg-light-green/60",
  fill,
  ...props
}: ImageProps & { fallbackClassName?: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={fill ? `absolute inset-0 ${fallbackClassName}` : fallbackClassName}
        aria-label={alt || "Image"}
        style={!fill && props.width && props.height ? { width: props.width, height: props.height, minHeight: 48 } : undefined}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      onError={() => setError(true)}
      fill={fill}
      {...props}
    />
  );
}
