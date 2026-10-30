type IconProps = { className?: string };

function base(path: string, { className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return base("M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z", props);
}

export function IconSkills(props: IconProps) {
  return base("M12 3l2.2 4.6L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.6z", props);
}

export function IconAnalyze(props: IconProps) {
  return base("M6 4h9l3 3v13H6zM15 4v4h4M8 12h8M8 16h5", props);
}

export function IconCompare(props: IconProps) {
  return base("M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01", props);
}

export function IconPlan(props: IconProps) {
  return base("M8 4h11v16H8zM5 7h3M5 12h3M5 17h3M11 9h5M11 13h5", props);
}

export function IconSearch(props: IconProps) {
  return base("M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-3.5-3.5", props);
}

export function IconPlus(props: IconProps) {
  return base("M12 5v14M5 12h14", props);
}

export function IconPencil(props: IconProps) {
  return base("M4 20h4l10-10-4-4L4 16zM13 7l4 4", props);
}

export function IconTrash(props: IconProps) {
  return base("M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12", props);
}

export function IconArrow(props: IconProps) {
  return base("M5 12h14M13 6l6 6-6 6", props);
}

export function IconCheck(props: IconProps) {
  return base("M5 12.5 9.2 17 19 7", props);
}

export function IconFlag(props: IconProps) {
  return base("M5 21V4M5 4h11l-2 4 2 4H5", props);
}
