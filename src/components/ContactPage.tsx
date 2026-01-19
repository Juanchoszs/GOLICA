import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono y WhatsApp',
      details: ['+57 301 234 5678'],
      action: {
        label: 'Llamar Ahora',
        href: 'tel:+573012345678',
      },
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: ['Chatea con nosotros', 'Respuesta inmediata'],
      action: {
        label: 'Abrir WhatsApp',
        href: 'https://wa.me/573012345678',
        external: true,
      },
    },
    {
      icon: Mail,
      title: 'Correo Electrónico',
      details: ['golica@gmail.com'],
      action: {
        label: 'Enviar Email',
        href: 'mailto:golica@gmail.com',
      },
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      details: ['Mosquera, Cundinamarca', 'Colombia'],
      action: {
        label: 'Ver en Mapa',
        href: '#',
      },
    },
  ];

  const schedules = [
    { day: 'Lunes - Viernes', hours: '8:00 AM - 11:00 PM', type: 'regular' },
    { day: 'Sábados', hours: '7:00 AM - 11:00 PM', type: 'weekend' },
    { day: 'Domingos', hours: '7:00 AM - 10:00 PM', type: 'weekend' },
    { day: 'Feriados', hours: 'Horario especial', type: 'special' },
  ];

  const departments = [
    { name: 'Información General', email: 'golica@gmail.com' },
    { name: 'Inscripciones', email: 'golica@gmail.com' },
    { name: 'Patrocinios', email: 'golica@gmail.com' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('¡Mensaje enviado con éxito! Te responderemos pronto.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="inline-block mb-4 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
            <span className="text-primary text-sm">Estamos Aquí Para Ti</span>
          </div>
          <h1 className="text-foreground text-5xl md:text-6xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Contáctanos
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl">
            ¿Tienes preguntas sobre nuestros programas, instalaciones o quieres reservar? Estamos disponibles para ayudarte
          </p>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="bg-card border-border p-6 hover:border-primary/50 transition-all group"
                >
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                    <Icon className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="text-card-foreground mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.title}
                  </h3>
                  {item.details.map((detail, i) => (
                    <p key={i} className="text-muted-foreground text-sm mb-1">
                      {detail}
                    </p>
                  ))}
                  <a
                    href={item.action.href}
                    target={item.action.external ? '_blank' : undefined}
                    rel={item.action.external ? 'noopener noreferrer' : undefined}
                    className="inline-block mt-4 text-primary hover:text-primary/80 text-sm transition-colors"
                  >
                    {item.action.label} →
                  </a>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-foreground text-3xl md:text-4xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Envíanos un Mensaje
              </h2>
              <p className="text-muted-foreground mb-8">
                Completa el formulario y nos pondremos en contacto contigo lo antes posible
              </p>

              <Card className="bg-card border-border p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      placeholder="Juan Pérez"
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-foreground">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        placeholder="juan@email.com"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-foreground">
                        Teléfono *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                        placeholder="+57 301 234 5678"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-foreground">
                      Asunto *
                    </Label>
                    <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)} required>
                      <SelectTrigger className="bg-input-background border-border text-foreground">
                        <SelectValue placeholder="Selecciona un tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Información General</SelectItem>
                        <SelectItem value="inscripcion">Inscripción al Club</SelectItem>
                        <SelectItem value="patrocinio">Patrocinios</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-foreground">
                      Mensaje *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                      rows={6}
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Send className="mr-2" size={18} />
                    Enviar Mensaje
                  </Button>
                </form>
              </Card>

              {/* WhatsApp Banner */}
              <Card className="bg-primary/10 border-primary/30 p-6 mt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                    <MessageCircle className="text-primary-foreground" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1">¿Necesitas respuesta inmediata?</h3>
                    <p className="text-muted-foreground text-sm">Escríbenos por WhatsApp y te responderemos al instante</p>
                  </div>
                  <a
                    href="https://wa.me/573012345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
                  >
                    Chatear Ahora
                  </a>
                </div>
              </Card>
            </div>

            {/* Additional Info */}
            <div>
              <h2 className="text-foreground text-3xl md:text-4xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Información Adicional
              </h2>
              <p className="text-muted-foreground mb-8">
                Aquí encontrarás información útil para contactarnos
              </p>

              {/* Schedule */}
              <Card className="bg-card border-border p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                    <Clock className="text-primary" size={24} />
                  </div>
                  <h3 className="text-card-foreground text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    Horarios de Atención
                  </h3>
                </div>
                <div className="space-y-3">
                  {schedules.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center pb-3 border-b border-border last:border-0"
                    >
                      <span className="text-muted-foreground">{schedule.day}</span>
                      <span className={schedule.type === 'regular' ? 'text-primary' : 'text-foreground'}>
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  * Oficinas administrativas: Lun-Vie 9:00 AM - 6:00 PM
                </p>
              </Card>

              {/* Departments */}
              <Card className="bg-card border-border p-8 mb-6">
                <h3 className="text-card-foreground text-xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                  Departamentos
                </h3>
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <h4 className="text-foreground mb-1">{dept.name}</h4>
                        <a href={`mailto:${dept.email}`} className="text-primary hover:text-primary/80 text-sm">
                          {dept.email}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Location */}
              <Card className="bg-card border-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <h3 className="text-card-foreground text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    Visítanos
                  </h3>
                </div>
                <p className="text-muted-foreground mb-2">Mosquera, Cundinamarca</p>
                <p className="text-muted-foreground mb-4">Colombia</p>
                <a
                  href="#"
                  className="inline-block bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Ver en Google Maps →
                </a>
                <p className="text-muted-foreground text-sm mt-6">
                  Contamos con estacionamiento gratuito para visitantes
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 mb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-foreground text-4xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              ¿Tienes Dudas?
            </h2>
            <p className="text-muted-foreground text-lg">
              Revisa nuestra sección de preguntas frecuentes o contáctanos directamente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-card border-border p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-primary" size={24} />
              </div>
              <h3 className="text-foreground mb-2">Llámanos</h3>
              <p className="text-muted-foreground text-sm mb-4">Lun-Vie 8:00 AM - 11:00 PM</p>
              <a href="tel:+573012345678" className="text-primary hover:text-primary/80">
                +57 301 234 5678
              </a>
            </Card>

            <Card className="bg-card border-border p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-primary" size={24} />
              </div>
              <h3 className="text-foreground mb-2">WhatsApp</h3>
              <p className="text-muted-foreground text-sm mb-4">Respuesta inmediata</p>
              <a
                href="https://wa.me/573012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                Chatear Ahora
              </a>
            </Card>

            <Card className="bg-card border-border p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-primary" size={24} />
              </div>
              <h3 className="text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground text-sm mb-4">Te respondemos en 24h</p>
              <a href="mailto:golica@gmail.com" className="text-primary hover:text-primary/80">
                golica@gmail.com
              </a>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
