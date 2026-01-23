// Opción 1: Usando jsPDF (instalar con: pnpm add jspdf jspdf-autotable)
// Descomentar cuando instales las librerías

/*
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePlayerSheet = async (player: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header con logo/titulo
  doc.setFillColor(16, 185, 129); // Color primary
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FICHA TÉCNICA DEL JUGADOR', pageWidth / 2, 17, { align: 'center' });
  doc.setFontSize(10);
  doc.text('GOLICA Football Academy', pageWidth / 2, 24, { align: 'center' });

  let yPos = 40;

  // Foto del jugador (si existe)
  if (player.photo_url) {
    try {
      const img = await loadImage(player.photo_url);
      doc.addImage(img, 'JPEG', margin, yPos, 40, 40);
    } catch (error) {
      console.error('Error loading image:', error);
    }
  }

  // Datos personales junto a la foto
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(player.name, margin + 45, yPos + 5);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID: ${player.identification}`, margin + 45, yPos + 12);
  doc.text(`Email: ${player.email}`, margin + 45, yPos + 18);
  doc.text(`Teléfono: ${player.phone}`, margin + 45, yPos + 24);
  doc.text(`Edad: ${calculateAge(player.birth_date)}`, margin + 45, yPos + 30);
  doc.text(`Categoría: ${player.category || 'N/A'}`, margin + 45, yPos + 36);

  yPos += 50;

  // Datos deportivos
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INFORMACIÓN DEPORTIVA', margin + 2, yPos + 5);
  yPos += 13;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Posición: ${player.position || 'N/A'}`, margin, yPos);
  doc.text(`Estado: ${player.status || 'Activo'}`, margin + 80, yPos);
  yPos += 7;
  
  if (player.description) {
    doc.text('Descripción:', margin, yPos);
    yPos += 5;
    const splitDesc = doc.splitTextToSize(player.description, pageWidth - 2 * margin);
    doc.text(splitDesc, margin, yPos);
    yPos += splitDesc.length * 5 + 5;
  }

  // Torneos
  if (player.tournaments && player.tournaments.length > 0) {
    yPos += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('TORNEOS ACTIVOS', margin + 2, yPos + 5);
    yPos += 13;

    doc.setFont('helvetica', 'normal');
    player.tournaments.forEach((tournament: string, index: number) => {
      doc.text(`${index + 1}. ${tournament}`, margin + 5, yPos);
      yPos += 6;
    });
  }

  // Historial médico
  if (player.injuries && player.injuries.length > 0) {
    yPos += 5;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORIAL MÉDICO', margin + 2, yPos + 5);
    yPos += 13;

    const injuryData = player.injuries
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((injury: any) => [
        formatDate(injury.date),
        injury.type,
        injury.description || 'N/A'
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Tipo', 'Descripción']],
      body: injuryData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: margin, right: margin }
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount} - Generado: ${new Date().toLocaleDateString('es-CO')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`Ficha_Tecnica_${player.name.replace(/\s+/g, '_')}.pdf`);
};

const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = url;
  });
};

const calculateAge = (birthDate: string) => {
  if (!birthDate) return 'N/A';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age} años`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
*/

// Opción 2: HTML a PDF usando window.print (SIN DEPENDENCIAS)
// Esta opción está lista para usar ahora mismo

