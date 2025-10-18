type Props = {
  src?: string | null;
  alt?: string;
  size?: number;
};

export default function Avatar({ src, alt = "Avatar", size = 32 }: Props) {
  const dimension = `${size}px`;
  return (
    <img
      src={src || "/default-avatar.svg"}
      alt={alt}
      loading="lazy"
      width={dimension}
      height={dimension}
      className="inline-block rounded-full object-cover"
    />
  );
}
