import { useState } from "react";
import placeholder from "@/assets/pastry-placeholder.jpg";
import { cn } from "@/lib/utils";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
}

export function ProductImage({ src, alt, className, ...rest }: Props) {
  const [errored, setErrored] = useState(false);
  const resolved = !src || errored ? placeholder : src;
  return (
    <img
      {...rest}
      src={resolved}
      alt={alt}
      onError={() => setErrored(true)}
      className={cn("h-full w-full object-cover", className)}
      loading={rest.loading ?? "lazy"}
    />
  );
}