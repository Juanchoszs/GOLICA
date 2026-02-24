/**
 * Utility function to download player documents as a single PDF
 */

/**
 * Load image from URL with CORS support
 */
function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // Crucial para imágenes servidas vía CDN/Supabase
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Could not load image from ${url}`));

        // Add timestamp to bypass strict browser caching issues with CORS
        const urlWithCacheBust = url.includes('?')
            ? `${url}&cb=${new Date().getTime()}`
            : `${url}?cb=${new Date().getTime()}`;

        img.src = urlWithCacheBust;
    });
}

export async function downloadPlayerDocuments(
    playerName: string,
    idCardFrontUrl: string,
    idCardBackUrl: string
) {
    try {
        // Dynamically import jsPDF to avoid issues
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'cm',
            format: 'a4'
        });

        // A4 size: 21.0 x 29.7 cm
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Set dimensions for the images
        const maxWidth = 19; // cm maximum width (allowing small margins)
        const maxHeight = 14; // cm maximum height for one half of the page
        const spacingX = (pageWidth - maxWidth) / 2; // Center horizontally
        let currentY = 1; // Start Y near top

        doc.setTextColor(50, 50, 50);

        // Add front image
        if (idCardFrontUrl) {
            try {

                const frontImg = await loadImage(idCardFrontUrl);

                // Calculate aspect ratio to fit within max bounds
                const ratio = frontImg.width / frontImg.height;
                let finalWidth = maxWidth;
                let finalHeight = maxWidth / ratio;

                if (finalHeight > maxHeight) {
                    finalHeight = maxHeight;
                    finalWidth = maxHeight * ratio;
                }

                // Center specific to image width
                const xPos = (pageWidth - finalWidth) / 2;

                // Draw image outline
                doc.setDrawColor(200, 200, 200);
                doc.rect(xPos, currentY, finalWidth, finalHeight, 'S');

                // Add image to PDF using HTMLImageElement directly (jspdf supports this well)
                doc.addImage(frontImg, 'JPEG', xPos, currentY, finalWidth, finalHeight);

                // Move Y pointer down
                currentY += finalHeight + 2;

            } catch (error) {
                console.error('Error loading front image:', error);
                doc.setFontSize(10);
                doc.setTextColor(255, 0, 0);
                doc.text("Error al cargar la imagen frontal. Verifique permisos o URL.", spacingX, currentY + 1);
                currentY += 2;
            }
        }

        // Add back image
        if (idCardBackUrl) {
            try {
                const backImg = await loadImage(idCardBackUrl);

                // Calculate aspect ratio
                const ratio = backImg.width / backImg.height;
                let finalWidth = maxWidth;
                let finalHeight = maxWidth / ratio;

                if (finalHeight > maxHeight) {
                    finalHeight = maxHeight;
                    finalWidth = maxHeight * ratio;
                }

                // Check if page break is needed
                if (currentY + finalHeight > pageHeight - 1) {
                    doc.addPage();
                    currentY = 1; // Reset Y on new page
                }

                const xPos = (pageWidth - finalWidth) / 2;

                doc.setDrawColor(200, 200, 200);
                doc.rect(xPos, currentY, finalWidth, finalHeight, 'S');

                doc.addImage(backImg, 'JPEG', xPos, currentY, finalWidth, finalHeight);

            } catch (error) {
                console.error('Error loading back image:', error);
                doc.setFontSize(10);
                doc.setTextColor(255, 0, 0);
                doc.text("Error al cargar la imagen posterior. Verifique permisos o URL.", spacingX, currentY + 1);
            }
        }

        // Download the PDF
        const sanitizedName = playerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`documentos-identidad-${sanitizedName}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('No se pudo generar el documento PDF.');
    }
}
