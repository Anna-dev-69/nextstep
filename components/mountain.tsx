const photos = {
  hero: "/mountains/hero.jpg",
  dusk: "/mountains/dusk.jpg",
} as const;

export function MountainPhoto({
  variant = "hero",
  className,
}: {
  variant?: keyof typeof photos;
  className?: string;
}) {
  return <img src={photos[variant]} alt="" className={className} />;
}
