"use client";

import React from 'react';

export const DebugButton = () => {
    const [blocker, setBlocker] = React.useState<string>("Move cursor...");
    const lastPosRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleMove = (e: PointerEvent) => {
            lastPosRef.current = { x: e.clientX, y: e.clientY };
        };

        const interval = setInterval(() => {
            const { x, y } = lastPosRef.current;
            const elements = document.elementsFromPoint(x, y);

            const hit = elements.find((node) => {
                if (!(node instanceof HTMLElement)) return false;
                if (node.id === "test-button") return false;
                const style = window.getComputedStyle(node);
                return style.pointerEvents !== "none";
            }) as HTMLElement | undefined;

            if (hit) {
                const id = hit.id ? `#${hit.id}` : "";
                const cls = hit.className ? `.${String(hit.className).split(" ")[0]}` : "";
                const style = window.getComputedStyle(hit);
                const z = style.zIndex === "auto" ? "auto" : style.zIndex;
                setBlocker(`${hit.tagName}${id}${cls} z:${z} @ ${x},${y}`);
            } else {
                setBlocker(`None @ ${x},${y}`);
            }
        }, 250);

        window.addEventListener("pointermove", handleMove, { passive: true });
        return () => {
            window.removeEventListener("pointermove", handleMove);
            clearInterval(interval);
        };
    }, []);

    return (
        <button
            style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                zIndex: 9999,
                backgroundColor: 'red',
                color: 'white',
                padding: '10px',
                pointerEvents: 'auto'
            }}
            id="test-button"
            onClick={() => alert(`CLICKED! VISIBLE: ${blocker}`)}
        >
            Top Element: {blocker}
        </button>
    );
};
