import { useEffect, useRef, useState } from "react";
import { SKULL } from "./skull";

interface Props {
  startDelayMs?: number;
  charDelayMs?: number;
  onDone?: () => void;
}

export default function SkullReveal({ startDelayMs = 0, charDelayMs = 3, onDone }: Props) {
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
        if (i >= SKULL.length) {
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
  }, [startDelayMs, charDelayMs]);

  return <pre className="skull">{SKULL.slice(0, shown)}</pre>;
}
