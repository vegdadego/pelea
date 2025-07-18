# Sistema de Privacidad - API Superhéroes

## Resumen
Este sistema implementa un control de acceso basado en roles donde cada usuario solo puede ver sus propias batallas y los detalles de personajes están limitados según el tipo de usuario.

## Tipos de Usuario

### 1. Usuario Normal
- **Acceso**: Solo a sus propias batallas
- **Personajes**: Información limitada (sin stats detallados ni multiplicadores de daño)
- **Batallas**: Solo información básica (sin detalles de equipos, personajes completos, etc.)

### 2. Administrador (vegdadego)
- **Acceso**: A todas las batallas y detalles completos
- **Personajes**: Información completa (stats, ataques, multiplicadores)
- **Batallas**: Información completa (equipos, personajes, logs, etc.)

## Endpoints y Filtros

### Endpoints Públicos (con autenticación)

#### GET `/api/battles`
- **Usuario Normal**: Solo sus batallas con información limitada
- **Admin**: Todas las batallas con información completa

#### GET `/api/battles/characters`
- **Usuario Normal**: Personajes con información limitada
- **Admin**: Todos los personajes con información completa

#### GET `/api/battles/:battleId/state`
- **Usuario Normal**: Estado filtrado (solo información necesaria para jugar)
- **Admin**: Estado completo

#### GET `/api/battles/characters/:id/attacks`
- **Usuario Normal**: Solo nombres y descripciones de ataques
- **Admin**: Ataques con baseDamage y multiplicadores

### Endpoints Especiales para Admin

#### GET `/api/admin/battles`
- **Solo Admin**: Todas las batallas con detalles completos
- **Incluye**: Equipos, personajes, logs, stats completos

#### GET `/api/admin/characters`
- **Solo Admin**: Todos los personajes con detalles completos
- **Incluye**: Stats completos, ataques con multiplicadores

## Filtros Implementados

### Filtro de Personajes (`filterCharactersForUser`)
```javascript
// Usuario Normal ve:
{
  id, nombre, alias, tipo, ciudad, equipo,
  stats: { health, maxHealth, attack, defense, speed },
  attacks: [{ name, description }] // Sin baseDamage ni damage
}

// Admin ve:
{
  // Todo el objeto completo con baseDamage y damage
}
```

### Filtro de Batallas (`filterBattlesForUser`)
```javascript
// Usuario Normal ve:
{
  id, type, isFinished, winner, startTime, endTime, currentRound
  // Sin detalles de equipos, personajes, etc.
}

// Admin ve:
{
  // Todo el objeto completo
}
```

### Filtro de Estado de Batalla (`filterBattleStateForUser`)
```javascript
// Usuario Normal ve:
{
  id, type, isFinished, winner, currentTurn, currentTeamTurn, remainingActions,
  characterStates: [{ id, alias, currentHealth, maxHealth, isAlive, teamId }]
  // Sin stats completos ni ataques
}

// Admin ve:
{
  // Todo el estado completo
}
```

## Seguridad

### Middleware de Autenticación
- Todos los endpoints de batallas requieren autenticación
- Verificación de token JWT en cada request

### Verificación de Propiedad
- Usuarios normales solo pueden acceder a sus propias batallas
- Admin puede acceder a todas las batallas

### Filtrado de Datos
- Los datos sensibles (multiplicadores, stats completos) están ocultos para usuarios normales
- Solo información necesaria para jugar es visible

## Ejemplo de Uso

### Usuario Normal
```bash
# Obtener personajes (información limitada)
GET /api/battles/characters
Authorization: Bearer <token>

# Obtener sus batallas (información limitada)
GET /api/battles
Authorization: Bearer <token>
```

### Admin (vegdadego)
```bash
# Obtener todos los personajes (información completa)
GET /api/admin/characters
Authorization: Bearer <admin_token>

# Obtener todas las batallas (información completa)
GET /api/admin/battles
Authorization: Bearer <admin_token>
```

## Ventajas del Sistema

1. **Privacidad**: Cada usuario solo ve sus propias batallas
2. **Seguridad**: Información sensible oculta para usuarios normales
3. **Flexibilidad**: Admin tiene acceso completo para monitoreo
4. **Experiencia de Usuario**: Usuarios normales ven solo lo necesario para jugar
5. **Escalabilidad**: Fácil agregar nuevos roles o filtros

## Configuración

El sistema detecta automáticamente si un usuario es admin verificando si su username es "vegdadego":

```javascript
export function isAdmin(user) {
    return user && user.user === 'vegdadego';
}
```

Para cambiar el usuario admin, modificar esta función en `middleware/authMiddleware.js`. 