type PositionedText = {
    text: string;
    x: number;
    y: number;
};

type DocumentImportOptions = {
    documentName: string;
    pasteFallback: string;
};

function cleanExtractedText(value: string): string {
    return value
        .replace(/\u0000|\u200b/g, "")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, 150_000);
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(message)), milliseconds);
        promise.then(
            (value) => {
                window.clearTimeout(timer);
                resolve(value);
            },
            (error) => {
                window.clearTimeout(timer);
                reject(error);
            },
        );
    });
}

function reconstructPdfPage(items: unknown[]): string {
    const positioned = items.flatMap<PositionedText>((item) => {
        if (!item || typeof item !== "object" || !("str" in item) || !("transform" in item)) return [];
        const text = typeof item.str === "string" ? item.str.trim() : "";
        const transform = Array.isArray(item.transform) ? item.transform : [];
        if (!text || transform.length < 6) return [];
        return [{ text, x: Number(transform[4]) || 0, y: Number(transform[5]) || 0 }];
    });

    positioned.sort((left, right) => Math.abs(right.y - left.y) > 2 ? right.y - left.y : left.x - right.x);
    const rows: Array<{ y: number; items: PositionedText[] }> = [];
    for (const item of positioned) {
        const row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= 2);
        if (row) row.items.push(item);
        else rows.push({ y: item.y, items: [item] });
    }

    return rows
        .sort((left, right) => right.y - left.y)
        .map((row) => row.items.sort((left, right) => left.x - right.x).map((item) => item.text).join(" "))
        .join("\n");
}

async function extractPdfText(file: File, options: DocumentImportOptions): Promise<string> {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url,
    ).toString();

    const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
        disableFontFace: true,
        useSystemFonts: false,
        useWasm: false,
        useWorkerFetch: false,
    });
    const document = await loadingTask.promise;

    try {
        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
            const page = await withTimeout(
                document.getPage(pageNumber),
                15_000,
                `Page ${pageNumber} took too long to open. ${options.pasteFallback}`,
            );
            const content = await withTimeout(
                page.getTextContent(),
                15_000,
                `Page ${pageNumber} took too long to read. ${options.pasteFallback}`,
            );
            pages.push(reconstructPdfPage(content.items));
            page.cleanup();
        }

        const text = cleanExtractedText(pages.join("\n\n"));
        if (text.length < 40) {
            throw new Error(`No selectable text was found in this ${options.documentName}. It may be a scanned image. Export a text-based PDF or ${options.pasteFallback.toLowerCase()}`);
        }
        return text;
    } finally {
        await loadingTask.destroy();
    }
}

export async function extractDocumentFileText(file: File, options: DocumentImportOptions): Promise<string> {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
        return extractPdfText(file, options);
    }
    if (
        fileName.endsWith(".docx") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        const text = cleanExtractedText(result.value);
        if (text.length < 40) throw new Error(`No readable text was found in this ${options.documentName}.`);
        return text;
    }
    if (fileName.endsWith(".txt") || fileName.endsWith(".md") || file.type.startsWith("text/")) {
        const text = cleanExtractedText(await file.text());
        if (text.length < 40) throw new Error(`No readable text was found in this ${options.documentName}.`);
        return text;
    }
    throw new Error(`Upload a PDF, DOCX, TXT, or Markdown ${options.documentName}.`);
}