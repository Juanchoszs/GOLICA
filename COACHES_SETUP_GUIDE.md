# Configuración de Coaches y Políticas RLS

## Pasos para habilitar el acceso de coaches al módulo de planificaciones

### 1. Ejecutar scripts SQL en Supabase

Ve a tu panel de Supabase y ejecuta los siguientes scripts en orden:

#### Primero: Crear tabla de coaches
```sql
-- Copiar el contenido de /Users/macbookpro/Desktop/GOLICA/supabase/coaches_setup.sql
```

#### Segundo: Actualizar políticas RLS
```sql
-- Copiar el contenido de /Users/macbookpro/Desktop/GOLICA/supabase/planning_rls_policies.sql
```

### 2. Credenciales de prueba

Después de ejecutar los scripts, puedes usar estas credenciales para probar:

**Coaches:**
- **Carlos Pérez**: Username: `carlos.coach` / Password: `Coach2024!`
- **María Rodríguez**: Username: `maria.coach` / Password: `Coach2024!`
- **Juan García**: Username: `juan.coach` / Password: `Coach2024!`

**Administradores:**
- **Maicol**: Username: `maicol.admin` / Password: `Maicol2026!`
- **Carolina**: Username: `carolina.admin` / Password: `Carolina2026!`

### 3. Permisos configurados

**Coaches pueden:**
✅ Crear planificaciones propias
✅ Ver solo sus propias planificaciones
✅ Editar solo sus propias planificaciones
✅ Eliminar solo sus propias planificaciones

**Administradores pueden:**
✅ Ver todas las planificaciones de todos los coaches
✅ Editar cualquier planificación
✅ Eliminar cualquier planificación
✅ Crear planificaciones para cualquier coach

### 4. Navegación

- **Panel de Coaches**: Acceso mediante el botón de login → seleccionar coach
- **Panel de Admin**: Acceso mediante el botón de login → seleccionar admin
- **Módulo de Planificaciones**: Aparece en ambos paneles como "Planificaciones"

### 5. Solución de problemas

Si los coaches no pueden ver el módulo:
1. Verifica que hayas ejecutado ambos scripts SQL
2. Asegúrate de que el coach esté usando sus credenciales correctas
3. Revisa la consola del navegador para errores
4. Verifica que el user.id se esté pasando correctamente al componente

¡Listo! Los coaches ahora pueden acceder al módulo de planificaciones.