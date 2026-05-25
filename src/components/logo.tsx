import { MailIcon } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSizes = { sm: "size-5", md: "size-7", lg: "size-9" };
  const textSizes = { sm: "text-sm", md: "text-base", lg: "text-lg" };

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex items-center justify-center rounded-lg bg-foreground/5 p-1.5 text-foreground ${iconSizes[size]}`}>
        <MailIcon className="size-full" />
      </div>
      {showText && (
        <span className={`font-semibold tracking-tight ${textSizes[size]}`}>
          MailTemplates
        </span>
      )}
    </div>
  );
}
