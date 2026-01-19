import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ===== AUTENTICACIÓN ADMIN =====
app.post('/make-server-ff64a58b/admin/login', async (c) => {
  try {
    const { identification, password } = await c.req.json();

    // Definir roles y usuarios autorizados
    const adminUsers = {
      'Golica': { password: 'GolicaAdministracion#', name: 'Administrador GOL ICA', role: 'super-admin', fullName: 'Administrador' },
      'juancho': { password: 'Juancho2024#', name: 'Juan Ignacio', role: 'super-admin', fullName: 'Juan Ignacio' },
      'maicol': { password: 'Maicol2024#', name: 'Maicol', role: 'super-admin', fullName: 'Maicol' },
      'carolina': { password: 'Carolina2024#', name: 'Carolina', role: 'super-admin', fullName: 'Carolina' },
      'karen': { password: 'Karen2024#', name: 'Karen', role: 'super-admin', fullName: 'Karen' },
      'jeferson': { password: 'Jeferson2024#', name: 'Jeferson', role: 'super-admin', fullName: 'Jeferson' },
      'jhoan': { password: 'Jhoan2024#', name: 'Jhoan', role: 'coordinator', fullName: 'Jhoan - Coordinador Fisioterapia' },
    };

    const user = adminUsers[identification as keyof typeof adminUsers];

    if (user && user.password === password) {
      return c.json({
        success: true,
        user: {
          identification,
          name: user.fullName,
          role: user.role
        },
        message: 'Inicio de sesión exitoso'
      });
    }

    return c.json({ success: false, message: 'Credenciales incorrectas' }, 401);
  } catch (error) {
    console.log('Error en login administrativo:', error);
    return c.json({ success: false, message: 'Error en el servidor' }, 500);
  }
});

// ===== RESERVAS DE CANCHAS =====

// Obtener todas las reservas
app.get('/make-server-ff64a58b/reservations', async (c) => {
  try {
    const reservations = await kv.getByPrefix('reservation:');
    return c.json({ success: true, reservations });
  } catch (error) {
    console.log('Error obteniendo reservas:', error);
    return c.json({ success: false, message: 'Error obteniendo reservas' }, 500);
  }
});

// Obtener reservas por cancha y fecha
app.get('/make-server-ff64a58b/reservations/:field/:date', async (c) => {
  try {
    const field = c.req.param('field');
    const date = c.req.param('date');
    
    const allReservations = await kv.getByPrefix('reservation:');
    const filteredReservations = allReservations.filter((r: any) => 
      r.field === field && r.date === date
    );
    
    return c.json({ success: true, reservations: filteredReservations });
  } catch (error) {
    console.log('Error obteniendo reservas por cancha y fecha:', error);
    return c.json({ success: false, message: 'Error obteniendo reservas' }, 500);
  }
});

