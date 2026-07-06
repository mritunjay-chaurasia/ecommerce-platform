import { useCallback, useEffect, useRef } from 'react';

const useThrottle = (callback, delay = 300) => {
    const callbackRef = useRef(callback);
    const lastRanRef = useRef(0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }
    }, []);

    return useCallback((...args) => {
        const now = Date.now();
        const remaining = delay - (now - lastRanRef.current);

        const invoke = () => {
            lastRanRef.current = Date.now();
            callbackRef.current(...args);
        };

        if (remaining <= 0) {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            invoke();
            return;
        }

        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            timeoutRef.current = null;
            invoke();
        }, remaining);
    }, [delay]);
};

export default useThrottle;
