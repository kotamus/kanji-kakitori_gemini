import React, { useEffect, useRef, useCallback } from 'react';

interface WritingAreaProps {
    onPredict: (canvas: HTMLCanvasElement) => void;
    onClear?: () => void;
}

export interface WritingAreaHandle {
    clearCanvas: () => void;
    predict: () => void;
}

export const WritingArea = React.forwardRef<WritingAreaHandle, WritingAreaProps>(
    ({ onPredict, onClear }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const isDrawingRef = useRef(false);
        const lastPosRef = useRef({ x: 0, y: 0 });

        const clearCanvas = useCallback(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            onClear?.();
        }, [onClear]);

        const predict = useCallback(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            onPredict(canvas);
        }, [onPredict]);

        React.useImperativeHandle(ref, () => ({
            clearCanvas,
            predict,
        }));

        const getPosition = useCallback((e: MouseEvent | Touch, rect: DOMRect) => {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }, []);

        const startDrawing = useCallback((x: number, y: number) => {
            isDrawingRef.current = true;
            lastPosRef.current = { x, y };
        }, []);

        const draw = useCallback((x: number, y: number) => {
            if (!isDrawingRef.current) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();

            lastPosRef.current = { x, y };
        }, []);

        const stopDrawing = useCallback(() => {
            isDrawingRef.current = false;
        }, []);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Initial clear
            clearCanvas();

            // Mouse events
            const handleMouseDown = (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                const pos = getPosition(e, rect);
                startDrawing(pos.x, pos.y);
            };

            const handleMouseMove = (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                const pos = getPosition(e, rect);
                draw(pos.x, pos.y);
            };

            const handleMouseUp = () => stopDrawing();
            const handleMouseLeave = () => stopDrawing();

            // Touch events
            const handleTouchStart = (e: TouchEvent) => {
                // Prevent scrolling/zooming immediately
                if (e.cancelable) e.preventDefault();
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const pos = getPosition(touch, rect);
                startDrawing(pos.x, pos.y);
            };

            const handleTouchMove = (e: TouchEvent) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const pos = getPosition(touch, rect);
                draw(pos.x, pos.y);
            };

            const handleTouchEnd = () => stopDrawing();

            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mouseleave', handleMouseLeave);
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);

            return () => {
                canvas.removeEventListener('mousedown', handleMouseDown);
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseup', handleMouseUp);
                canvas.removeEventListener('mouseleave', handleMouseLeave);
                canvas.removeEventListener('touchstart', handleTouchStart);
                canvas.removeEventListener('touchmove', handleTouchMove);
                canvas.removeEventListener('touchend', handleTouchEnd);
            };
        }, [clearCanvas, getPosition, startDrawing, draw, stopDrawing]);

        return (
            <div className="bg-white rounded-3xl shadow-xl border-4 border-orange-300 p-2 touch-none">
                <canvas
                    ref={canvasRef}
                    width={280}
                    height={280}
                    className="cursor-crosshair rounded-2xl"
                    style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
                />
            </div>
        );
    }
);

WritingArea.displayName = 'WritingArea';
