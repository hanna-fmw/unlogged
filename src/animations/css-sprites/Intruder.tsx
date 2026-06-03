type Props = { danceClass?: string };

export default function Intruder({ danceClass = "" }: Props) {
  return (
    <div className={`intruder ${danceClass}`}>
      <svg viewBox="0 0 140 140" width="180" height="180">
        <ellipse cx="70" cy="85" rx="40" ry="35" fill="#ec4899" />
        <circle cx="70" cy="45" r="30" fill="#ef4444" />
        <circle cx="58" cy="42" r="8" fill="white" />
        <circle cx="82" cy="42" r="8" fill="white" />
        <circle cx="58" cy="42" r="4" fill="black" />
        <circle cx="82" cy="42" r="4" fill="black" />
        <polygon points="70,52 60,64 80,64" fill="#fbbf24" />
        <line x1="30" y1="85" x2="0" y2="60" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
        <line x1="110" y1="85" x2="140" y2="60" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
        <line x1="55" y1="115" x2="35" y2="140" stroke="#fbbf24" strokeWidth="10" strokeLinecap="round" />
        <line x1="85" y1="115" x2="105" y2="140" stroke="#fbbf24" strokeWidth="10" strokeLinecap="round" />
      </svg>
    </div>
  );
}
