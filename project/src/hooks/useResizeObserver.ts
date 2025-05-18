import { useState, useEffect, useRef } from 'react';

interface Size {
  width: number;
  height: number;
}

const useResizeObserver = (ref: React.RefObject<HTMLElement>): Size => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    observerRef.current = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    
    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref]);

  return size;
};

export default useResizeObserver;