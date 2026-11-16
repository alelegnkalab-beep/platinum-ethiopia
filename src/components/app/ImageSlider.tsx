import { useRef, useState } from "react";
import type { Slide } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ImageSlider({ slides, alt, eager }: { slides: Slide[]; alt: string; eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (i: number) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
      >
        {slides.map((s, i) => (
          <img
            key={s.label}
            src={s.image}
            alt={`${alt} – ${s.label}`}
            width={832}
            height={1040}
            loading={eager && i === 0 ? "eager" : "lazy"}
            className="aspect-[4/5] w-full shrink-0 snap-center object-cover"
            draggable={false}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-fade" />
      <div className="absolute inset-x-0 bottom-3 flex items-end justify-between px-4">
        <span className="glass rounded-full border px-3 py-1 text-xs font-medium">{slides[active]?.label}</span>
        <div className="flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-label={s.label}
              onClick={() => goTo(i)}
              style={{ backgroundColor: s.swatch }}
              className={cn(
                "size-6 rounded-full border-2 transition",
                i === active ? "scale-110 border-primary-glow shadow-glow" : "border-border",
              )}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 top-3 flex justify-center gap-1.5">
        {slides.map((s, i) => (
          <span
            key={s.label}
            className={cn("h-1 rounded-full transition-all", i === active ? "w-6 bg-platinum" : "w-2 bg-platinum/40")}
          />
        ))}
      </div>
    </div>
  );
}
