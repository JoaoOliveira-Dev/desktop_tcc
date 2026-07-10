export async function downloadHtmlFile(html: string, filename: string) {
  const preparedHtml = await prepareReportHtml(html);
  const blobUrl = URL.createObjectURL(
    new Blob([preparedHtml], { type: "text/html;charset=utf-8" })
  );
  const element = document.createElement("a");
  element.setAttribute("href", blobUrl);
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

export async function downloadPdfFromHtml(html: string, filename: string) {
  const preparedHtml = await prepareReportHtml(html);
  const electronPdfSaver = window.electron?.saveHtmlReportPdf;

  if (electronPdfSaver) {
    await electronPdfSaver(preparedHtml, filename);
    return;
  }

  await downloadPdfWithCanvas(preparedHtml, filename);
}

async function downloadPdfWithCanvas(html: string, filename: string) {
  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "794px";
  iframe.style.height = "1123px";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";

  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = html;
    });

    const iframeDocument = iframe.contentDocument;

    if (!iframeDocument?.body) {
      throw new Error("Não foi possível renderizar o relatório para PDF.");
    }

    if (iframeDocument.fonts?.ready) {
      await iframeDocument.fonts.ready;
    }

    await Promise.all(
      Array.from(iframeDocument.images).map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            image.onload = () => resolve();
            image.onerror = () => resolve();
          })
      )
    );

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const pdfWidth = 210;
    const pdfHeight = 297;
    const pageElements = Array.from(
      iframeDocument.querySelectorAll<HTMLElement>(".report-page")
    );
    const sourcePages =
      pageElements.length > 0 ? pageElements : [iframeDocument.body];

    for (const [pageIndex, pageElement] of sourcePages.entries()) {
      const canvas = await html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        backgroundColor: "#ffffff",
        width: pageElement.scrollWidth || 794,
        height: pageElement.scrollHeight || 1123,
        windowWidth: 794,
        windowHeight: pageElement.scrollHeight || 1123,
      });
      const sliceHeight = Math.floor((canvas.width * pdfHeight) / pdfWidth);
      const getSafeSliceHeight = createSafeSliceHeightGetter(
        pageElement,
        canvas,
        sliceHeight
      );
      let renderedHeight = 0;

      while (renderedHeight < canvas.height) {
        if (pageIndex > 0 || renderedHeight > 0) {
          pdf.addPage();
        }

        const currentSliceHeight = getSafeSliceHeight(renderedHeight);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = currentSliceHeight;

        const context = sliceCanvas.getContext("2d");

        if (!context) {
          throw new Error("Não foi possível montar a página do PDF.");
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        context.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          currentSliceHeight,
          0,
          0,
          canvas.width,
          currentSliceHeight
        );

        const imgHeight = (currentSliceHeight * pdfWidth) / canvas.width;

        pdf.addImage(
          sliceCanvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          pdfWidth,
          imgHeight,
          undefined,
          "FAST"
        );

        renderedHeight += currentSliceHeight;
      }
    }

    pdf.save(filename);
  } finally {
    iframe.remove();
  }
}

async function prepareReportHtml(html: string) {
  return inlineLocalAssets(html);
}

async function inlineLocalAssets(html: string) {
  const assetSources = collectLocalAssetSources(html);
  let inlinedHtml = html;

  await Promise.all(
    assetSources.map(async (source) => {
      const dataUrl = await readAssetAsDataUrl(source);

      if (!dataUrl) {
        return;
      }

      inlinedHtml = replaceAssetSource(inlinedHtml, source, dataUrl);
    })
  );

  return inlinedHtml;
}

function collectLocalAssetSources(html: string) {
  const sources = new Set<string>();
  const cssUrlRegex = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  const elementSourceRegex = /\s(?:src|href)=["']([^"']+)["']/g;

  for (const match of html.matchAll(cssUrlRegex)) {
    const source = match[2]?.trim();

    if (source && isLocalAssetSource(source)) {
      sources.add(source);
    }
  }

  for (const match of html.matchAll(elementSourceRegex)) {
    const source = match[1]?.trim();

    if (source && isLocalAssetSource(source)) {
      sources.add(source);
    }
  }

  return Array.from(sources);
}

