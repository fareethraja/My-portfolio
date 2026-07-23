import { extractDocumentFileText } from "./document-import";

export async function extractOfferFileText(file: File): Promise<string> {
    return extractDocumentFileText(file, {
        documentName: "offer letter",
        pasteFallback: "Paste the offer text instead.",
    });
}