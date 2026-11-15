'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { playPageFlipSound } from '@/lib/sound';

/** Every page is designed at this fixed size, then scaled to fit the screen. */
export const PAGE_W = 480;
export const PAGE_H = 680;

export type PageSkin = 'paper' | 'leather';

export interface FlipBookPage {
  key: string;
  skin?: PageSkin;
  content: React.ReactNode;
}

interface FlipBookProps {
  pages: FlipBookPage[];
  /** Ask the book to turn to a given page index. Change `nonce` to repeat the same page. */
  request?: { page: number; nonce: number } | null;
  /** Called with the index of the first visible page after every turn. */
  onPageChange?: (firstVisiblePage: number) => void;
}

/** A turn between view `lo` and view `hi`; progress 0 = showing lo, 1 = showing hi. */
interface Flip {
  lo: number;
  hi: number;
  progress: number;
}

interface DragState {
  id: number;
  startX: number;
  startY: number;
  active: boolean;
  dir: 1 | -1;
  lastX: number;
  lastT: number;
  velocity: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export const FlipBook: React.FC<FlipBookProps> = ({ pages, request, onPageChange }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setViewState] = useState(0);
  const [flip, setFlipState] = useState<Flip | null>(null);

  const viewRef = useRef(0);
  const flipRef = useRef<Flip | null>(null);
  const animRef = useRef<number | null>(null);
  const watchdogRef = useRef<number | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const firstPageRef = useRef(0);

  const setView = (v: number) => {
    viewRef.current = v;
    setViewState(v);
  };
  const setFlip = (f: Flip | null) => {
    flipRef.current = f;
    setFlipState(f);
  };

  // ---------- Layout: two-page spread in landscape, single page in portrait ----------
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  const spread = size.w >= 760 && size.w / Math.max(size.h, 1) > 1.05;
  const navSpace = spread ? 130 : 24; // room for the side arrows
  const indicatorSpace = 34;
  const ratio = PAGE_W / PAGE_H;
  const pageH = Math.max(
    0,
    Math.floor(
      Math.min(
        size.h - indicatorSpace,
        ((size.w - navSpace) / (spread ? 2 : 1)) / ratio
      )
    )
  );
  const pageW = Math.floor(pageH * ratio);
  const scale = pageH / PAGE_H;

  const perView = spread ? 2 : 1;
  const viewCount = Math.max(1, Math.ceil(pages.length / perView));
  const viewOfPage = useCallback((p: number) => Math.floor(p / perView), [perView]);

  // Keep the same page visible when the layout switches between spread and single.
  useEffect(() => {
    const v = Math.min(viewOfPage(firstPageRef.current), viewCount - 1);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    setFlip(null);
    setView(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread]);

  // Clamp when the number of pages changes (search, menu updates).
  useEffect(() => {
    if (viewRef.current > viewCount - 1) setView(viewCount - 1);
  }, [viewCount]);

  useEffect(() => {
    const first = view * perView;
    firstPageRef.current = first;
    onPageChange?.(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, perView]);

  useEffect(() => () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
  }, []);

  // ---------- Animation ----------
  const animateTo = useCallback((target: 0 | 1) => {
    const f = flipRef.current;
    if (!f) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const from = f.progress;
    const duration = 220 + 680 * Math.abs(target - from);
    const start = performance.now();

    const finish = () => {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      if (flipRef.current !== null) {
        setView(target === 1 ? f.hi : f.lo);
        setFlip(null);
      }
    };

    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const progress = from + (target - from) * eased;
      if (k < 1) {
        setFlip({ ...f, progress });
        animRef.current = requestAnimationFrame(step);
      } else {
        finish();
      }
    };
    animRef.current = requestAnimationFrame(step);
    // Safety net: if animation frames are paused (screen off, tab hidden), still land on the page.
    if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    watchdogRef.current = window.setTimeout(finish, duration + 400);
  }, []);

  const goToView = useCallback(
    (target: number) => {
      const v = viewRef.current;
      const w = Math.min(Math.max(target, 0), viewCount - 1);
      if (w === v || flipRef.current || dragRef.current?.active) return;
      playPageFlipSound();
      if (w > v) {
        setFlip({ lo: v, hi: w, progress: 0 });
        animateTo(1);
      } else {
        setFlip({ lo: w, hi: v, progress: 1 });
        animateTo(0);
      }
    },
    [animateTo, viewCount]
  );

  const next = useCallback(() => goToView(viewRef.current + 1), [goToView]);
  const prev = useCallback(() => goToView(viewRef.current - 1), [goToView]);

  // External page requests (category pills, table of contents...)
  useEffect(() => {
    if (!request) return;
    goToView(viewOfPage(request.page));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.nonce]);

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // ---------- Drag / swipe to turn the page with the finger ----------
  const dragWidth = spread ? pageW * 1.5 : pageW * 0.9;

