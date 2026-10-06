import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * SwipableCardCarousel
 * 
 * Rules:
 * 1. If items.length <= 4: renders clean static grid.
 * 2. If items.length > 4: displays ONLY ONE CARD IN THE CENTER.
 * 3. Loops automatically one-by-one (1 -> 2 -> 3 ... -> N -> 1) with a 3-second pause.
 * 4. Fading in and fading out transition effect.
 * 5. Working Previous and Next buttons (Header + Side Floating Arrows).
 * 6. Touch swipeable on mobile and tablet.
 * 7. Pauses on hover so the user can inspect or click action buttons.
 * 8. Clean indicator dots for each card.
 */
export default function SwipableCardCarousel({
  items = [],
  renderItem,
  autoSwipeInterval = 3000,
  isDark = false,
  className = "",
  cardMaxWidth = "max-w-2xl"
}) {
  // If 4 cards or fewer, render standard static grid without carousel overhead
  if (!items || items.length <= 4) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((item, idx) => (
          <React.Fragment key={item?.id || idx}>
            {renderItem(item, idx)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState('in'); // 'in' or 'out'
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Smooth Fade In & Fade Out transition handler
  const goToIndex = useCallback((targetIndex) => {
    if (isTransitioning || targetIndex === currentIndex) return;
    setIsTransitioning(true);
    setFadeState('out');

    setTimeout(() => {
      setCurrentIndex(targetIndex);
      setFadeState('in');
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }, 200); // 200ms fade-out duration
  }, [currentIndex, isTransitioning]);

  const nextCard = useCallback(() => {
    const next = (currentIndex + 1) % items.length;
    goToIndex(next);
  }, [currentIndex, items.length, goToIndex]);

  const prevCard = useCallback(() => {
    const prev = (currentIndex - 1 + items.length) % items.length;
    goToIndex(prev);
  }, [currentIndex, items.length, goToIndex]);

  // Continuous infinite auto-swipe loop: one by one with 3 seconds pause
  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const interval = setInterval(() => {
      nextCard();
    }, autoSwipeInterval);

    return () => clearInterval(interval);
  }, [isPaused, items.length, autoSwipeInterval, nextCard]);

  // Safety check if items change
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  // Touch swipe gestures for mobile & tablet
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX > 0) {
        nextCard();
      } else {
        prevCard();
      }
    }
  };

  const activeItem = items[currentIndex];

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header with Card Counter & Visible Working Prev/Next Buttons */}
      <div className={`flex items-center justify-between mb-4 pb-2 border-b font-mono text-xs ${cardMaxWidth} mx-auto ${
        isDark ? 'border-navy-800' : 'border-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`font-bold px-3 py-1 rounded-md border shadow-xs ${
            isDark
              ? 'bg-navy-900 text-slate-100 border-navy-700'
              : 'bg-white text-navy-900 border-slate-300'
          }`}>
            CARD {String(currentIndex + 1).padStart(2, '0')} OF {String(items.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Centered Single Card Stage with Side Arrow Buttons */}
      <div className="relative flex items-center justify-center w-full px-0 sm:px-12">
        {/* Left Floating Side Arrow Button */}
        <button
          type="button"
          onClick={prevCard}
          className={`hidden sm:flex absolute left-0 z-30 p-3 rounded-full border-2 shadow-xl transition-all active:scale-90 cursor-pointer items-center justify-center ${
            isDark
              ? 'bg-navy-900/95 hover:bg-heat-orange text-white border-navy-700 hover:border-heat-orange backdrop-blur-sm'
              : 'bg-white/95 hover:bg-navy-900 hover:text-white text-navy-900 border-slate-300 hover:border-navy-900 backdrop-blur-sm'
          }`}
          title="Previous Card"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* The One Single Centered Card with Fade-In / Fade-Out Transition */}
        <div className={`w-full ${cardMaxWidth} mx-auto`}>
          <div
            className={`transition-all duration-300 ease-in-out ${
              fadeState === 'out'
                ? 'opacity-0 scale-[0.97] filter blur-[1px]'
                : 'opacity-100 scale-100 filter blur-0'
            }`}
          >
            {activeItem && renderItem(activeItem, currentIndex)}
          </div>
        </div>

        {/* Right Floating Side Arrow Button */}
        <button
          type="button"
          onClick={nextCard}
          className={`hidden sm:flex absolute right-0 z-30 p-3 rounded-full border-2 shadow-xl transition-all active:scale-90 cursor-pointer items-center justify-center ${
            isDark
              ? 'bg-navy-900/95 hover:bg-heat-orange text-white border-navy-700 hover:border-heat-orange backdrop-blur-sm'
              : 'bg-white/95 hover:bg-navy-900 hover:text-white text-navy-900 border-slate-300 hover:border-navy-900 backdrop-blur-sm'
          }`}
          title="Next Card"
          aria-label="Next card"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Pagination Dots */}
      <div className={`flex flex-wrap items-center justify-center gap-1.5 mt-6 pt-3 border-t ${cardMaxWidth} mx-auto ${
        isDark ? 'border-navy-800' : 'border-slate-300/80'
      }`}>
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goToIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex
                ? 'w-7 bg-heat-orange shadow-md'
                : isDark
                ? 'w-2 bg-navy-700 hover:bg-slate-400'
                : 'w-2 bg-slate-300 hover:bg-navy-900'
            }`}
            title={`Jump to Card ${idx + 1}`}
            aria-label={`Jump to card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
