import React from "react";
import { createPortal } from "react-dom";

const PRINT_CSS = `
.mc-print-root { display: none; }
@page { size: 100mm 75mm; margin: 0; }
@media print {
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body > *:not(.mc-print-root) { display: none !important; }
  .mc-print-root {
    display: block !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100mm;
    height: 75mm;
    overflow: hidden;
  }
}
`;

type Props = {
  children: React.ReactNode;
};

const StickerPrintPortal: React.FC<Props> = ({ children }) =>
  createPortal(
    <div className="mc-print-root" aria-hidden="true">
      <style>{PRINT_CSS}</style>
      {children}
    </div>,
    document.body,
  );

const waitForImage = (img: HTMLImageElement) =>
  img.complete
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });

/** Waits for sticker images (logo/barcode) to load so they are not missing from the print. */
export const printSticker = async () => {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(".mc-print-root img"));
  await Promise.all(images.map(waitForImage));
  window.print();
};

export default StickerPrintPortal;
