# Panel de Administración - Digimon Battle

## 🎯 Descripción

El Panel de Administración es una interfaz gráfica especial que permite al usuario administrador (`vegdadego`) acceder a funcionalidades avanzadas del sistema de batallas Digimon.

## 🔐 Acceso

### Requisitos
- Usuario: `vegdadego`
- Contraseña: La contraseña configurada para el usuario admin
- Solo usuarios con rol de administrador pueden acceder

### Cómo Acceder
1. Inicia sesión en la interfaz principal con el usuario `vegdadego`
2. Una vez autenticado, aparecerá el botón **"👑 Panel de Administración"**
3. Haz clic en el botón para acceder al panel

## 🛠️ Funcionalidades

### 📊 Dashboard
- **Estadísticas en tiempo real:**
  - Total de personajes
  - Total de equipos
  - Batallas activas
  - Usuarios registrados

- **Acciones rápidas:**
  - Vaciar todos los equipos
  - Ver estadísticas de personajes
  - Exportar datos del sistema
  - Ver logs del sistema

### 👥 Gestión de Personajes
- **Ver todos los personajes** con sus estadísticas completas
- **Información detallada:**
  - Nombre y alias
  - Tipo (héroe/villano)
  - Ciudad y equipo
  - Estadísticas de combate
  - Ataques disponibles

### 🛡️ Gestión de Equipos
- **Ver todos los equipos** del sistema
- **Información de equipos:**
  - Nombre del equipo
  - Miembros del equipo
  - Estadísticas de cada miembro
- **Acciones administrativas:**
  - Vaciar todos los equipos (con confirmación)

### ⚔️ Gestión de Batallas
- **Ver todas las batallas** del sistema
- **Información de batallas:**
  - Estado (activa/finalizada)
  - Ganador (si aplica)
  - Detalles de la batalla
- **Funcionalidades:**
  - Crear batallas de prueba
  - Ver detalles completos

### 👤 Gestión de Usuarios
- **Ver todos los usuarios** registrados
- **Información de usuarios:**
  - Nombre de usuario
  - Nombre completo
  - Email (si disponible)
  - Rol (Admin/Usuario)

### 🔧 Herramientas de Administración

#### Base de Datos
- **Backup:** Crear copias de seguridad
- **Restaurar:** Restaurar desde backup
- **Limpiar BD:** Limpiar datos del sistema

#### Estadísticas
- **Generar reportes** del sistema
- **Exportar estadísticas** en diferentes formatos

#### Configuración
- **Configuración del sistema**
- **Configuración de batallas**

#### Seguridad
- **Ver logs de seguridad**
- **Gestionar permisos** de usuarios

## 🎨 Características de la Interfaz

### Diseño Responsivo
- Adaptable a diferentes tamaños de pantalla
- Navegación intuitiva
- Interfaz moderna y profesional

### Feedback Visual
- Mensajes de confirmación
- Indicadores de carga
- Estados de éxito/error
- Animaciones suaves

### Seguridad
- **Autenticación obligatoria**
- **Verificación de permisos** en cada acción
- **Confirmaciones** para acciones destructivas
- **Logs de actividad** (en desarrollo)

## 🔧 Endpoints de API Utilizados

### Autenticación
- `GET /api/usuarios/me` - Obtener usuario actual
- `GET /api/usuarios` - Obtener todos los usuarios (solo admin)

### Personajes
- `GET /api/personajes` - Obtener todos los personajes

### Equipos
- `GET /api/equipos` - Obtener todos los equipos
- `DELETE /api/equipos/clear` - Vaciar todos los equipos (solo admin)

### Batallas
- `GET /api/batallas` - Obtener todas las batallas (solo admin)

## 🚀 Instalación y Uso

### 1. Configuración Inicial
```bash
# Asegúrate de que el servidor esté corriendo
cd api-superheroes
npm start
```

### 2. Acceso al Panel
1. Abre el navegador en `http://localhost:3000/game-interface/index.html`
2. Inicia sesión con el usuario `vegdadego`
3. Haz clic en "👑 Panel de Administración"

### 3. Navegación
- Usa los botones de navegación en la parte superior
- Cada sección muestra información específica
- Las acciones administrativas requieren confirmación

## ⚠️ Consideraciones de Seguridad

### Acceso Restringido
- Solo el usuario `vegdadego` puede acceder
- Verificación de permisos en cada endpoint
- Tokens de autenticación requeridos

### Acciones Destructivas
- **Vaciar equipos:** Requiere confirmación explícita
- **Exportar datos:** Solo datos no sensibles
- **Logs de actividad:** Registro de todas las acciones

### Validaciones
- Verificación de permisos en el frontend y backend
- Validación de datos en todos los endpoints
- Manejo de errores robusto

## 🔄 Funcionalidades en Desarrollo

### Próximas Características
- [ ] Logs de actividad en tiempo real
- [ ] Estadísticas avanzadas de batallas
- [ ] Gestión de permisos de usuarios
- [ ] Configuración del sistema
- [ ] Backup automático de base de datos
- [ ] Notificaciones en tiempo real

### Mejoras Planificadas
- [ ] Dashboard con gráficos interactivos
- [ ] Exportación de datos en múltiples formatos
- [ ] Sistema de auditoría completo
- [ ] Gestión de roles y permisos
- [ ] Configuración avanzada del juego

## 🐛 Solución de Problemas

### Problemas Comunes

#### No aparece el botón de administración
- Verifica que estés usando el usuario `vegdadego`
- Revisa la consola del navegador para errores
- Asegúrate de que el token de autenticación sea válido

#### Error de permisos
- Verifica que el usuario tenga permisos de administrador
- Revisa que el token no haya expirado
- Intenta cerrar sesión y volver a iniciar

#### Error de conexión
- Verifica que el servidor esté corriendo
- Revisa la URL de la API en la configuración
- Verifica la conectividad de red

### Logs de Debug
- Abre las herramientas de desarrollador (F12)
- Revisa la consola para mensajes de error
- Verifica la pestaña Network para errores de API

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:
1. Revisa la documentación completa
2. Verifica los logs de error
3. Contacta al equipo de desarrollo

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024  
**Desarrollado para:** Sistema de Batallas Digimon 