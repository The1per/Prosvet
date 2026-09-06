import { useEffect, useRef, useState } from "react";
import { ТЕЛЕФОН } from "./scale";

/** Появление блоков при скролле */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Плавный счётчик */
export function useCounter(value: number, ms = 700) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      setV(a + (value - a) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return v;
}

export function useLocal<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* noop */
    }
  }, [key, v]);
  return [v, setV] as const;
}

/**
 * ТЕЛЕФОН ЛИ. Граница одна и та же со scale.ts: уже неё страница не
 * масштабируется, а собирается по-другому -- один столбец, свой порядок,
 * свой график. Слушаем medium query, а не resize: перерисовка нужна ровно
 * на переходе через границу, а не на каждом пикселе.
 */
export function useТелефон(): boolean {
  const q = "(max-width: " + (ТЕЛЕФОН - 1) + "px)";
  const [да, поставить] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(q).matches,
  );
  useEffect(() => {
    const m = window.matchMedia(q);
    const при = () => поставить(m.matches);
    при();
    m.addEventListener("change", при);
    return () => m.removeEventListener("change", при);
  }, [q]);
  return да;
}
