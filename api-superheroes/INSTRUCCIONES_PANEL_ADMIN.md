# 🏰 Panel de Administración - Instrucciones de Uso

## 📋 Descripción General

El Panel de Administración es una interfaz web que permite a los administradores gestionar todos los aspectos del sistema de batallas Digimon. Solo el usuario `vegdadego` puede acceder a esta interfaz.

## 🔑 Acceso al Panel

### Credenciales de Administrador
- **Usuario:** `vegdadego`
- **Contraseña:** `admin123`

### Pasos para Acceder

1. **Iniciar el servidor:**
   ```bash
   cd api-superheroes
   node app.js
   ```

2. **Crear el usuario admin (si no existe):**
   ```bash
   node create_admin_user.js
   ```

3. **Acceder a la interfaz principal:**
   - Abrir navegador en: `http://localhost:3001/game`
   - Iniciar sesión con las credenciales de admin
   - Hacer clic en "👑 Panel de Administración"

4. **Acceso directo al panel:**
   - URL: `http://localhost:3001/admin`
   - Requiere estar autenticado como admin

## 🎯 Funcionalidades del Panel

### 📊 Dashboard
- **Estadísticas en tiempo real:**
  - Total de personajes
  - Total de equipos
  - Batallas activas
  - Usuarios registrados

- **Acciones rápidas:**
  - Crear usuario admin
  - Vaciar todos los equipos
  - Ver estadísticas de personajes
  - Exportar datos
  - Ver logs del sistema

### 👥 Gestión de Personajes
- **Ver todos los personajes** con sus estadísticas
- **Filtrar por tipo** (héroe, villano)
- **Ver ataques** de cada personaje
- **Estadísticas detalladas** de daño y defensa

### 🛡️ Gestión de Equipos
- **Ver todos los equipos** creados por usuarios
- **Vaciar todos los equipos** (función admin)
- **Detalles de composición** de cada equipo
- **Estadísticas de equipos**

### ⚔️ Gestión de Batallas
- **Ver todas las batallas** del sistema
- **Detalles de batallas** activas y finalizadas
- **Estadísticas de victorias/derrotas**
- **Historial completo** de batallas

### 👤 Gestión de Usuarios
- **Lista de todos los usuarios** registrados
- **Información de usuarios** (sin contraseñas)
- **Crear nuevos usuarios** admin
- **Estadísticas de actividad**

### 🛠️ Herramientas de Administración
- **Gestión de base de datos:**
  - Backup de datos
  - Restaurar datos
  - Limpiar base de datos

- **Estadísticas y reportes:**
  - Generar reportes
  - Exportar estadísticas
  - Análisis de uso

- **Configuración del sistema:**
  - Configuración de batallas
  - Configuración del sistema
  - Parámetros de juego

- **Seguridad:**
  - Ver logs de seguridad
  - Gestionar permisos
  - Monitoreo de actividad

## 🔧 Scripts de Utilidad

### Crear Usuario Admin
```bash
node create_admin_user.js
```
- Crea o actualiza el usuario `vegdadego`
- Establece la contraseña `admin123`
- Muestra credenciales en consola

### Aumentar Daño de Personajes
```bash
node increase_damage.js
```
- Aumenta el daño de todos los personajes 2.5x
- Actualiza estadísticas de ataque
- Muestra resumen de cambios

### Vaciar Equipos
```bash
node clear_teams.js
```
- Elimina todos los equipos de la base de datos
- Función de limpieza masiva
- Muestra estadísticas de eliminación

## 🚨 Solución de Problemas

### Error de Autenticación
- **Problema:** "Acceso denegado" al entrar al panel
- **Solución:** 
  1. Verificar que el usuario `vegdadego` existe
  2. Ejecutar `node create_admin_user.js`
  3. Iniciar sesión con credenciales correctas

### Error de Conexión
- **Problema:** No se puede conectar al servidor
- **Solución:**
  1. Verificar que el servidor esté ejecutándose
  2. Comprobar puerto 3001
  3. Verificar archivo `.env`

### Error de Base de Datos
- **Problema:** Errores al cargar datos
- **Solución:**
  1. Verificar conexión a MongoDB
  2. Comprobar variables de entorno
  3. Revisar logs del servidor

## 📱 Características de la Interfaz

### 🎨 Diseño Responsivo
- **Adaptable** a diferentes tamaños de pantalla
- **Navegación intuitiva** con iconos
- **Colores temáticos** de Digimon

### ⚡ Funcionalidades Avanzadas
- **Carga dinámica** de datos
- **Actualizaciones en tiempo real**
- **Modales informativos**
- **Mensajes de estado**

### 🔒 Seguridad
- **Autenticación JWT** requerida
- **Verificación de permisos** admin
- **Protección de rutas** sensibles
- **Logs de actividad**

## 📞 Soporte

Para problemas técnicos o consultas sobre el panel de administración:

1. **Revisar logs** del servidor
2. **Verificar credenciales** de admin
3. **Comprobar conexión** a base de datos
4. **Ejecutar scripts** de utilidad según necesidad

---

**¡El Panel de Administración está listo para gestionar tu universo Digimon!** 🐉⚔️ 