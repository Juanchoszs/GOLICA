
export const generatePlayerSheet = async (player: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permite las ventanas emergentes para descargar la ficha');
    return;
  }

  const parseField = (field: any, defaultValue: any = []) => {
    if (!field) return defaultValue;
    if (typeof field === 'string') {
      try {
        const cleaned = field.trim();
        if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
          return JSON.parse(cleaned);
        }
        return field || defaultValue;
      } catch (e) {
        return field || defaultValue;
      }
    }
    return field;
  };

  const calculateAge = (birth_date?: string, birthDate?: string) => {
    const rawDate = birthDate || birth_date;
    if (!rawDate) return 'N/A';
    const today = new Date();
    const [y, m, d] = rawDate.split('-');
    const birth = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (isNaN(birth.getTime())) return 'N/A';

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const [y, m, d] = dateString.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const parsedTournaments = parseField(player.tournaments, []);
  const parsedInjuries = parseField(player.injuries, []);
  const parsedPerformance = parseField(player.performance, { training: 0, matchGoals: 0, matchAssists: 0 });
  const displayWeight = player.weight ? String(player.weight).replace(/[^\d.]/g, '') : '';
  const displayHeight = player.height ? String(player.height).replace(/[^\d.]/g, '') : '';

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Ficha Técnica - ${player.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: #10b981;
          --primary-dark: #047857;
          --secondary: #0f172a;
          --accent: #f59e0b;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --bg-light: #f8fafc;
          --border: #e2e8f0;
        }

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
          .page-content {
            box-shadow: none !important;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Outfit', sans-serif;
        }
        
        body {
          background: #e2e8f0;
          padding: 20px;
          display: flex;
          justify-content: center;
          color: var(--text-main);
        }
        
        .page-content {
          width: 210mm;
          min-height: 297mm;
          background: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Dekorativer Hintergrund */
        .bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 350px;
          background: linear-gradient(135deg, var(--secondary) 0%, #1e293b 100%);
          z-index: 0;
          overflow: hidden;
        }

        .bg-pattern::after {
          content: '';
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%);
        }

        .bg-pattern::before {
          content: '';
          position: absolute;
          top: -30px;
          left: -30px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%);
        }

        .main-container {
          position: relative;
          z-index: 10;
          padding: 40px;
        }

        /* HEADER */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          color: white;
        }

        .header-left {
          display: flex;
          flex-direction: column;
        }

        .doc-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: var(--primary);
          font-weight: 700;
          margin-bottom: 8px;
        }

        .club-name {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 1px;
          margin: 0;
          line-height: 1;
        }

        .club-subtitle {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 400;
          margin-top: 4px;
        }

        .logo-container {
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 20px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          transform: rotate(3deg);
        }

        .logo-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        /* HERO PROFILE CARD */
        .hero-card {
          background: white;
          border-radius: 24px;
          padding: 30px;
          display: flex;
          gap: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          margin-bottom: 40px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          position: relative;
        }

        .hero-card::before {
          content: '${player.position ? player.position.substring(0, 3).toUpperCase() : 'PLY'}';
          position: absolute;
          right: 20px;
          top: -20px;
          font-size: 120px;
          font-weight: 900;
          color: var(--primary);
          opacity: 0.05;
          line-height: 1;
          z-index: 0;
        }

        .photo-wrapper {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .photo-inner {
          width: 160px;
          height: 160px;
          border-radius: 20px;
          overflow: hidden;
          border: 4px solid white;
          box-shadow: 0 10px 20px rgba(16,185,129,0.2);
          background: var(--bg-light);
          position: relative;
        }

        .photo-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          color: #cbd5e1;
        }

        .hero-details {
          flex: 1;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .player-name {
          font-size: 36px;
          font-weight: 800;
          color: var(--secondary);
          line-height: 1.1;
          margin-bottom: 15px;
        }

        .player-tags {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tag {
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tag-primary {
          background: rgba(16, 185, 129, 0.1);
          color: var(--primary-dark);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .tag-secondary {
          background: var(--secondary);
          color: white;
        }

        .hero-stats {
          display: flex;
          gap: 30px;
          border-top: 1px solid var(--border);
          padding-top: 15px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 1px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--secondary);
        }

        /* GRID CONTENT */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .section-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.15);
          color: var(--primary-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 16px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-card {
          background: var(--bg-light);
          border-radius: 16px;
          padding: 25px;
          border: 1px solid var(--border);
          height: 100%;
        }

        .data-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .data-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .data-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .data-label {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .data-value {
          font-size: 14px;
          color: var(--secondary);
          font-weight: 600;
          text-align: right;
          max-width: 60%;
        }

        /* FULL WIDTH SECTION */
        .full-section {
          margin-top: 30px;
          background: white;
          border-radius: 16px;
          padding: 25px;
          border: 1px solid var(--border);
        }

        .description-text {
          font-size: 14px;
          line-height: 1.7;
          color: #475569;
          font-weight: 400;
        }

        /* LIST ITEMS */
        .badge-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .badge-item {
          display: flex;
          align-items: center;
          background: white;
          padding: 12px 16px;
          border-radius: 10px;
          border-left: 4px solid var(--primary);
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }

        .badge-item-icon {
          margin-right: 12px;
          font-size: 18px;
        }

        .badge-item-content {
          flex: 1;
        }

        .badge-item-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--secondary);
        }

        .badge-item-date {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 30px 20px;
          background: rgba(241, 245, 249, 0.5);
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
        }

        .footer {
          position: absolute;
          bottom: 30px;
          left: 40px;
          right: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 2px solid var(--bg-light);
          font-size: 11px;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="page-content">
        <div class="bg-pattern"></div>
        
        <div class="main-container">
          <!-- HEADER -->
          <header class="header">
            <div class="header-left">
              <div class="doc-title">Documento Oficial</div>
              <h1 class="club-name">GOLICA PRO</h1>
              <div class="club-subtitle">Ficha Técnica de Jugador Deportivo</div>
            </div>
            <div class="logo-container">
              <img src="/logo.png" alt="GOLICA" onerror="this.parentElement.style.display='none'" />
            </div>
          </header>

          <!-- HERO PROFILE -->
          <div class="hero-card">
            <div class="photo-wrapper">
              <div class="photo-inner">
                ${player.photo_url
      ? `<img src="${player.photo_url}" alt="${player.name}" onerror="this.outerHTML='<div class=\\'photo-placeholder\\'>👤</div>'" />`
      : `<div class="photo-placeholder">👤</div>`
    }
              </div>
            </div>
            
            <div class="hero-details">
              <h2 class="player-name">${player.name}</h2>
              <div class="player-tags">
                <span class="tag tag-secondary">${player.position || 'Sin Posición'}</span>
                <span class="tag tag-primary">${player.category || 'Categoría N/A'}</span>
              </div>
              
              <div class="hero-stats">
                <div class="stat-item">
                  <span class="stat-label">Edad</span>
                  <span class="stat-value">${calculateAge(player.birth_date, player.birthDate)}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Estatura</span>
                  <span class="stat-value">${displayHeight ? displayHeight + 'm' : 'N/A'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Peso</span>
                  <span class="stat-value">${displayWeight ? displayWeight + 'kg' : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- GRID -->
          <div class="content-grid">
            
            <!-- COL 1: INFO -->
            <div class="info-card">
              <div class="section-header">
                <div class="section-icon">📋</div>
                <h3 class="section-title">Datos Personales</h3>
              </div>
              <div class="data-list">
                <div class="data-item">
                  <span class="data-label">Identificación</span>
                  <span class="data-value">${player.identification}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Fecha Nacimiento</span>
                  <span class="data-value">${formatDate(player.birth_date || player.birthDate)}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Teléfono</span>
                  <span class="data-value">${player.phone || 'N/A'}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Email</span>
                  <span class="data-value" style="word-break: break-all;">${player.email || 'N/A'}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Procedencia</span>
                  <span class="data-value">${player.previous_team || 'Ingreso Directo'}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Estado</span>
                  <span class="data-value">${player.status === 'active' ? 'Activo' : player.status === 'injured' ? 'Lesionado' : 'Inactivo'}</span>
                </div>
              </div>
            </div>

            <!-- COL 2: MEDICAL & TOURNAMENTS -->
            <div style="display: flex; flex-direction: column; gap: 30px;">
              
              <!-- TOURNAMENTS -->
              <div class="info-card" style="padding-bottom: 20px;">
                <div class="section-header">
                  <div class="section-icon">🏆</div>
                  <h3 class="section-title">Torneos Activos</h3>
                </div>
                ${parsedTournaments.length > 0 ? `
                  <div class="badge-list">
                    ${parsedTournaments.slice(0, 3).map((t: string) => `
                      <div class="badge-item" style="border-left-color: #f59e0b;">
                        <span class="badge-item-icon">⚽</span>
                        <div class="badge-item-content">
                          <div class="badge-item-title">${t}</div>
                        </div>
                      </div>
                    `).join('')}
                    ${parsedTournaments.length > 3 ? `
                      <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 5px;">
                        +${parsedTournaments.length - 3} torneos más
                      </div>
                    ` : ''}
                  </div>
                ` : `
                  <div class="empty-state">Sin torneos registrados</div>
                `}
              </div>

              <!-- MEDICAL -->
              <div class="info-card">
                <div class="section-header">
                  <div class="section-icon">🏥</div>
                  <h3 class="section-title">Historial Médico</h3>
                </div>
                ${parsedInjuries.length > 0 ? `
                  <div class="badge-list">
                    ${parsedInjuries
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 2)
        .map((injury: any) => `
                        <div class="badge-item" style="border-left-color: #ef4444;">
                          <div class="badge-item-content">
                            <div class="badge-item-title" style="color: #b91c1c;">${injury.type}</div>
                            <div class="badge-item-date">${formatDate(injury.date)}</div>
                          </div>
                        </div>
                      `).join('')}
                  </div>
                ` : `
                  <div class="empty-state">Sin antecedentes médicos</div>
                `}
              </div>

            </div>
          </div>

          <!-- DESCRIPTION -->
          ${player.description ? `
            <div class="full-section">
              <div class="section-header">
                <div class="section-icon">📝</div>
                <h3 class="section-title">Perfil Técnico y Observaciones</h3>
              </div>
              <div class="description-text">
                ${player.description}
              </div>
            </div>
          ` : ''}

          <!-- FOOTER -->
          <footer class="footer">
            <div>Documento generado el ${new Date().toLocaleDateString('es-CO')}</div>
            <div>Uso exclusivo interno • GOLICA PRO</div>
          </footer>
          
        </div>
      </div>
      
      <script>
        window.onload = function() {
          // Wait for images and fonts to load
          setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 100);
          }, 800);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
