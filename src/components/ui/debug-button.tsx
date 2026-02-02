"use client";

import React from 'react';

export const DebugButton = () => {
    const [blocker, setBlocker] = React.useState<string>("Checking...");

    React.useEffect(() => {
        const interval = setInterval(() => {
            const el = document.elementFromPoint(50, 50); // Coordinates of this button approx
            if (el) {
                const id = el.id ? `#${el.id}` : '';
                const cls = el.className ? `.${typeof el.className === 'string' ? el.className.split(' ')[0] : 'svg'}` : '';
                setBlocker(`${el.tagName}${id}${cls}`);
            } else {
                setBlocker("None");
            }
        }, 1000);
        return () => clearInterval(interval);
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
