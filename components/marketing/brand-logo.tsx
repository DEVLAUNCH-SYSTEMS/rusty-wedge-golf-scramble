import Image from "next/image";

const LOGO_SRC = "/images/logo-hero.png";

const LOGO_IMAGE_CLASS = "max-h-full max-w-full object-contain object-center";

const SIZE_CONFIG = {
  hero: {
    container: "h-72 w-72 bg-rw-navy-logo p-[15px] ring-[3px]",
  },
  nav: {
    container: "h-11 w-11 bg-rw-navy-logo p-1 ring-2",
  },
  footer: {
    container: "h-16 w-16 bg-rw-navy-logo p-1.5 ring-2",
  },
  auth: {
    container: "h-24 w-24 bg-rw-navy-logo p-2 ring-[3px]",
  },
  registration: {
    container: "h-20 w-20 bg-rw-navy-logo p-2 ring-2",
  },
} as const;

type BrandLogoProps = {
  size: keyof typeof SIZE_CONFIG | "hero";
  priority?: boolean;
  className?: string;
};

function LogoFrame({
  containerClassName,
  priority,
  className,
}: {
  containerClassName: string;
  priority: boolean;
  className: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ring-rw-gold ${containerClassName} ${className}`}
    >
      <Image
        src={LOGO_SRC}
        alt="The Rusty Wedge Golf Scramble"
        width={1024}
        height={1024}
        priority={priority}
        unoptimized
        className={LOGO_IMAGE_CLASS}
      />
    </div>
  );
}

export function BrandLogo({ size, priority = false, className = "" }: BrandLogoProps) {
  const config = size === "hero" ? SIZE_CONFIG.hero : SIZE_CONFIG[size];

  return (
    <LogoFrame
      containerClassName={config.container}
      priority={priority}
      className={className}
    />
  );
}
