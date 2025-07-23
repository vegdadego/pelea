# Documentación Swagger Actualizada

## Resumen de Actualizaciones

Se ha actualizado completamente la documentación de Swagger para incluir todos los nuevos endpoints y funcionalidades del sistema de batallas activas.

## Nuevos Esquemas Agregados

### 1. `CharacterState`
```yaml
CharacterState:
  type: object
  properties:
    id:
      type: integer
      description: ID del personaje
    nombre:
      type: string
      description: Nombre real del personaje
    alias:
      type: string
      description: Alias del personaje
    tipo:
      type: string
      description: Tipo de personaje (heroe/villano)
    currentHealth:
      type: integer
      description: Vida actual del personaje
    maxHealth:
      type: integer
      description: Vida máxima del personaje
    isAlive:
      type: boolean
      description: Si el personaje está vivo
    teamId:
      type: integer
      description: ID del equipo al que pertenece
```

### 2. `BattleAction`
```yaml
BattleAction:
  type: object
  required:
    - battleId
    - attackerId
    - targetId
    - attackType
  properties:
    battleId:
      type: string
      description: ID de la batalla activa
    attackerId:
      type: integer
      description: ID del personaje que ataca
    targetId:
      type: integer
      description: ID del personaje que recibe el ataque
    attackType:
      type: string
      enum: [normal, especial]
      description: Tipo de ataque a realizar
```

### 3. `AttackResult`
```yaml
AttackResult:
  type: object
  properties:
    attackName:
      type: string
      description: Nombre del ataque
    attackDescription:
      type: string
      description: Descripción del ataque
    baseDamage:
      type: integer
      description: Daño base calculado
    finalDamage:
      type: integer
      description: Daño final antes de defensa
    actualDamage:
      type: integer
      description: Daño real infligido
    critical:
      type: boolean
      description: Si fue un golpe crítico
    miss:
      type: boolean
      description: Si el ataque falló
```

### 4. `BattleState`
```yaml
BattleState:
  type: object
  properties:
    currentTurn:
      type: integer
      description: Número de turno actual
    currentTeamTurn:
      type: integer
      description: Equipo que tiene el turno (1 o 2)
    characterStates:
      type: array
      items:
        $ref: '#/components/schemas/CharacterState'
    isFinished:
      type: boolean
      description: Si la batalla ha terminado
    winner:
      type: string
      description: Ganador de la batalla
    loser:
      type: string
      description: Perdedor de la batalla
```

### 5. `BattleActionResponse`
```yaml
BattleActionResponse:
  type: object
  properties:
    message:
      type: string
      description: Mensaje de confirmación
    attackResult:
      $ref: '#/components/schemas/AttackResult'
    battleState:
      $ref: '#/components/schemas/BattleState'
    attackLog:
      $ref: '#/components/schemas/Attack'
```

## Esquemas Actualizados

### 1. `Attack` (Actualizado)
- Agregado campo `attackType` con enum `[normal, especial]`
- Agregado campo `isFinalAttack` (boolean)
- Agregado campo `defenderUsedShield` (boolean)

### 2. `Battle` (Actualizado)
- Cambiado tipo de `id` de integer a string (MongoDB ObjectId)
- Agregados campos para estado en tiempo real:
  - `currentRound`: Número del round actual
  - `currentTurn`: Número del turno actual
  - `currentTeamTurn`: Equipo que tiene el turno (1 o 2)
  - `currentCharacterStates`: Estado actual de todos los personajes
  - `battleStatus`: Estado de la batalla `[active, finished, paused]`
- Agregados campos para ataques especiales:
  - `userFinalAttackUsed`
  - `userShieldUsed`
  - `opponentFinalAttackUsed`
  - `opponentShieldUsed`

## Endpoints Actualizados

### 1. `POST /api/battles/team-vs-team`
- **Actualizado**: Ahora crea batallas sin simular automáticamente
- **Agregado**: Autenticación JWT
- **Agregado**: Ejemplos de request/response
- **Agregado**: Códigos de error detallados (400, 401, 500)
- **Agregado**: Schema de respuesta completo con estado inicial

### 2. `POST /api/battles/action` (NUEVO)
- **Agregado**: Endpoint para ejecutar acciones de pelea
- **Autenticación**: JWT Bearer Token requerido
- **Request**: Usa schema `BattleAction`
- **Response**: Usa schema `BattleActionResponse`
- **Errores**: 400, 401, 404, 500 con ejemplos

### 3. `GET /api/battles/{battleId}/state` (NUEVO)
- **Agregado**: Endpoint para obtener estado de batalla
- **Autenticación**: JWT Bearer Token requerido
- **Response**: Schema `Battle` completo
- **Errores**: 401, 404, 500 con ejemplos

## Endpoints Existentes Mejorados

### 1. `GET /api/battles`
- Agregada autenticación JWT
- Agregados códigos de error 401, 500

### 2. `GET /api/battles/characters`
- Agregada autenticación JWT
- Agregado schema de respuesta detallado
- Agregados códigos de error 401, 500

### 3. `POST /api/battles/1v1`
- Agregada autenticación JWT
- Agregados ejemplos en request
- Agregado schema de respuesta completo
- Agregados códigos de error 401, 500

### 4. `GET /api/battles/characters/{id}/attacks`
- Agregada autenticación JWT
- Agregado schema de respuesta detallado
- Agregados ejemplos de ataques especiales
- Agregados códigos de error 401, 404, 500

### 5. `POST /api/battles/{id}/round`
- Agregada autenticación JWT
- Cambiado tipo de ID a string
- Agregado requestBody con opciones de ataque final y escudo
- Agregados códigos de error 401, 404, 500

### 6. `POST /api/battles/{id}/simulate`
- Agregada autenticación JWT
- Cambiado tipo de ID a string
- Agregados códigos de error 401, 404, 500

## Características de la Documentación

### ✅ Autenticación
- Todos los endpoints requieren JWT Bearer Token
- Configuración de seguridad consistente
- Códigos de error 401 para no autorizado

### ✅ Ejemplos
- Ejemplos de request para todos los endpoints
- Ejemplos de response con datos realistas
- Ejemplos de códigos de error

### ✅ Esquemas Completos
- Referencias a esquemas reutilizables
- Validaciones con enums
- Descripciones detalladas

### ✅ Códigos de Error
- 400: Datos inválidos
- 401: No autorizado
- 404: Recurso no encontrado
- 500: Error del servidor

### ✅ Tipos de Datos
- IDs de batalla como strings (MongoDB ObjectId)
- IDs de personajes como integers
- Enums para tipos de ataque y estado de batalla

## Cómo Ver la Documentación

1. **Iniciar el servidor:**
   ```bash
   node app.js
   ```

2. **Acceder a Swagger UI:**
   ```
   http://localhost:3001/api-docs
   ```

3. **Autenticación:**
   - Hacer clic en el botón "Authorize" (🔒)
   - Ingresar el token JWT en formato: `Bearer <token>`
   - Hacer clic en "Authorize"

4. **Probar Endpoints:**
   - Usar "Try it out" en cualquier endpoint
   - Los ejemplos se cargan automáticamente
   - Las respuestas muestran esquemas completos

## Beneficios de la Actualización

- **Documentación Completa**: Todos los endpoints documentados
- **Autenticación Clara**: Requisitos de JWT especificados
- **Ejemplos Prácticos**: Datos realistas para testing
- **Esquemas Reutilizables**: Referencias consistentes
- **Códigos de Error**: Manejo de errores documentado
- **Tipos Correctos**: IDs y enums apropiados
- **Interfaz Intuitiva**: Swagger UI fácil de usar 