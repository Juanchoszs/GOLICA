import { useRef, useCallback } from 'react';

export const useLongPress = (onLongPress: () => void, ms = 700) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const start = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onLongPress();
        }, ms);
    }, [onLongPress, ms]);

    const stop = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
        onDragStart: stop,
    };
};
