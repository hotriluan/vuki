"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType } from 'embla-carousel';

// Minimal icon fallbacks if not existing
function DefaultChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 18l-6-6 6-6"/></svg>
  );
}
function DefaultChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 6l6 6-6 6"/></svg>
  );
}
// Using local fallback icons
const LeftIcon = DefaultChevronLeft;
const RightIcon = DefaultChevronRight;

export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme?: 'light' | 'dark';
  overlayOpacity?: number; // 0..1
}

interface HeroSliderProps {
  slides: HeroSlide[];
  autoPlayMs?: number;
  loop?: boolean;
  className?: string;
  options?: EmblaOptionsType;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  autoPlayMs = 5000,
  loop = true,
  className = '',
  options
}) => {
  const emblaOptions: EmblaOptionsType = { loop, align: 'start', ...options };
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);
  const [selected, setSelected] = useState(0);
  const timerRef = useRef<number | null>(null);
  const hoveringRef = useRef(false);
  const focusRef = useRef(false);

  const autoplay = useCallback(() => {
    if (!emblaApi) return;
    if (hoveringRef.current || focusRef.current) return;
    if (emblaApi.canScrollNext()) emblaApi.scrollNext();
    else emblaApi.scrollTo(0);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    if (autoPlayMs <= 0) return;
    timerRef.current && window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(autoplay, autoPlayMs);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [emblaApi, autoplay, autoPlayMs]);

  const handleMouseEnter = () => { hoveringRef.current = true; };
  const handleMouseLeave = () => { hoveringRef.current = false; };
  const handleFocusIn = () => { focusRef.current = true; };
  const handleFocusOut = () => { focusRef.current = false; };

  return (
    <section
      className={`relative group ${className}`}
      aria-roledescription="carousel"
      aria-label="Hero promotions"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((s, i) => {
            const dark = s.theme === 'dark';
            return (
              <div
                className="relative min-w-full h-[320px] md:h-[480px] lg:h-[560px] select-none"
                key={s.id}
                aria-hidden={i !== selected}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${slides.length}`}
              >
                <picture className="absolute inset-0 block w-full h-full">
                  <img
                    src={s.image}
                    alt={s.alt}
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </picture>
                <div
                  className={`absolute inset-0 ${dark ? 'bg-black/50' : 'bg-black/30'} ${s.overlayOpacity ? '' : ''}`}
                  style={s.overlayOpacity !== undefined ? { backgroundColor: dark ? `rgba(0,0,0,${s.overlayOpacity})` : `rgba(0,0,0,${s.overlayOpacity})` } : undefined}
                />
                <div className="absolute inset-0 flex items-center justify-center px-6">
                  <div className={`max-w-3xl text-center ${dark ? 'text-white' : 'text-white drop-shadow'} space-y-4`}>
                    {s.heading && <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">{s.heading}</h2>}
                    {s.subheading && <p className="text-sm md:text-lg opacity-90 leading-relaxed">{s.subheading}</p>}
                    {s.ctaHref && s.ctaLabel && (
                      <a
                        href={s.ctaHref}
                        className="inline-block rounded bg-brand-accent px-6 py-3 text-white text-sm font-medium hover:brightness-110 focus:outline-none focus-visible:ring ring-offset-2 ring-brand-accent"
                      >{s.ctaLabel}</a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Prev/Next Controls */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:px-4">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => emblaApi?.scrollPrev()}
          className="pointer-events-auto p-2 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus-visible:ring ring-offset-2 ring-brand-accent"
        >
          <LeftIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => emblaApi?.scrollNext()}
          className="pointer-events-auto p-2 rounded-full bg-black/40 text-white hover:bg-black/60 focus:outline-none focus-visible:ring ring-offset-2 ring-brand-accent"
        >
          <RightIcon className="w-5 h-5" />
        </button>
      </div>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === selected}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring ring-offset-2 ring-brand-accent ${i === selected ? 'bg-white w-6' : 'bg-white/50 w-2.5 hover:bg-white/80'}`}
          />
        ))}
      </div>
      <span className="sr-only" aria-live="polite">Slide {selected + 1} of {slides.length}</span>
    </section>
  );
};
