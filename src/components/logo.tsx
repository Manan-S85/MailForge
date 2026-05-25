interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSizes = { sm: "size-6", md: "size-8", lg: "size-10" };
  const textSizes = { sm: "text-sm", md: "text-base", lg: "text-xl" };

  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        <svg viewBox="0 0 32 32" fill="none" className="size-full">
          <rect x="1" y="1" width="30" height="30" rx="8" stroke="currentColor" strokeWidth="1" className="text-border" />
          <path
            d="M8 22V10l6.5 7.5a1.5 1.5 0 0 0 2.3 0L24 10v12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          />
          <path
            d="M16 17.5l-4-5.5h8l-4 5.5z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
            opacity="0.5"
          />
        </svg>
      </div>
      {showText && (
        <span className={`font-semibold tracking-tight ${textSizes[size]}`}>
          MailForge
        </span>
      )}
    </div>
  );
}
