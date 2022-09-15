import { useCallback, useMemo, useRef, useState } from 'react';

export const usePlayerTouch = () => {
  const lastTouchRef = useRef<NodeJS.Timeout>();
  const [show, setShow] = useState(false);

  const onTouchStart = useCallback(() => {
    setShow(true);

    if (lastTouchRef.current) {
      clearTimeout(lastTouchRef.current);
    }
    const timeout = setTimeout(() => {
      setShow(false);
    }, 3000);
    lastTouchRef.current = timeout;
  }, []);

  const onMouseEnter = useCallback(() => {
    setShow(true);
    if (lastTouchRef.current) {
      clearTimeout(lastTouchRef.current);
    }
  }, []);

  const onMouseMove = useCallback(() => {
    setShow(true);

    if (lastTouchRef.current) {
      clearTimeout(lastTouchRef.current);
    }
    lastTouchRef.current = setTimeout(() => {
      setShow(false);
    }, 2000);
  }, []);

  const onMouseLeave = useCallback(() => {
    if (lastTouchRef.current) {
      clearTimeout(lastTouchRef.current);
    }
    lastTouchRef.current = setTimeout(() => {
      setShow(false);
    }, 500);
  }, []);

  return {
    show,
    events: useMemo(
      () => ({
        onTouchStart,
        onMouseEnter,
        onMouseMove,
        onMouseLeave
      }),
      [onTouchStart, onMouseEnter, onMouseMove, onMouseLeave]
    )
  };
};
