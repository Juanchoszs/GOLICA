/**
 * Utility function to download player documents as a single PDF
 */

/**
 * Load image from URL with CORS support
 */
function loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg'));
            } else {
                reject(new Error('Could not get canvas context'));
            }
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = url;
    });
}

export async function downloadPlayerDocuments(
    playerName: string,
    idCardFrontUrl: string,
    idCardBackUrl: string
) {
    try {
        // Dynamically import jsPDF to avoid issues
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'cm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Dimensiones exactas de las imágenes
        const imgWidth = 15; // cm
        const imgHeight = 9; // cm
        const spacing = 2; // cm entre imágenes
        
        // Calcular posición Y para centrar verticalmente
        const totalHeight = (imgHeight * 2) + spacing;
        const startY = (pageHeight - totalHeight) / 2;
        
        // Calcular posición X para centrar horizontalmente
        const startX = (pageWidth - imgWidth) / 2;

        let yPosition = startY;

        // Add front image
        if (idCardFrontUrl) {
            try {
                const frontImg = await loadImage(idCardFrontUrl);
                doc.addImage(frontImg, 'JPEG', startX, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + spacing;
            } catch (error) {
                console.error('Error loading front image:', error);
            }
        }

        // Add back image
        if (idCardBackUrl) {
            try {
                const backImg = await loadImage(idCardBackUrl);
                doc.addImage(backImg, 'JPEG', startX, yPosition, imgWidth, imgHeight);
            } catch (error) {
                console.error('Error loading back image:', error);
            }
        }

        // Download the PDF
        const sanitizedName = playerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`${sanitizedName}-documentos.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('No se pudo generar el PDF con los documentos');
    }
}
