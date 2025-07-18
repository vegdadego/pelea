# Permisos de Usuarios - API Superhéroes

## Resumen de Permisos

### 🔓 **Endpoints Públicos (Sin Autenticación)**
- Ninguno

### 🔐 **Endpoints con Autenticación (Todos los Usuarios)**
- `GET /api/equipos` - Ver **solo los equipos propios** (admin ve todos)
- `GET /api/equipos/:id` - Ver equipo propio por ID (admin ve todos)
- `POST /api/equipos` - Crear equipos (asignados al usuario autenticado)
- `PUT /api/equipos/:id` - Modificar equipo propio
- `DELETE /api/equipos/:id` - Eliminar equipo propio
- `GET /api/battles` - Ver batallas del usuario
- `GET /api/battles/characters` - Ver personajes para batalla
- `GET /api/battles/:battleId/state` - Ver estado de batalla
- `GET /api/battles/characters/:id/attacks` - Ver ataques de personaje
- `POST /api/battles/1v1` - Crear batalla 1v1
- `POST /api/battles/team-vs-team` - Crear batalla 3v3
- `POST /api/battles/:battleId/action` - Ejecutar acción en batalla

### 👑 **Endpoints Solo Administradores (vegdadego)**
- `GET /api/personajes` - Ver todos los personajes
- `GET /api/personajes/:id` - Ver un personaje específico
- `GET /api/personajes/tipo/:tipo` - Ver personajes por tipo
- `POST /api/personajes` - Crear personajes
- `PUT /api/personajes/:id` - Modificar personajes
- `DELETE /api/personajes/:id` - Eliminar personajes
- `GET /api/equipos` - Ver todos los equipos
- `GET /api/equipos/:id` - Ver cualquier equipo
- `PUT /api/equipos/:id` - Modificar cualquier equipo
- `DELETE /api/equipos/:id` - Eliminar cualquier equipo
- `GET /api/admin/battles` - Ver todas las batallas (admin)
- `GET /api/admin/characters` - Ver todos los personajes (admin)

## Matriz de Permisos

| Endpoint | Usuario Normal | Admin (vegdadego) | Descripción |
|----------|----------------|-------------------|-------------|
| **Personajes** |
| `GET /api/personajes` | ❌ | ✅ | Ver personajes |
| `GET /api/personajes/:id` | ❌ | ✅ | Ver personaje específico |
| `GET /api/personajes/tipo/:tipo` | ❌ | ✅ | Ver personajes por tipo |
| `POST /api/personajes` | ❌ | ✅ | Crear personaje |
| `PUT /api/personajes/:id` | ❌ | ✅ | Modificar personaje |
| `DELETE /api/personajes/:id` | ❌ | ✅ | Eliminar personaje |
| **Equipos** |
| `GET /api/equipos` | ✅ (solo propios) | ✅ (todos) | Ver equipos |
| `GET /api/equipos/:id` | ✅ (solo propios) | ✅ (todos) | Ver equipo específico |
| `POST /api/equipos` | ✅ | ✅ | Crear equipo |
| `PUT /api/equipos/:id` | ✅ (solo propios) | ✅ (todos) | Modificar equipo |
| `DELETE /api/equipos/:id` | ✅ (solo propios) | ✅ (todos) | Eliminar equipo |
| **Batallas** |
| `GET /api/battles` | ✅ (solo propias) | ✅ (todas) | Ver batallas |
| `POST /api/battles/*` | ✅ | ✅ | Crear batallas |
| `POST /api/battles/:id/action` | ✅ | ✅ | Ejecutar acciones |
| **Admin Especial** |
| `GET /api/admin/*` | ❌ | ✅ | Endpoints especiales admin |

## Experiencia de Usuario

### 👤 **Usuario Normal**
- ✅ Puede ver, crear, modificar y eliminar **solo sus propios equipos**
- ✅ Puede crear y participar en batallas
- ✅ Solo ve sus propias batallas
- ❌ No puede ver, crear, modificar o eliminar personajes
- ❌ No puede ver equipos de otros usuarios
- ❌ No puede ver detalles completos de personajes (stats, multiplicadores)

### 👑 **Administrador (vegdadego)**
- ✅ Acceso completo a todas las funcionalidades
- ✅ Puede crear, modificar y eliminar personajes
- ✅ Puede ver, modificar y eliminar **todos los equipos**
- ✅ Puede ver todas las batallas de todos los usuarios
- ✅ Ve información completa de personajes (stats, multiplicadores)
- ✅ Endpoints especiales de administración

## Swagger y Documentación

### 📚 **Swagger Funciona para Todos**
- ✅ Todos los usuarios pueden acceder a `/api-docs`
- ✅ La documentación muestra todos los endpoints disponibles
- ✅ Los endpoints protegidos muestran el ícono de autenticación
- ✅ Los endpoints de admin están claramente marcados

### 🔍 **Cómo Usar Swagger**

1. **Acceder a la documentación**: `http://localhost:3001/api-docs`
2. **Autorizarse**: Hacer clic en el botón "Authorize" y agregar el token JWT
3. **Probar endpoints**: Los endpoints disponibles según el tipo de usuario

### 🚫 **Mensajes de Error Claros**
- **401 Unauthorized**: Token no válido o expirado
- **403 Forbidden**: Usuario no tiene permisos para la acción
- **404 Not Found**: Recurso no encontrado

## Ejemplos de Uso

### Usuario Normal Listando Equipos
```bash
GET /api/equipos
Authorization: Bearer <user_token>

# Respuesta: Solo los equipos creados por este usuario
```

### Usuario Normal Intentando Ver Equipo de Otro Usuario
```bash
GET /api/equipos/2
Authorization: Bearer <user_token>

# Respuesta: 403 Forbidden
# "Acceso denegado. Solo puedes ver tus propios equipos."
```

### Admin Listando Todos los Equipos
```bash
GET /api/equipos
Authorization: Bearer <admin_token>

# Respuesta: Lista de todos los equipos de todos los usuarios
```

## Ventajas del Sistema

1. **Privacidad**: Cada usuario solo ve y gestiona sus propios equipos
2. **Seguridad**: Los equipos y personajes están protegidos contra modificaciones no autorizadas
3. **Flexibilidad**: Los usuarios pueden crear sus propios equipos y batallas
4. **Escalabilidad**: Fácil agregar nuevos roles o permisos
5. **Claridad**: Mensajes de error claros y específicos 