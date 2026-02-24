@echo off
echo 🚀 Preparando despliegue de funciones de Supabase...

:: Extraer el ID buscando entre el // y el primer punto de la URL en el .env
for /f "tokens=2 delims=./" %%a in ('findstr VITE_SUPABASE_URL .env') do set PROJECT_REF=%%a

if "%PROJECT_REF%"=="" (
    echo ❌ No se pudo encontrar el PROJECT_REF automáticamente.
    set /p PROJECT_REF="Por favor, ingresa tu Project Ref (ej: gzpkrgksuxkhsfzbjapr): "
)

echo 📡 Desplegando en el proyecto: %PROJECT_REF%

:: Ejecutar despliegue
npx supabase functions deploy admin-create-user --project-ref %PROJECT_REF%

if %errorlevel% neq 0 (
    echo.
    echo ❌ El despliegue falló. 
    echo Asegúrate de:
    echo 1. Haber iniciado sesión con 'npx supabase login'
    echo 2. Tener permisos de administrador en el proyecto de Supabase.
) else (
    echo.
    echo ✅ ¡Función desplegada con éxito!
    echo 🔐 Ejecuta esto ahora para configurar la seguridad (reemplaza tu_key):
    echo npx supabase secrets set SERVICE_ROLE_KEY=tu_service_role_key --project-ref %PROJECT_REF%
)

pause