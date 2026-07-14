import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './LogoLoop.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const SMOOTH_TAU = 0.25;
const MIN_COPIES = 2;
const COPY_HEADROOM = 2;

const toCssLength = (value) =>
  typeof value === 'number' ? `${value}px` : (value ?? undefined);

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useResizeObserver(callback, elements, deps) {
  useEffect(() => {
    if (!window.ResizeObserver) {
      window.addEventListener('resize', callback);
      callback();
      return () => window.removeEventListener('resize', callback);
    }

    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();

    return () => {
      observers.forEach((o) => o?.disconnect());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function useImageLoader(seqRef, onLoad, deps) {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];

    if (images.length === 0) {
      onLoad();
      return;
    }

    let remaining = images.length;
    const handleLoad = () => {
      remaining -= 1;
      if (remaining === 0) onLoad();
    };

    images.forEach((img) => {
      if (img.complete) {
        handleLoad();
      } else {
        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleLoad, { once: true });
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleLoad);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function useAnimationLoop(
  trackRef,
  targetVelocity,
  seqWidth,
  seqHeight,
  isHovered,
  hoverSpeed,
  isVertical
) {
  const rafRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const seqSize = isVertical ? seqHeight : seqWidth;

    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      track.style.transform = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    if (prefersReduced) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return () => { lastTimestampRef.current = null; };
    }

    const animate = (timestamp) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target =
        isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;

      const ease = 1 - Math.exp(-deltaTime / SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * ease;

      if (seqSize > 0) {
        let next = offsetRef.current + velocityRef.current * deltaTime;
        next = ((next % seqSize) + seqSize) % seqSize;
        offsetRef.current = next;

        track.style.transform = isVertical
          ? `translate3d(0, ${-next}px, 0)`
          : `translate3d(${-next}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical]);
}

// ─── LogoLoop Component ───────────────────────────────────────────────────────

const LogoLoop = React.memo(function LogoLoop({
  logos,
  speed = 120,
  direction = 'left',
  width = '100%',
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = 'Partner logos',
  className,
  style,
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const seqRef = useRef(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState(MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === true) return 0;
    if (pauseOnHover === false) return undefined;
    return 0;
  }, [hoverSpeed, pauseOnHover]);

  const isVertical = direction === 'up' || direction === 'down';

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    let dirMult = isVertical
      ? direction === 'up' ? 1 : -1
      : direction === 'left' ? 1 : -1;
    return magnitude * dirMult * (speed < 0 ? -1 : 1);
  }, [speed, direction, isVertical]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const rect = seqRef.current?.getBoundingClientRect?.();
    const sw = rect?.width ?? 0;
    const sh = rect?.height ?? 0;

    if (isVertical) {
      const parentH = containerRef.current?.parentElement?.clientHeight ?? 0;
      if (containerRef.current && parentH > 0) {
        containerRef.current.style.height = `${Math.ceil(parentH)}px`;
      }
      if (sh > 0) {
        setSeqHeight(Math.ceil(sh));
        const viewport = containerRef.current?.clientHeight ?? parentH ?? sh;
        setCopyCount(Math.max(MIN_COPIES, Math.ceil(viewport / sh) + COPY_HEADROOM));
      }
    } else if (sw > 0) {
      setSeqWidth(Math.ceil(sw));
      setCopyCount(Math.max(MIN_COPIES, Math.ceil(containerWidth / sw) + COPY_HEADROOM));
    }
  }, [isVertical]);

  useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight, isVertical]);
  useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight, isVertical]);
  useAnimationLoop(trackRef, targetVelocity, seqWidth, seqHeight, isHovered, effectiveHoverSpeed, isVertical);

  const handleMouseEnter = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(true);
  }, [effectiveHoverSpeed]);

  const handleMouseLeave = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(false);
  }, [effectiveHoverSpeed]);

  const renderLogoItem = useCallback(
    (item, key) => {
      const isNodeItem = 'node' in item;

      const content = isNodeItem ? (
        <span
          className={`ll-item-inner${scaleOnHover ? ' ll-scale-on-hover' : ''}`}
        >
          {item.node}
        </span>
      ) : (
        <img
          className={`ll-item-img${scaleOnHover ? ' ll-scale-on-hover' : ''}`}
          src={item.src}
          srcSet={item.srcSet}
          sizes={item.sizes}
          width={item.width}
          height={item.height}
          alt={item.alt ?? ''}
          title={item.title}
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{ height: logoHeight }}
        />
      );

      const inner = item.href ? (
        <a
          className="ll-item-link"
          href={item.href}
          aria-label={
            isNodeItem
              ? (item.ariaLabel ?? item.title)
              : (item.alt ?? item.title) ?? 'logo link'
          }
          target="_blank"
          rel="noreferrer noopener"
        >
          {content}
        </a>
      ) : (
        content
      );

      return (
        <li
          className={`ll-item${isVertical ? ' ll-item--vertical' : ''}${scaleOnHover ? ' ll-item--scale' : ''}`}
          key={key}
          style={{
            [isVertical ? 'marginBottom' : 'marginRight']: gap,
            fontSize: logoHeight,
          }}
        >
          {renderItem ? renderItem(item, key) : inner}
        </li>
      );
    },
    [isVertical, scaleOnHover, renderItem, gap, logoHeight]
  );

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          className={`ll-list${isVertical ? ' ll-list--vertical' : ''}`}
          key={`copy-${copyIndex}`}
          aria-hidden={copyIndex > 0 ? true : undefined}
          ref={copyIndex === 0 ? seqRef : undefined}
        >
          {logos.map((item, i) => renderLogoItem(item, `${copyIndex}-${i}`))}
        </ul>
      )),
    [copyCount, logos, renderLogoItem, isVertical]
  );

  const containerStyle = useMemo(
    () => ({
      width: isVertical
        ? toCssLength(width) === '100%' ? undefined : toCssLength(width)
        : (toCssLength(width) ?? '100%'),
      '--ll-fade-color': fadeOutColor ?? undefined,
      ...style,
    }),
    [width, fadeOutColor, style, isVertical]
  );

  return (
    <div
      ref={containerRef}
      className={`ll-root${isVertical ? ' ll-root--vertical' : ''}${scaleOnHover ? ' ll-root--scale' : ''}${className ? ' ' + className : ''}`}
      style={containerStyle}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Fade overlays */}
      {fadeOut && !isVertical && (
        <>
          <div className="ll-fade ll-fade--left" aria-hidden="true" />
          <div className="ll-fade ll-fade--right" aria-hidden="true" />
        </>
      )}
      {fadeOut && isVertical && (
        <>
          <div className="ll-fade ll-fade--top" aria-hidden="true" />
          <div className="ll-fade ll-fade--bottom" aria-hidden="true" />
        </>
      )}

      {/* Scrolling track */}
      <div
        className={`ll-track${isVertical ? ' ll-track--vertical' : ''}`}
        ref={trackRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {logoLists}
      </div>
    </div>
  );
});

LogoLoop.displayName = 'LogoLoop';

export default LogoLoop;
