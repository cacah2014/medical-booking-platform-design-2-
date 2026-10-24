import {
  Baby,
  Bone,
  Brain,
  BrainCircuit,
  Ear,
  Eye,
  FlaskConical,
  HeartPulse,
  Smile,
  Sparkles,
  Stethoscope,
  ToyBrick,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SPECIALTY_ICONS: Record<string, LucideIcon> = {
  HeartPulse,
  Baby,
  Sparkles,
  ToyBrick,
  Brain,
  Smile,
  Ear,
  BrainCircuit,
  Bone,
  Eye,
  Stethoscope,
  FlaskConical,
};

export const TINTS: Record<
  string,
  { tile: string; icon: string; soft: string; hoverBg: string; ring: string }
> = {
  jade: { tile: "bg-jade-100", icon: "text-jade-700", soft: "bg-jade-50", hoverBg: "hover:bg-jade-50", ring: "group-hover:ring-jade-300" },
  coral: { tile: "bg-coral-100", icon: "text-coral-600", soft: "bg-coral-50", hoverBg: "hover:bg-coral-50", ring: "group-hover:ring-coral-300" },
  sun: { tile: "bg-sun-100", icon: "text-sun-600", soft: "bg-sun-100/60", hoverBg: "hover:bg-sun-100/60", ring: "group-hover:ring-sun-300" },
  mist: { tile: "bg-sand", icon: "text-ink-soft", soft: "bg-paper", hoverBg: "hover:bg-paper", ring: "group-hover:ring-line" },
};

export function SpecialtyIcon({
  icon,
  tint = "jade",
  className,
  iconClassName,
}: {
  icon: string;
  tint?: string;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = SPECIALTY_ICONS[icon] ?? Stethoscope;
  const t = TINTS[tint] ?? TINTS.jade;
  return (
    <span className={cn("grid place-items-center rounded-2xl", t.tile, className)}>
      <Icon className={cn("size-[55%]", t.icon, iconClassName)} strokeWidth={1.9} />
    </span>
  );
}

export function tintOf(tint: string) {
  return TINTS[tint] ?? TINTS.jade;
}
