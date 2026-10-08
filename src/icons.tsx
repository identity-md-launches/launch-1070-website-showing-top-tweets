type Name =
  | "feed"
  | "bookmark"
  | "search"
  | "arrow"
  | "spark"
  | "chip"
  | "globe"
  | "code"
  | "people"
  | "info"
  | "close"
  | "eye"
  | "check"
  | "sliders"
  | "radar"
  | "chevron";
const paths: Record<Name, React.ReactNode> = {
  feed: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 9h8M8 13h8M8 17h4" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4-6 4Z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  spark: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      <path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5Z" />
    </>
  ),
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m3 10v-3a6 6 0 0 0-3-5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10v1" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  sliders: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="2" />
      <circle cx="15" cy="17" r="2" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="m12 12 8-8" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
};
export function Icon({ name, size = 20 }: { name: Name; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 27V15h7V8h11v7h7v12h-7v7H15v-7Z" fill="currentColor" />
      <path
        d="M15 19h3v3h-3zm9 0h3v3h-3zM16 27h10"
        stroke="var(--color-page)"
        strokeWidth="2"
      />
    </svg>
  );
}
