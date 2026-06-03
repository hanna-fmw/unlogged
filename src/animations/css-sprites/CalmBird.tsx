type Props = { delayMs?: number; danceClass?: string };

export default function CalmBird({ delayMs = 0, danceClass = "" }: Props) {
  return (
    <div className={`calm-bird ${danceClass}`} style={{ animationDelay: `${delayMs}ms` }}>
      <svg viewBox="0 0 100 100" width="120" height="120">
        <ellipse cx="50" cy="60" rx="28" ry="22" fill="#3b82f6" />
        <circle cx="50" cy="35" r="18" fill="#3b82f6" />
        <circle cx="44" cy="33" r="3" fill="white" />
        <circle cx="56" cy="33" r="3" fill="white" />
        <circle cx="44" cy="33" r="1.5" fill="black" />
        <circle cx="56" cy="33" r="1.5" fill="black" />
        <polygon points="50,38 46,44 54,44" fill="#fb923c" />
      </svg>
    </div>
  );
}
