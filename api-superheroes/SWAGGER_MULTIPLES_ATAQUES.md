# Swagger Actualizado - Sistema de Múltiples Ataques

## Resumen de Actualizaciones

Se ha actualizado completamente la documentación de Swagger para incluir el nuevo sistema de múltiples ataques por turno y todas sus funcionalidades.

## Nuevos Esquemas Agregados

### 1. `AvailableActions`
```yaml
AvailableActions:
  type: object
  properties:
    message:
      type: string
      description: Mensaje de confirmación
    currentTeam:
      type: integer
      description: Equipo que tiene el turno actual (1 o 2)
    remainingActions:
      type: integer
      description: Acciones restantes del equipo actual
    availableAttackers:
      type: array
      description: Personajes del equipo actual que pueden atacar
      items:
        type: object
        properties:
          id:
            type: integer
            description: ID del personaje
          alias:
            type: string
            description: Alias del personaje
          currentHealth:
            type: integer
            description: Vida actual del personaje
          isAlive:
            type: boolean
            description: Si el personaje está vivo
    availableTargets:
      type: array
      description: Personajes del equipo contrario que pueden ser atacados
      items:
        type: object
        properties:
          id:
            type: integer
            description: ID del personaje
          alias:
            type: string
            description: Alias del personaje
          currentHealth:
            type: integer
            description: Vida actual del personaje
          isAlive:
            type: boolean
            description: Si el personaje está vivo
```

## Esquemas Actualizados

### 1. `BattleState` (Actualizado)
- **Agregado**: Campo `remainingActions` para mostrar acciones restantes del equipo actual

### 2. `Battle` (Actualizado)
- **Agregado**: Campo `remainingActions` en el esquema principal de batalla

## Endpoints Actualizados

### 1. `POST /api/battles/team-vs-team`
- **Título actualizado**: "Crea una nueva batalla entre equipos (Sistema de múltiples ataques por turno)"
- **Agregada descripción detallada** del sistema de múltiples ataques
- **Agregado campo `remainingActions`** en la respuesta
- **Características del sistema** documentadas

### 2. `POST /api/battles/action`
- **Título actualizado**: "Ejecuta una acción de pelea en una batalla existente (Sistema de múltiples ataques por turno)"
- **Agregada descripción detallada** del sistema de turnos
- **Agregados múltiples ejemplos de errores**:
  - Turno incorrecto
  - Acciones agotadas
  - Atacante derrotado
  - Objetivo derrotado
- **Sistema de turnos** explicado en detalle

### 3. `GET /api/battles/{battleId}/state`
- **Título actualizado**: "Obtiene el estado actual de una batalla (incluye acciones restantes)"
- **Agregada descripción detallada** de la información incluida
- **Campo `remainingActions`** incluido en la respuesta

## Mejoras en la Documentación

### 📝 **Descripciones Detalladas**
- Explicación del sistema de múltiples ataques
- Características y beneficios del nuevo sistema
- Uso recomendado de cada endpoint

### 🎯 **Ejemplos de Errores**
- Múltiples ejemplos de códigos de error
- Explicación de cada tipo de error
- Casos de uso específicos

### 🔄 **Sistema de Turnos Documentado**
- Explicación de cómo funcionan los turnos
- Cálculo de acciones restantes
- Cambio automático de turnos

### 📊 **Información de Estado**
- Acciones restantes incluidas en todas las respuestas
- Estado de personajes más detallado
- Información de equipos y turnos

## Códigos de Error Actualizados

### 400 - Errores de Validación
```yaml
error:
  type: string
  examples:
    - value: "No es el turno del equipo del atacante"
      summary: Turno incorrecto
    - value: "El equipo ya no tiene acciones restantes en este turno"
      summary: Acciones agotadas
    - value: "El atacante está derrotado y no puede atacar"
      summary: Atacante derrotado
    - value: "El objetivo ya está derrotado"
      summary: Objetivo derrotado
```

## Ejemplos de Uso Actualizados

### Crear Batalla con Nuevo Sistema
```json
POST /api/battles/team-vs-team
{
  "equipo1Id": 1,
  "equipo2Id": 2
}

Response:
{
  "message": "Batalla entre equipos creada exitosamente",
  "battleId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "equipo1": { ... },
  "equipo2": { ... },
  "currentCharacterStates": [ ... ],
  "currentTurn": 1,
  "currentTeamTurn": 1,
  "remainingActions": 3,
  "battleStatus": "active"
}
```

### Ejecutar Múltiples Acciones
```json
# Acción 1 del Equipo 1
POST /api/battles/action
{
  "battleId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "attackerId": 1,
  "targetId": 4,
  "attackType": "especial"
}

# Acción 2 del Equipo 1
POST /api/battles/action
{
  "battleId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "attackerId": 2,
  "targetId": 5,
  "attackType": "especial"
}

# Acción 3 del Equipo 1 (cambia turno automáticamente)
POST /api/battles/action
{
  "battleId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "attackerId": 3,
  "targetId": 6,
  "attackType": "especial"
}
```

## Beneficios de la Actualización

### ✅ **Documentación Completa**
- Todos los nuevos campos documentados
- Esquemas actualizados con referencias
- Ejemplos prácticos incluidos

### 🎯 **Mejor Experiencia de Usuario**
- Descripciones claras del sistema
- Ejemplos de errores específicos
- Guías de uso recomendado

### 🔧 **Desarrollo Facilitado**
- Referencias a esquemas reutilizables
- Validaciones documentadas
- Códigos de error explicados

### 📚 **Aprendizaje Mejorado**
- Sistema de turnos explicado
- Flujo de juego documentado
- Casos de uso específicos

## Cómo Ver la Documentación Actualizada

1. **Iniciar el servidor:**
   ```bash
   node app.js
   ```

2. **Acceder a Swagger UI:**
   ```
   http://localhost:3001/api-docs
   ```

3. **Explorar los cambios:**
   - Nuevo endpoint `/available-actions`
   - Esquemas actualizados con `remainingActions`
   - Descripciones detalladas del sistema
   - Ejemplos de errores mejorados

## Compatibilidad

### ✅ **Compatibilidad Hacia Atrás**
- Los esquemas existentes mantienen su estructura
- Los endpoints existentes funcionan normalmente
- No se requieren cambios en implementaciones anteriores

### 🔄 **Mejoras Incrementales**
- Nuevos campos opcionales
- Endpoints adicionales
- Documentación mejorada
- No hay cambios breaking

La documentación de Swagger ahora refleja completamente el nuevo sistema de múltiples ataques por turno, proporcionando una guía completa para desarrolladores y usuarios del API. 