// lib/extractPdfText.ts

export async function extractPdfText(file: File): Promise<string> {
  // Dynamically import PDF.js — only runs in the browser, never on the server
  const pdfjsLib = await import("pdfjs-dist");

  // Point to the worker file you copied to /public in Step 2
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: any) => item.str).join(" "));
  }

  return pages.join("\n\n").replace(/\s{3,}/g, "  ").trim();
}