function isLocalAssetSource(source: string) {
  if (
    source.startsWith("#") ||
    /^(?:data|blob|https?|mailto|tel):/i.test(source)
  ) {
    return false;
  }

  return true;
}

async function readAssetAsDataUrl(source: string) {
  for (const candidate of getAssetUrlCandidates(source)) {
    try {
      const response = await fetch(candidate);

      if (!response.ok) {
        continue;
      }

      return blobToDataUrl(await response.blob());
    } catch {
      // Try the next candidate. Assets can be served from http in dev or file in Electron.
    }
  }

  return null;
}

function getAssetUrlCandidates(source: string) {
  const candidates = new Set<string>();
  const addUrl = (value: string, base?: string) => {
    try {
      candidates.add(new URL(value, base).href);
    } catch {
      // Ignore invalid combinations and keep trying the next path shape.
    }
  };

  addUrl(source, document.baseURI);

  if (source.startsWith("/")) {
    addUrl(source, window.location.origin);
    addUrl(`.${source}`, getCurrentDirectoryUrl());
  }

  return Array.from(candidates);
}

function getCurrentDirectoryUrl() {
  return window.location.href.replace(/[#?].*$/, "").replace(/[^/]*$/, "");
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function replaceAssetSource(html: string, source: string, dataUrl: string) {
  const escapedSource = escapeRegExp(source);

  return html
    .replace(
      new RegExp(`(\\s(?:src|href)=["'])${escapedSource}(["'])`, "g"),
      (_match, prefix: string, suffix: string) => `${prefix}${dataUrl}${suffix}`
    )
    .replace(
      new RegExp(`url\\(\\s*(['"]?)${escapedSource}\\1\\s*\\)`, "g"),
      () => `url("${dataUrl}")`
    );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createSafeSliceHeightGetter(
  pageElement: HTMLElement,
  canvas: HTMLCanvasElement,
  sliceHeight: number
) {
  const cssHeight =
    pageElement.scrollHeight || pageElement.getBoundingClientRect().height || 1;
  const canvasScale = canvas.height / cssHeight;
  const breakMargin = 18 * canvasScale;
  const minSliceHeight = Math.min(sliceHeight * 0.45, 620 * canvasScale);
  const avoidRects = collectAvoidRects(pageElement, canvasScale, sliceHeight);

  return (renderedHeight: number) => {
    const remainingHeight = canvas.height - renderedHeight;
    const naturalEnd = Math.min(renderedHeight + sliceHeight, canvas.height);

    if (remainingHeight <= sliceHeight || naturalEnd >= canvas.height - 2) {
      return remainingHeight;
    }

    const splitSafeEnd = avoidRects
      .filter(
        (rect) =>
          rect.top + breakMargin < naturalEnd &&
          rect.bottom - breakMargin > naturalEnd
      )
      .map((rect) => rect.top - breakMargin)
      .filter((safeEnd) => safeEnd - renderedHeight >= minSliceHeight)
      .sort((a, b) => b - a)[0];

    if (splitSafeEnd) {
      return Math.max(1, Math.floor(splitSafeEnd - renderedHeight));
    }

    const nearbyBreak = avoidRects
      .map((rect) => rect.bottom + breakMargin)
      .filter(
        (breakPoint) =>
          breakPoint > renderedHeight + minSliceHeight &&
          breakPoint < naturalEnd - breakMargin &&
          naturalEnd - breakPoint < 170 * canvasScale
      )
      .sort((a, b) => b - a)[0];

    if (nearbyBreak) {
      return Math.max(1, Math.floor(nearbyBreak - renderedHeight));
    }

    return Math.min(sliceHeight, remainingHeight);
  };
}

type AvoidRect = {
  top: number;
  bottom: number;
};

function collectAvoidRects(
  pageElement: HTMLElement,
  canvasScale: number,
  sliceHeight: number
) {
  const selectors = [
    ".vuln-header",
    ".cvss-grid",
    ".cvss-item",
    ".card",
    ".responsible-card",
    ".poc-title",
    ".poc-caption",
    ".section-kicker",
    ".vuln-heading",
    ".vuln-title",
    "h1",
    "h2",
    "h3",
    "h4",
    "tr",
    "pre",
    "code",
    "img",
  ].join(",");
  const maxElementHeight = sliceHeight * 0.42;
  const maxMediaHeight = sliceHeight * 0.86;
  const rootRect = pageElement.getBoundingClientRect();
  const rootScrollTop = pageElement.scrollTop || 0;

  const elementRects = Array.from(
    pageElement.querySelectorAll<HTMLElement>(selectors)
  )
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const top = Math.max(0, rect.top - rootRect.top + rootScrollTop);
      const bottom = Math.min(
        pageElement.scrollHeight || rect.bottom,
        rect.bottom - rootRect.top + rootScrollTop
      );

      return {
        top: top * canvasScale,
        bottom: bottom * canvasScale,
        element,
      };
    })
    .filter((rect) => {
      const height = rect.bottom - rect.top;
      const maxHeight = rect.element.matches("img")
        ? maxMediaHeight
        : maxElementHeight;

      return height > 12 * canvasScale && height <= maxHeight;
    })
    .map(({ top, bottom }) => ({ top, bottom }))
    .sort((a, b) => a.top - b.top);

  return [
    ...elementRects,
    ...collectKeepWithNextRects(pageElement, canvasScale, sliceHeight),
    ...collectTextLineRects(pageElement, canvasScale),
  ]
    .filter((rect) => rect.bottom > rect.top)
    .sort((a, b) => a.top - b.top);
}

function collectKeepWithNextRects(
  pageElement: HTMLElement,
  canvasScale: number,
  sliceHeight: number
) {
  const selectors = [
    "h2.section-title",
    ".vuln-section h4",
    ".content-section h3",
    ".vuln-heading",
    ".poc-title",
  ].join(",");
  const rootRect = pageElement.getBoundingClientRect();
  const rootScrollTop = pageElement.scrollTop || 0;
  const maxHeight = sliceHeight * 0.22;

  return Array.from(pageElement.querySelectorAll<HTMLElement>(selectors))
    .map((element) => {
      const headingRect = element.getBoundingClientRect();
      const parentRect = element
        .closest<HTMLElement>(
          ".vuln-section, .content-section, .poc-table, .vulnerability, .vuln"
        )
        ?.getBoundingClientRect();
      const nextElementRect =
        element.nextElementSibling?.getBoundingClientRect();
      const top = Math.max(0, headingRect.top - rootRect.top + rootScrollTop);
      const keepUntil = Math.min(
        (nextElementRect?.top ?? headingRect.bottom) + 72,
        parentRect?.bottom ?? nextElementRect?.bottom ?? headingRect.bottom + 72
      );
      const preferredBottom = Math.max(headingRect.bottom, keepUntil);
      const bottom = Math.max(
        top,
        preferredBottom - rootRect.top + rootScrollTop
      );

      return {
        top: top * canvasScale,
        bottom: Math.min(bottom * canvasScale, top * canvasScale + maxHeight),
      };
    })
    .filter((rect) => rect.bottom - rect.top > 12 * canvasScale);
}

function collectTextLineRects(
  pageElement: HTMLElement,
  canvasScale: number
): AvoidRect[] {
  const rootRect = pageElement.getBoundingClientRect();
  const rootScrollTop = pageElement.scrollTop || 0;
  const walker = pageElement.ownerDocument.createTreeWalker(
    pageElement,
    NodeFilter.SHOW_TEXT
  );
  const rects: AvoidRect[] = [];

  while (walker.nextNode()) {
    const textNode = walker.currentNode;

    if (!textNode.textContent?.trim()) {
      continue;
    }

    const parentElement = textNode.parentElement;

    if (!parentElement || parentElement.closest("script,style")) {
      continue;
    }

    const range = pageElement.ownerDocument.createRange();
    range.selectNodeContents(textNode);

    Array.from(range.getClientRects()).forEach((rect) => {
      if (rect.height < 4 || rect.width < 2) {
        return;
      }

      rects.push({
        top: Math.max(0, rect.top - rootRect.top + rootScrollTop) * canvasScale,
        bottom:
          Math.max(0, rect.bottom - rootRect.top + rootScrollTop) *
          canvasScale,
      });
    });

    range.detach();
  }

  return rects;
}
