import type { SVGProps } from "react";

export type IOSIconName =
  | "home"
  | "book"
  | "checklist"
  | "sprout"
  | "calendar"
  | "support"
  | "help"
  | "logout"
  | "menu"
  | "palette"
  | "volume"
  | "volumeOff"
  | "chevronDown"
  | "arrowRight"
  | "leaf"
  | "pencil"
  | "clock"
  | "checkCircle"
  | "trophy"
  | "sparkles"
  | "info"
  | "math"
  | "heart"
  | "refresh"
  | "clipboard"
  | "check";

type IOSIconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IOSIconName;
  size?: number;
};

export function IOSIcon({
  name,
  size = 20,
  className = "",
  ...props
}: IOSIconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const glyph = (() => {
    switch (name) {
      case "home":
        return (
          <>
            <path {...common} d="M3.8 10.7 12 3.9l8.2 6.8" />
            <path {...common} d="M5.7 9.6v10.1h12.6V9.6" />
            <path {...common} d="M9.4 19.7v-6.1h5.2v6.1" />
          </>
        );
      case "book":
        return (
          <>
            <path {...common} d="M4.2 5.2c2.8-.8 5.2-.4 7.8 1.2v12.1c-2.6-1.6-5-2-7.8-1.2V5.2Z" />
            <path {...common} d="M19.8 5.2c-2.8-.8-5.2-.4-7.8 1.2v12.1c2.6-1.6 5-2 7.8-1.2V5.2Z" />
          </>
        );
      case "checklist":
        return (
          <>
            <rect {...common} x="4.1" y="3.9" width="15.8" height="16.2" rx="3.2" />
            <path {...common} d="m7.5 9 1.4 1.4 2.3-2.6M12.9 9h3.8M7.5 14.3l1.4 1.4 2.3-2.6M12.9 14.3h3.8" />
          </>
        );
      case "sprout":
        return (
          <>
            <path {...common} d="M12 20.1v-8.4" />
            <path {...common} d="M11.8 12.2C7.6 12 5.1 9.7 5.1 6c4.1-.4 6.5 1.5 6.7 6.2Z" />
            <path {...common} d="M12.2 10.7c.4-4.1 2.8-6.2 6.7-6.3.1 3.8-2.3 6.1-6.7 6.3Z" />
            <path {...common} d="M7.8 20.1h8.4" />
          </>
        );
      case "calendar":
        return (
          <>
            <rect {...common} x="3.7" y="5.2" width="16.6" height="15" rx="3" />
            <path {...common} d="M7.4 3.8v3M16.6 3.8v3M3.7 9.1h16.6" />
            <path {...common} d="M7.6 12.3h.1M11.9 12.3h.1M16.2 12.3h.1M7.6 16.1h.1M11.9 16.1h.1" />
          </>
        );
      case "support":
        return (
          <>
            <path {...common} d="M12 20.1c-4.1-2.7-7.1-5.4-7.1-9.4 0-2.4 1.7-4.1 4-4.1 1.4 0 2.5.7 3.1 1.8.6-1.1 1.7-1.8 3.1-1.8 2.3 0 4 1.7 4 4.1 0 4-3 6.7-7.1 9.4Z" />
            <path {...common} d="M9.2 13.8h2.1l1.1-2.5 1.3 4 1-1.5h2.1" />
          </>
        );
      case "help":
        return (
          <>
            <circle {...common} cx="12" cy="12" r="8.2" />
            <path {...common} d="M9.8 9.4a2.4 2.4 0 0 1 4.6.9c0 1.8-2.4 2-2.4 3.8M12 17.2h.01" />
          </>
        );
      case "logout":
        return (
          <>
            <path {...common} d="M10.1 4.2H6.3c-1.1 0-2 .9-2 2v11.6c0 1.1.9 2 2 2h3.8" />
            <path {...common} d="m14.3 8.1 3.9 3.9-3.9 3.9M18.2 12H9.6" />
          </>
        );
      case "menu":
        return <path {...common} d="M4.2 7.2h15.6M4.2 12h15.6M4.2 16.8h15.6" />;
      case "palette":
        return (
          <>
            <path {...common} d="M12 3.8a8.2 8.2 0 1 0 0 16.4h1.4c1.3 0 2.1-1.5 1.3-2.5-.6-.9 0-2.1 1.1-2.1h1.1c2 0 3.4-1.7 3.1-3.6-.7-4.7-3.8-8.2-8-8.2Z" />
            <circle cx="8.1" cy="8.1" r="1" fill="currentColor" />
            <circle cx="12.2" cy="6.7" r="1" fill="currentColor" />
            <circle cx="16" cy="8.9" r="1" fill="currentColor" />
            <circle cx="7.1" cy="12.4" r="1" fill="currentColor" />
          </>
        );
      case "volume":
        return (
          <>
            <path {...common} d="M4.2 10h3.2l4-3.3v10.6l-4-3.3H4.2v-4Z" />
            <path {...common} d="M15 9.1c1.4 1.2 1.4 4.6 0 5.8M17.5 6.8c3 2.7 3 7.7 0 10.4" />
          </>
        );
      case "volumeOff":
        return (
          <>
            <path {...common} d="M4.2 10h3.2l4-3.3v10.6l-4-3.3H4.2v-4Z" />
            <path {...common} d="m15.2 9.4 5.1 5.1M20.3 9.4l-5.1 5.1" />
          </>
        );
      case "chevronDown":
        return <path {...common} d="m6.6 9.4 5.4 5.3 5.4-5.3" />;
      case "arrowRight":
        return (
          <>
            <path {...common} d="M5 12h13.2" />
            <path {...common} d="m14.5 8.2 3.8 3.8-3.8 3.8" />
          </>
        );
      case "leaf":
        return (
          <>
            <path {...common} d="M19.6 4.4c-6.8.1-11.5 2.8-13.2 7.4-1.1 3 .1 5.8 2.9 6.7 3 .9 6-.3 7.6-3.4 1.6-3.2 2.1-6.5 2.7-10.7Z" />
            <path {...common} d="M6.5 19.6c1.4-4.1 4.5-7.8 9.5-10.6" />
          </>
        );
      case "pencil":
        return (
          <>
            <path {...common} d="m5.1 16.5-.8 3.2 3.2-.8L18.2 8.2l-2.4-2.4L5.1 16.5Z" />
            <path {...common} d="m14.8 6.8 2.4 2.4M4.8 16.8l2.4 2.4" />
          </>
        );
      case "clock":
        return (
          <>
            <circle {...common} cx="12" cy="12" r="8.2" />
            <path {...common} d="M12 7.4V12l3.2 2" />
          </>
        );
      case "checkCircle":
        return (
          <>
            <circle {...common} cx="12" cy="12" r="8.2" />
            <path {...common} d="m8.4 12.2 2.3 2.3 4.9-5" />
          </>
        );
      case "trophy":
        return (
          <>
            <path {...common} d="M8 4.8h8v4.5c0 3-1.5 5.1-4 5.1S8 12.3 8 9.3V4.8Z" />
            <path {...common} d="M8 7H5.2v1.5c0 2 1.2 3.3 3 3.5M16 7h2.8v1.5c0 2-1.2 3.3-3 3.5M12 14.4v3.3M8.7 20h6.6" />
          </>
        );
      case "sparkles":
        return (
          <>
            <path {...common} d="M9.3 4.2c.5 2.4 1.8 3.7 4.2 4.2-2.4.5-3.7 1.8-4.2 4.2-.5-2.4-1.8-3.7-4.2-4.2 2.4-.5 3.7-1.8 4.2-4.2Z" />
            <path {...common} d="M17 12.3c.4 1.8 1.3 2.7 3.1 3.1-1.8.4-2.7 1.3-3.1 3.1-.4-1.8-1.3-2.7-3.1-3.1 1.8-.4 2.7-1.3 3.1-3.1Z" />
          </>
        );
      case "info":
        return (
          <>
            <circle {...common} cx="12" cy="12" r="8.2" />
            <path {...common} d="M12 10.6v5.2M12 7.8h.01" />
          </>
        );
      case "math":
        return (
          <>
            <path {...common} d="M6 5.5v5M3.5 8h5M15.5 5.8l3 4M18.5 5.8l-3 4M3.8 16.4h4.4M15.1 14.5h4.2M15.1 18.3h4.2" />
          </>
        );
      case "heart":
        return <path {...common} d="M12 20.1c-4.2-2.7-7.1-5.4-7.1-9.4 0-2.4 1.7-4.1 4-4.1 1.4 0 2.5.7 3.1 1.8.6-1.1 1.7-1.8 3.1-1.8 2.3 0 4 1.7 4 4.1 0 4-2.9 6.7-7.1 9.4Z" />;
      case "refresh":
        return (
          <>
            <path {...common} d="M18.6 8.7V4.8l-2.1 2.1A7.8 7.8 0 1 0 19.7 14" />
            <path {...common} d="M18.6 4.8h-3.9" />
          </>
        );
      case "clipboard":
        return (
          <>
            <rect {...common} x="5.2" y="5.2" width="13.6" height="15" rx="2.7" />
            <path {...common} d="M9 5.2V4.6c0-.9.7-1.6 1.6-1.6h2.8c.9 0 1.6.7 1.6 1.6v.6M8.5 10h7M8.5 13.5h7M8.5 17h4.2" />
          </>
        );
      case "check":
        return <path {...common} d="m5.4 12.2 4 4 9.2-9.1" />;
      default:
        return null;
    }
  })();

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`ios-icon ${className}`.trim()}
      {...props}
    >
      {glyph}
    </svg>
  );
}