export const generatePlayerSheet = async (player: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permite las ventanas emergentes para descargar la ficha');
    return;
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ficha Técnica - ${player.name}</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          * {
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.4;
          color: #333;
          background: white;
          overflow: hidden;
        }
        
        .container {
          width: 210mm;
          height: 297mm;
          max-height: 297mm;
          margin: 0 auto;
          padding: 15mm;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .logo {
          position: absolute;
          top: 15mm;
          right: 15mm;
          width: 70px;
          height: 70px;
          opacity: 0.9;
          z-index: 10;
        }
        
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 18px 25px;
          text-align: center;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        
        .header h1 {
          font-size: 24px;
          margin-bottom: 4px;
          font-weight: bold;
        }
        
        .header p {
          font-size: 13px;
          opacity: 0.9;
        }
        
        .player-profile {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
          align-items: flex-start;
        }
        
        .photo {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #10b981;
          background: #f3f4f6;
          flex-shrink: 0;
        }
        
        .player-info {
          flex: 1;
          min-width: 0;
        }
        
        .player-name {
          font-size: 22px;
          font-weight: bold;
          color: #111;
          margin-bottom: 10px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px 12px;
        }
        
        .info-item {
          min-width: 0;
        }
        
        .info-label {
          font-size: 10px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 3px;
        }
        
        .info-value {
          font-size: 13px;
          color: #111;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .section {
          margin-bottom: 12px;
        }
        
        .section-title {
          background: #f3f4f6;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: bold;
          color: #111;
          border-left: 4px solid #10b981;
          margin-bottom: 10px;
        }
        
        .description {
          background: #f9fafb;
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          line-height: 1.5;
          color: #4b5563;
          border: 1px solid #e5e7eb;
          max-height: 55px;
          overflow: hidden;
        }
        
        .two-column-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .tournament-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }
        
        .tournament-item {
          background: #ecfdf5;
          border: 1px solid #10b981;
          padding: 6px 10px;
          border-radius: 5px;
          font-size: 11px;
          color: #065f46;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .injury-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        
        .injury-table thead {
          background: #10b981;
          color: white;
        }
        
        .injury-table th {
          padding: 6px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
        }
        
        .injury-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 11px;
        }
        
        .empty-state {
          text-align: center;
          padding: 15px;
          color: #9ca3af;
          font-size: 11px;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px dashed #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="/logo.png" alt="GOLICA Logo" class="logo" onerror="this.style.display='none'" />
        
        <div class="header">
          <h1>FICHA TÉCNICA DEL JUGADOR</h1>
          <p>Club de Futbol GOLICA</p>
        </div>
        
        <div class="player-profile">
          ${player.photo_url 
            ? `<img src="${player.photo_url}" alt="${player.name}" class="photo" onerror="this.style.display='none'" />`
            : `<div class="photo" style="display:flex;align-items:center;justify-content:center;font-size:48px;color:#d1d5db;">👤</div>`
          }
          
          <div class="player-info">
            <h2 class="player-name">${player.name}</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">ID</div>
                <div class="info-value">${player.identification}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Edad</div>
                <div class="info-value">${calculateAge(player.birth_date)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Categoría</div>
                <div class="info-value">${player.category || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value" style="font-size: 11px;">${player.email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Teléfono</div>
                <div class="info-value">${player.phone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Posición</div>
                <div class="info-value">${player.position || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
        
        ${player.description ? `
          <div class="section">
            <div class="section-title">Descripción</div>
            <div class="description">${player.description}</div>
          </div>
        ` : ''}
        
        <div class="two-column-grid">
          <div class="section">
            <div class="section-title">Torneos (${player.tournaments?.length || 0})</div>
            ${player.tournaments && player.tournaments.length > 0 ? `
              <div class="tournament-list">
                ${player.tournaments.slice(0, 4).map((t: string) => `
                  <div class="tournament-item">🏆 ${t}</div>
                `).join('')}
              </div>
              ${player.tournaments.length > 4 ? `
                <p style="font-size: 10px; text-align: center; margin-top: 6px; color: #6b7280;">
                  +${player.tournaments.length - 4} más
                </p>
              ` : ''}
            ` : `
              <div class="empty-state">Sin torneos</div>
            `}
          </div>
          
          <div class="section">
            <div class="section-title">Historial Médico (${player.injuries?.length || 0})</div>
            ${player.injuries && player.injuries.length > 0 ? `
              <table class="injury-table">
                <thead>
                  <tr>
                    <th style="width: 30%;">Fecha</th>
                    <th style="width: 70%;">Lesión</th>
                  </tr>
                </thead>
                <tbody>
                  ${player.injuries
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 4)
                    .map((injury: any) => {
                      const shortDate = formatDate(injury.date).split(' de ');
                      return `
                        <tr>
                          <td>${shortDate[0]} ${shortDate[1]?.substring(0, 3)}</td>
                          <td><strong>${injury.type}</strong></td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
              </table>
              ${player.injuries.length > 4 ? `
                <p style="font-size: 10px; text-align: center; margin-top: 6px; color: #6b7280;">
                  +${player.injuries.length - 4} más
                </p>
              ` : ''}
            ` : `
              <div class="empty-state">Sin antecedentes</div>
            `}
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 100);
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
