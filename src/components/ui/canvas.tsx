"use client";

interface TrailNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

interface TrailLine {
    nodes: TrailNode[];
    spring: number;
    friction: number;
}

export function renderCanvas(canvas: HTMLCanvasElement, lightTheme = false) {
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) {
        console.warn("Mouse trail: a 2D canvas context is unavailable.");
        return;
    }
    const context = canvasContext;

    const media = window.matchMedia("(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const position = { x: 0, y: 0 };
    let lines: TrailLine[] = [];
    let frame: number | null = null;
    let lastInput = 0;
    let phase = Math.random() * Math.PI * 2;

    function stop() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        lines = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function resize() {
        stop();
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function render(time: number) {
        frame = null;
        if (document.hidden || !media.matches || time - lastInput > 3000) {
            stop();
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = lightTheme ? "source-over" : "lighter";
        phase += 0.0015;
        context.strokeStyle = `hsla(${Math.round(265 + Math.sin(phase) * 85)},${lightTheme ? 45 : 75}%,${lightTheme ? 35 : 60}%,0.05)`;
        context.lineWidth = 10;
        let settled = true;

        for (const line of lines) {
            let spring = line.spring;
            for (let index = 0; index < line.nodes.length; index++) {
                const node = line.nodes[index];
                const previous = line.nodes[index - 1];
                const target = previous ?? position;
                node.vx += (target.x - node.x) * spring;
                node.vy += (target.y - node.y) * spring;
                if (previous) {
                    node.vx += previous.vx * 0.025;
                    node.vy += previous.vy * 0.025;
                }
                node.vx *= line.friction;
                node.vy *= line.friction;
                node.x += node.vx;
                node.y += node.vy;
                spring *= 0.99;
                if (Math.abs(node.x - position.x) + Math.abs(node.y - position.y) + Math.abs(node.vx) + Math.abs(node.vy) > 0.1) {
                    settled = false;
                }
            }

            context.beginPath();
            context.moveTo(line.nodes[0].x, line.nodes[0].y);
            for (let index = 1; index < line.nodes.length - 2; index++) {
                const node = line.nodes[index];
                const next = line.nodes[index + 1];
                context.quadraticCurveTo(node.x, node.y, (node.x + next.x) / 2, (node.y + next.y) / 2);
            }
            const penultimate = line.nodes[line.nodes.length - 2];
            const last = line.nodes[line.nodes.length - 1];
            context.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);
            context.stroke();
        }

        if (settled && time - lastInput > 100) stop();
        else frame = requestAnimationFrame(render);
    }

    function move(event: PointerEvent) {
        if (!media.matches || document.hidden || event.pointerType === "touch") return;
        position.x = event.clientX;
        position.y = event.clientY;
        lastInput = performance.now();
        if (!lines.length) {
            lines = Array.from({ length: 40 }, (_, index) => ({
                spring: 0.45 + index / 40 * 0.025 + Math.random() * 0.1 - 0.05,
                friction: 0.5 + Math.random() * 0.01 - 0.005,
                nodes: Array.from({ length: 50 }, () => ({ ...position, vx: 0, vy: 0 })),
            }));
        }
        if (frame === null) frame = requestAnimationFrame(render);
    }

    function handleVisibility() {
        if (document.hidden) stop();
    }

    resize();
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("blur", stop);
    media.addEventListener("change", stop);

    return () => {
        stop();
        document.removeEventListener("pointermove", move);
        document.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener("resize", resize);
        window.removeEventListener("blur", stop);
        media.removeEventListener("change", stop);
    };
}
