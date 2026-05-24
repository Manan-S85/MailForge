import { MailIcon } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSizes = { sm: "size-5", md: "size-8", lg: "size-10" };
  const textSizes = { sm: "text-sm", md: "text-lg", lg: "text-xl" };

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 text-white shadow-sm ${iconSizes[size]}`}>
        <MailIcon className="size-full" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-semibold tracking-tight ${textSizes[size]}`}>
            MailTemplates
          </span>
          {size !== "sm" && (
            <span className="text-[10px] leading-none text-muted-foreground">
              Email Template Manager
            </span>
          )}
        </div>
      )}
    </div>
  );
}
