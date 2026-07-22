function cleanExtractedText(value: string): string {
    return value
        .replace(/\u0000/g, "")
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

async function extractPdfText(file: File): Promise<string> {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url,
    ).toString();

    const document = await pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
        disableFontFace: true,
        useSystemFonts: false,
        useWasm: false,
        useWorkerFetch: false,
    }).promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await withTimeout(
            document.getPage(pageNumber),
            15_000,
            `Page ${pageNumber} took too long to open. Try a text-exported PDF or paste the offer text.`,
        );
        const content = await withTimeout(
            page.getTextContent(),
            15_000,
            `Page ${pageNumber} took too long to read. Try a text-exported PDF or paste the offer text.`,
        );
        const pageText = content.items
            .map((item) => {
                if (!("str" in item)) return "";
                return `${item.str}${item.hasEOL ? "\n" : " "}`;
            })
            .join("");
        pages.push(pageText);
        page.cleanup();
    }

    return cleanExtractedText(pages.join("\n\n"));
}

export async function extractOfferFileText(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
        return extractPdfText(file);
    }
    if (
        fileName.endsWith(".docx") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        return cleanExtractedText(result.value);
    }
    if (
        fileName.endsWith(".txt") ||
        fileName.endsWith(".md") ||
        file.type.startsWith("text/")
    ) {
        return cleanExtractedText(await file.text());
    }
    throw new Error("Upload a PDF, DOCX, TXT, or Markdown offer letter.");
}