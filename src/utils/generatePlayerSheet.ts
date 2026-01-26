
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
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.5;
          color: #1f2937;
          background: white;
        }
        
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
        }
        
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          color: white;
          padding: 20px 30px;
          border-radius: 12px;
          margin-bottom: 25px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .header-content {
          flex: 1;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
          letter-spacing: -0.5px;
        }
        
        .header p {
          font-size: 14px;
          opacity: 0.9;
          font-weight: 500;
        }
        
        .header-logo {
          width: 90px;
          height: 90px;
        }
        
        .header-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .player-card {
          display: flex;
          gap: 30px;
          margin-bottom: 25px;
          padding: 25px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        
        .player-photo {
          flex-shrink: 0;
        }
        
        .player-photo img,
        .player-photo .placeholder {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #10b981;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .player-photo .placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e2e8f0;
          font-size: 56px;
          color: #94a3b8;
        }
        
        .player-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .player-name {
          font-size: 26px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 15px;
          letter-spacing: -0.5px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        .info-box {
          background: white;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .info-box .label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .info-box .value {
          font-size: 14px;
          color: #1e293b;
          font-weight: 600;
          word-break: break-word;
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #10b981;
        }
        
        .section-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
        
        .section-header .count {
          background: #10b981;
          color: white;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .description-box {
          background: #f8fafc;
          padding: 18px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          line-height: 1.7;
          color: #475569;
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        
        .tournament-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .tournament-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #a7f3d0;
        }
        
        .tournament-item .icon {
          font-size: 18px;
        }
        
        .tournament-item .name {
          font-size: 14px;
          font-weight: 600;
          color: #065f46;
        }
        
        .injury-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .injury-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fef2f2;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }
        
        .injury-item .type {
          font-size: 14px;
          font-weight: 600;
          color: #991b1b;
        }
        
        .injury-item .date {
          font-size: 12px;
          color: #b91c1c;
          background: white;
          padding: 4px 10px;
          border-radius: 20px;
        }
        
        .empty-state {
          text-align: center;
          padding: 30px;
          color: #94a3b8;
          font-size: 14px;
          background: #f8fafc;
          border-radius: 10px;
          border: 2px dashed #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="header-content">
            <h1>FICHA TÉCNICA DEL JUGADOR</h1>
            <p>Club de Futbol GOLICA</p>
          </div>
          <div class="header-logo">
            <img src="/logo.png" alt="GOLICA" onerror="this.parentElement.style.display='none'" />
          </div>
        </div>
        
        <div class="player-card">
          <div class="player-photo">
            ${player.photo_url 
              ? `<img src="${player.photo_url}" alt="${player.name}" onerror="this.outerHTML='<div class=\\'placeholder\\'>👤</div>'" />`
              : `<div class="placeholder">👤</div>`
            }
          </div>
          <div class="player-details">
            <h2 class="player-name">${player.name}</h2>
            <div class="info-grid">
              <div class="info-box">
                <div class="label">Identificación</div>
                <div class="value">${player.identification}</div>
              </div>
              <div class="info-box">
                <div class="label">Edad</div>
                <div class="value">${calculateAge(player.birth_date)}</div>
              </div>
              <div class="info-box">
                <div class="label">Categoría</div>
                <div class="value">${player.category || 'N/A'}</div>
              </div>
              <div class="info-box">
                <div class="label">Email</div>
                <div class="value" style="font-size: 12px;">${player.email}</div>
              </div>
              <div class="info-box">
                <div class="label">Teléfono</div>
                <div class="value">${player.phone}</div>
              </div>
              <div class="info-box">
                <div class="label">Posición</div>
                <div class="value">${player.position || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
        
        ${player.description ? `
          <div class="section">
            <div class="section-header">
              <h3>📋 Descripción del Jugador</h3>
            </div>
            <div class="description-box">${player.description}</div>
          </div>
        ` : ''}
        
        <div class="grid-2">
          <div class="section">
            <div class="section-header">
              <h3>🏆 Torneos</h3>
              <span class="count">${player.tournaments?.length || 0}</span>
            </div>
            ${player.tournaments && player.tournaments.length > 0 ? `
              <div class="tournament-list">
                ${player.tournaments.slice(0, 4).map((t: string) => `
                  <div class="tournament-item">
                    <span class="icon">⚽</span>
                    <span class="name">${t}</span>
                  </div>
                `).join('')}
              </div>
              ${player.tournaments.length > 4 ? `
                <p style="font-size: 12px; text-align: center; margin-top: 10px; color: #64748b;">
                  +${player.tournaments.length - 4} torneos más
                </p>
              ` : ''}
            ` : `
              <div class="empty-state">Sin torneos registrados</div>
            `}
          </div>
          
          <div class="section">
            <div class="section-header">
              <h3>🏥 Historial Médico</h3>
              <span class="count">${player.injuries?.length || 0}</span>
            </div>
            ${player.injuries && player.injuries.length > 0 ? `
              <div class="injury-list">
                ${player.injuries
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 4)
                  .map((injury: any) => `
                    <div class="injury-item">
                      <span class="type">${injury.type}</span>
                      <span class="date">${formatDate(injury.date)}</span>
                    </div>
                  `).join('')}
              </div>
              ${player.injuries.length > 4 ? `
                <p style="font-size: 12px; text-align: center; margin-top: 10px; color: #64748b;">
                  +${player.injuries.length - 4} registros más
                </p>
              ` : ''}
            ` : `
              <div class="empty-state">Sin antecedentes médicos</div>
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
