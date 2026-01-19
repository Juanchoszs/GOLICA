import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-primary/50">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-primary-foreground" fill="currentColor">
                  <circle cx="12" cy="12" r="10" opacity="0.3"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div>
                <span className="text-primary text-2xl tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>GOL</span>
                <span className="text-foreground text-2xl tracking-wider ml-1" style={{ fontFamily: 'var(--font-display)' }}>ICA</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              Formando campeones con pasión, disciplina y valores desde 2023 en Mosquera, Cundinamarca.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="text-primary" size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="text-primary" size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="text-primary" size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-full flex items-center justify-center transition-colors">
                <Youtube className="text-primary" size={18} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-foreground text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Inicio</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Quiénes Somos</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Logros</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Portal Jugadores</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-foreground text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="text-primary mt-1 flex-shrink-0" size={18} />
                <span className="text-muted-foreground">Mosquera, Cundinamarca, Colombia</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="text-primary mt-1 flex-shrink-0" size={18} />
                <span className="text-muted-foreground">+57 300 123 4567</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="text-primary mt-1 flex-shrink-0" size={18} />
                <span className="text-muted-foreground">info@golica.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-muted-foreground">
            © {currentYear} GOL ICA. Todos los derechos reservados. Fundado en 2023.
          </p>
        </div>
      </div>
    </footer>
  );
}
