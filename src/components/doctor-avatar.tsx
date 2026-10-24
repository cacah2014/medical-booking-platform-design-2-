import { cn } from "@/lib/utils";

/* Deterministic pastel variants for doctors without a photo */
const VARIANTS = [
  "bg-jade-100 text-jade-800",
  "bg-coral-100 text-coral-700",
  "bg-sun-100 text-sun-600",
  "bg-sand text-ink-soft",
];

export function initialsOf(fullName: string): string {
  const clean = fullName.replace(/^دکتر\s*/, "").trim();
  const parts = clean.split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]).join(" ");
}

export function DoctorAvatar({
  image,
  name,
  className,
  textClassName,
}: {
  image: string | null;
  name: string;
  className?: string;
  textClassName?: string;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt={name}
        loading="lazy"
        className={cn("object-cover", className)}
      />
    );
  }
  const variant = VARIANTS[name.length % VARIANTS.length];
  return (
    <span className={cn("grid place-items-center font-black", variant, className)}>
      <span className={textClassName}>{initialsOf(name)}</span>
    </span>
  );
}
