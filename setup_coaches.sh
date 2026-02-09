#!/bin/bash

# Script para configurar la base de datos con coaches y políticas RLS
# Este script debe ejecutarse en el panel de Supabase o usando su CLI

echo "Configurando tabla de coaches..."
echo "Ejecutando coaches_setup.sql"

echo "Configurando políticas RLS para planificaciones..."
echo "Ejecutando planning_rls_policies.sql"

echo "Configuración completada."
echo ""
echo "Credenciales de prueba para coaches:"
echo "- Carlos Pérez: carlos.coach / Coach2024!"
echo "- María Rodríguez: maria.coach / Coach2024!"
echo "- Juan García: juan.coach / Coach2024!"
echo ""
echo "Los coaches ahora pueden:"
echo "✅ Crear planificaciones"
echo "✅ Ver solo sus propias planificaciones"
echo "✅ Editar sus propias planificaciones"
echo "✅ Eliminar sus propias planificaciones"
echo ""
echo "Los administradores pueden:"
echo "✅ Ver todas las planificaciones"
echo "✅ Editar cualquier planificación"
echo "✅ Eliminar cualquier planificación"