  const onPointerDown = (e: React.PointerEvent) => {
    if (flipRef.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      active: false,
      dir: 1,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.active) {
      if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      const v = viewRef.current;
      if (dx < 0 && v < viewCount - 1) {
        d.dir = 1;
        setFlip({ lo: v, hi: v + 1, progress: 0 });
      } else if (dx > 0 && v > 0) {
        d.dir = -1;
        setFlip({ lo: v - 1, hi: v, progress: 1 });
      } else {
        dragRef.current = null;
        return;
      }
      d.active = true;
      d.startX = e.clientX;
      try {
        bookRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      playPageFlipSound();
    }

    const now = performance.now();
    const dt = Math.max(1, now - d.lastT);
    d.velocity = 0.8 * ((e.clientX - d.lastX) / dt) + 0.2 * d.velocity;
    d.lastX = e.clientX;
    d.lastT = now;

    const raw = (e.clientX - d.startX) / Math.max(dragWidth, 1);
    const progress = d.dir === 1 ? clamp01(-raw) : clamp01(1 - raw);
    const f = flipRef.current;
    if (f) setFlip({ ...f, progress });
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    if (!d.active) return;

    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 120);

    const f = flipRef.current;
    if (!f) return;
    const fling = 0.45; // px per ms
    let target: 0 | 1;
    if (d.dir === 1) {
      target = d.velocity > fling ? 0 : f.progress > 0.3 || d.velocity < -fling ? 1 : 0;
    } else {
      target = d.velocity < -fling ? 1 : f.progress < 0.7 || d.velocity > fling ? 0 : 1;
    }
    animateTo(target);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // ---------- Rendering ----------
  const pageAt = (index: number): FlipBookPage | undefined => pages[index];

  const renderFace = (index: number, side: 'left' | 'right' | 'single', shade = 0) => {
    const page = pageAt(index);
    const skin: PageSkin = page?.skin ?? 'paper';
    const radius =
      side === 'left' ? '16px 4px 4px 16px' : side === 'right' ? '4px 16px 16px 4px' : '6px 16px 16px 6px';

    const spineGradient =
      side === 'left'
        ? 'linear-gradient(to left, rgba(60,38,18,0.28) 0%, rgba(60,38,18,0.10) 5%, rgba(60,38,18,0) 14%)'
        : side === 'right'
        ? 'linear-gradient(to right, rgba(60,38,18,0.28) 0%, rgba(60,38,18,0.10) 5%, rgba(60,38,18,0) 14%)'
        : 'linear-gradient(to right, rgba(60,38,18,0.18) 0%, rgba(60,38,18,0) 6%)';

    return (
      <div
        className={`absolute inset-0 overflow-hidden ${skin === 'leather' ? 'leather-texture' : 'paper-texture'}`}
        style={{ borderRadius: radius }}
      >
        <div
          style={{
            width: PAGE_W,
            height: PAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {page ? page.content : null}
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: spineGradient }} />
        {shade > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                side === 'left'
                  ? `linear-gradient(to left, rgba(0,0,0,${shade}) 0%, rgba(0,0,0,${shade * 0.35}) 60%, rgba(0,0,0,${shade * 0.15}) 100%)`
                  : `linear-gradient(to right, rgba(0,0,0,${shade}) 0%, rgba(0,0,0,${shade * 0.35}) 60%, rgba(0,0,0,${shade * 0.15}) 100%)`,
            }}
          />
        )}
      </div>
    );
  };

  const isFlipping = flip !== null;
  const p = flip?.progress ?? 0;
  const angle = -180 * p;
  const lift = Math.sin(Math.PI * p); // 0 at rest, 1 when the page stands upright

  const bookWidth = spread ? pageW * 2 : pageW;
  const firstVisible = view * perView;
  const lastVisible = Math.min(pages.length, firstVisible + perView);
  const canPrev = view > 0;
  const canNext = view < viewCount - 1;

  let layers: React.ReactNode;
  if (!isFlipping) {
    layers = spread ? (
      <>
        <div className="absolute top-0 left-0 h-full" style={{ width: pageW }}>
          {renderFace(view * 2, 'left')}
        </div>
        <div className="absolute top-0 h-full" style={{ left: pageW, width: pageW }}>
          {renderFace(view * 2 + 1, 'right')}
        </div>
      </>
    ) : (
      <div className="absolute inset-0">{renderFace(view, 'single')}</div>
    );
  } else if (spread) {
    const { lo, hi } = flip;
    layers = (
      <>
        {/* Static pages underneath */}
        <div className="absolute top-0 left-0 h-full" style={{ width: pageW }}>
          {renderFace(lo * 2, 'left', p > 0.5 ? 0 : 0.25 * lift)}
        </div>
        <div className="absolute top-0 h-full" style={{ left: pageW, width: pageW }}>
          {renderFace(hi * 2 + 1, 'right', p < 0.5 ? 0.3 * lift : 0)}
        </div>
        {/* The turning leaf, hinged on the spine */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: pageW,
            width: pageW,
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transform: `rotateY(${angle}deg)`,
            zIndex: 5,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              boxShadow: `${-8 * lift}px 0 ${30 * lift}px rgba(0,0,0,${0.35 * lift})`,
              borderRadius: '4px 16px 16px 4px',
            }}
          >
            {renderFace(lo * 2 + 1, 'right', 0.35 * p)}
          </div>
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: `${8 * lift}px 0 ${30 * lift}px rgba(0,0,0,${0.35 * lift})`,
              borderRadius: '16px 4px 4px 16px',
            }}
          >
            {renderFace(hi * 2, 'left', 0.35 * (1 - p))}
          </div>
        </div>
      </>
    );
  } else {
    const { lo, hi } = flip;
    layers = (
      <>
        <div className="absolute inset-0">{renderFace(hi, 'single', 0.3 * (1 - p))}</div>
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transform: `rotateY(${angle}deg)`,
            zIndex: 5,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              boxShadow: `${-10 * lift}px 0 ${30 * lift}px rgba(0,0,0,${0.4 * lift})`,
              borderRadius: '6px 16px 16px 6px',
            }}
          >
            {renderFace(lo, 'single', 0.35 * p)}
          </div>
          {/* Back of the sheet: plain paper */}
          <div
            className="absolute inset-0 paper-texture"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: '16px 6px 6px 16px',
              filter: 'brightness(0.92)',
            }}
          />
        </div>
      </>
    );
  }

  return (
    <div ref={wrapperRef} className="relative w-full h-full flex flex-col items-center justify-center select-none">
      {pageH > 0 && (
        <>
          <div className="relative flex items-center justify-center" style={{ height: pageH }}>
            {/* Previous arrow */}
            {spread && (
              <button
                type="button"
                onClick={prev}
                disabled={!canPrev || isFlipping}
                aria-label="Page précédente"
                className="absolute -left-[62px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-[#1A1D27]/85 border border-[#E85D04]/30 text-[#FAA307] shadow-xl transition active:scale-90 disabled:opacity-0 disabled:pointer-events-none hover:bg-[#E85D04] hover:text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* The book */}
            <div
              ref={bookRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClickCapture={onClickCapture}
              className="relative"
              style={{
                width: bookWidth,
                height: pageH,
                touchAction: 'pan-y',
                filter: 'drop-shadow(0 28px 40px rgba(0,0,0,0.55))',
              }}
            >
              <div
                className={`absolute inset-0 ${isFlipping ? 'pointer-events-none' : ''}`}
                style={{ perspective: `${Math.max(1600, bookWidth * 2.2)}px` }}
              >
                {layers}
              </div>

              {/* Centre binding */}
              {spread && (
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: pageW - 2,
                    width: 4,
                    zIndex: 6,
                    background: 'linear-gradient(to right, rgba(40,25,12,0.35), rgba(40,25,12,0.1), rgba(40,25,12,0.35))',
                  }}
                />
              )}

              {/* Corner curls: tap to turn */}
              {!isFlipping && canNext && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Tourner la page"
                  className="page-curl page-curl-right absolute bottom-0 right-0 z-10"
                  style={{ width: 64 * Math.max(scale, 0.7), height: 64 * Math.max(scale, 0.7) }}
                />
              )}
              {!isFlipping && canPrev && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Revenir à la page précédente"
                  className="page-curl page-curl-left absolute bottom-0 left-0 z-10"
                  style={{ width: 64 * Math.max(scale, 0.7), height: 64 * Math.max(scale, 0.7) }}
                />
              )}
            </div>

            {/* Next arrow */}
            {spread && (
              <button
                type="button"
                onClick={next}
                disabled={!canNext || isFlipping}
                aria-label="Page suivante"
                className="absolute -right-[62px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-[#1A1D27]/85 border border-[#E85D04]/30 text-[#FAA307] shadow-xl transition active:scale-90 disabled:opacity-0 disabled:pointer-events-none hover:bg-[#E85D04] hover:text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Page indicator */}
          <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-[#E8E1D5]/80">
            {!spread && (
              <button
                type="button"
                onClick={prev}
                disabled={!canPrev || isFlipping}
                aria-label="Page précédente"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-[#FAA307] disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: viewCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToView(i)}
                  aria-label={`Aller à la page ${i * perView + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === view ? 'w-6 bg-[#E85D04]' : 'w-2 bg-white/25 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            <span className="tabular-nums min-w-[70px] text-center">
              {lastVisible - firstVisible > 1
                ? `p. ${firstVisible + 1}–${lastVisible}`
                : `p. ${firstVisible + 1}`}{' '}
              / {pages.length}
            </span>
            {!spread && (
              <button
                type="button"
                onClick={next}
                disabled={!canNext || isFlipping}
                aria-label="Page suivante"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-[#FAA307] disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
