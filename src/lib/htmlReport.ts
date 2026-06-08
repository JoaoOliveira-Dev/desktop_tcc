export function downloadHtmlFile(html: string, filename: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/html;charset=utf-8," + encodeURIComponent(html)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export async function downloadPdfFromHtml(html: string, filename: string) {
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
        backgroundColor: "#ffffff",
        width: pageElement.scrollWidth || 794,
        height: pageElement.scrollHeight || 1123,
        windowWidth: 794,
        windowHeight: pageElement.scrollHeight || 1123,
      });
      const sliceHeight = Math.floor((canvas.width * pdfHeight) / pdfWidth);
      let renderedHeight = 0;

      while (renderedHeight < canvas.height) {
        if (pageIndex > 0 || renderedHeight > 0) {
          pdf.addPage();
        }

        const currentSliceHeight = Math.min(
          sliceHeight,
          canvas.height - renderedHeight
        );
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
          sliceCanvas.toDataURL("image/jpeg", 0.98),
          "JPEG",
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
