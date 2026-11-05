import { createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";

export function attachPageNumbers(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor("#777777").text(
      `Page ${i + 1} of ${range.count}`,
      50,
      doc.page.height - 40,
      { align: "center", width: doc.page.width - 100 }
    );
  }
}

export function waitForStream(doc, filePath) {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(filePath);
    stream.on("finish", async () => {
      try {
        const info = await stat(filePath);
        resolve(info.size);
      } catch (err) { reject(err); }
    });
    stream.on("error", reject);
    doc.on("error", reject);
    doc.pipe(stream);
  });
}
