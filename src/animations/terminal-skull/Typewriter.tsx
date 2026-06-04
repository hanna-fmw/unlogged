import { useEffect, useRef, useState } from "react";

interface TypewriterProps {
  text: string;
  startDelayMs?: number;
  charDelayMs?: number;
  cursor?: boolean;
  onDone?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function Typewriter({
  text,
  startDelayMs = 0,
  charDelayMs = 35,
  cursor = false,
  onDone,
  className,
  style,
}: TypewriterProps) {
  const [shown, setShown] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setShown(0);
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const startTimer = setTimeout(() => {
      const tick = (i: number) => {
        if (cancelled) return;
        setShown(i);
        if (i >= text.length) {
          onDoneRef.current?.();
          return;
        }
        timer = setTimeout(() => tick(i + 1), charDelayMs);
      };
      tick(0);
    }, startDelayMs);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [text, startDelayMs, charDelayMs]);

  return (
    <span className={className} style={style}>
      {text.slice(0, shown)}
      {cursor && <span className="cursor">▌</span>}
    </span>
  );
}
