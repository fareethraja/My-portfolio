export type PrintableWindow = {
    opener: unknown;
    document: {
        write(value: string): void;
        close(): void;
    };
};

export type PrintWindowFactory = (url?: string | URL, target?: string, features?: string) => PrintableWindow | null;

export function escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    })[character] ?? character);
}

export function openPrintDocument(
    html: string,
    openWindow: PrintWindowFactory = window.open.bind(window),
): boolean {
    const popup = openWindow("", "_blank");
    if (!popup) return false;
    popup.opener = null;
    popup.document.write(html);
    popup.document.close();
    return true;
}