// Crear nueva reserva
app.post('/make-server-ff64a58b/reservations', async (c) => {
  try {
    const { field, date, time, customerName, customerPhone, customerID } = await c.req.json();

    // Validar datos requeridos
    if (!field || !date || !time || !customerName || !customerPhone || !customerID) {
      return c.json({ 
        success: false, 
        message: 'Todos los campos son obligatorios' 
      }, 400);
    }

    // Verificar si ya existe una reserva para esa cancha, fecha y hora
    const existingReservations = await kv.getByPrefix('reservation:');
    const conflict = existingReservations.find((r: any) => 
      r.field === field && r.date === date && r.time === time
    );

    if (conflict) {
      return c.json({ 
        success: false, 
        message: 'Esta cancha ya está reservada para ese horario' 
      }, 409);
    }

    // Crear ID único para la reserva
    const reservationId = `reservation:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Datos de la reserva
    const reservation = {
      id: reservationId,
      field,
      date,
      time,
      customerName,
      customerPhone,
      customerID,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Guardar en KV store
    await kv.set(reservationId, reservation);

    return c.json({ 
      success: true, 
      message: 'Reserva creada exitosamente',
      reservation 
    });
  } catch (error) {
    console.log('Error creando reserva:', error);
    return c.json({ success: false, message: 'Error creando reserva' }, 500);
  }
});

// Cancelar reserva (solo admin)
app.delete('/make-server-ff64a58b/reservations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Verificar que la reserva existe
    const reservation = await kv.get(id);
    if (!reservation) {
      return c.json({ success: false, message: 'Reserva no encontrada' }, 404);
    }

    // Eliminar reserva
    await kv.del(id);

    return c.json({ 
      success: true, 
      message: 'Reserva cancelada exitosamente' 
    });
  } catch (error) {
    console.log('Error cancelando reserva:', error);
    return c.json({ success: false, message: 'Error cancelando reserva' }, 500);
  }
});

// Actualizar reserva (solo admin)
app.put('/make-server-ff64a58b/reservations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    // Verificar que la reserva existe
    const existingReservation = await kv.get(id);
    if (!existingReservation) {
      return c.json({ success: false, message: 'Reserva no encontrada' }, 404);
    }

    // Actualizar reserva
    const updatedReservation = { ...existingReservation, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(id, updatedReservation);

    return c.json({ 
      success: true, 
      message: 'Reserva actualizada exitosamente',
      reservation: updatedReservation 
    });
  } catch (error) {
    console.log('Error actualizando reserva:', error);
    return c.json({ success: false, message: 'Error actualizando reserva' }, 500);
  }
});

// ===== REGISTRO DE JUGADORES =====

// Registrar nuevo jugador
app.post('/make-server-ff64a58b/players/register', async (c) => {
  try {
    const { name, email, phone, identification, category, birthDate } = await c.req.json();

    // Validar datos requeridos
    if (!name || !email || !phone || !identification || !category) {
      return c.json({ 
        success: false, 
        message: 'Todos los campos obligatorios deben ser completados' 
      }, 400);
    }

    // Verificar si ya existe un jugador con esa identificación
    const existingPlayers = await kv.getByPrefix('player:');
    const exists = existingPlayers.find((p: any) => p.identification === identification);

    if (exists) {
      return c.json({ 
        success: false, 
        message: 'Ya existe un jugador registrado con esta identificación' 
      }, 409);
    }

    // Crear ID único para el jugador
    const playerId = `player:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Datos del jugador
    const player = {
      id: playerId,
      name,
      email,
      phone,
      identification,
      category,
      birthDate: birthDate || null,
      status: 'active',
      registeredAt: new Date().toISOString()
    };

    // Guardar en KV store
    await kv.set(playerId, player);

    return c.json({ 
      success: true, 
      message: 'Jugador registrado exitosamente',
      player 
    });
  } catch (error) {
    console.log('Error registrando jugador:', error);
    return c.json({ success: false, message: 'Error registrando jugador' }, 500);
  }
});

// Obtener todos los jugadores (solo admin)
app.get('/make-server-ff64a58b/players', async (c) => {
  try {
    const players = await kv.getByPrefix('player:');
    return c.json({ success: true, players });
  } catch (error) {
    console.log('Error obteniendo jugadores:', error);
    return c.json({ success: false, message: 'Error obteniendo jugadores' }, 500);
  }
});

// Obtener un jugador específico
app.get('/make-server-ff64a58b/players/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const player = await kv.get(id);
    
    if (!player) {
      return c.json({ success: false, message: 'Jugador no encontrado' }, 404);
    }

    return c.json({ success: true, player });
  } catch (error) {
    console.log('Error obteniendo jugador:', error);
    return c.json({ success: false, message: 'Error obteniendo jugador' }, 500);
  }
});

// Actualizar jugador (solo admin)
app.put('/make-server-ff64a58b/players/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    // Verificar que el jugador existe
    const existingPlayer = await kv.get(id);
    if (!existingPlayer) {
      return c.json({ success: false, message: 'Jugador no encontrado' }, 404);
    }

    // Actualizar jugador
    const updatedPlayer = { 
      ...existingPlayer, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    await kv.set(id, updatedPlayer);

    return c.json({ 
      success: true, 
      message: 'Jugador actualizado exitosamente',
      player: updatedPlayer 
    });
  } catch (error) {
    console.log('Error actualizando jugador:', error);
    return c.json({ success: false, message: 'Error actualizando jugador' }, 500);
  }
});

// Eliminar jugador (solo admin)
app.delete('/make-server-ff64a58b/players/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Verificar que el jugador existe
    const player = await kv.get(id);
    if (!player) {
      return c.json({ success: false, message: 'Jugador no encontrado' }, 404);
    }

    // Eliminar jugador
    await kv.del(id);

    return c.json({ 
      success: true, 
      message: 'Jugador eliminado exitosamente' 
    });
  } catch (error) {
    console.log('Error eliminando jugador:', error);
    return c.json({ success: false, message: 'Error eliminando jugador' }, 500);
  }
});

// Health check
app.get('/make-server-ff64a58b/health', (c) => {
  return c.json({ status: 'ok', message: 'GOL ICA Server is running' });
});

Deno.serve(app.fetch);
