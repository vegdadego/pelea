# Sistema de Múltiples Ataques por Turno

## Descripción General

Se ha implementado un nuevo sistema que permite que todos los personajes vivos de un equipo puedan atacar durante su turno, en lugar de limitarse a un solo ataque por turno.

## Cambios Principales

### 🔄 **Sistema de Turnos Mejorado**

**Antes:**
- 1 ataque por turno
- Cambio automático de turno después de cada ataque
- Turnos muy cortos

**Ahora:**
- 3 acciones por turno (una por cada personaje del equipo)
- Cambio de turno solo cuando se agotan las acciones
- Turnos más estratégicos

### 📊 **Nuevo Campo: `remainingActions`**

Se agregó un nuevo campo al modelo de batalla que rastrea las acciones restantes del equipo actual:

```javascript
remainingActions: { type: Number, default: 3 }
```

### 🎯 **Lógica de Acciones**

1. **Inicio de Batalla**: Cada equipo tiene 3 acciones
2. **Por Acción**: Se reduce `remainingActions` en 1
3. **Cambio de Turno**: Solo cuando `remainingActions` llega a 0
4. **Cálculo Dinámico**: Las acciones del siguiente equipo se basan en personajes vivos

## Nuevos Endpoints

### 1. `GET /api/battles/{battleId}/available-actions`

Obtiene información sobre las acciones disponibles para el equipo actual.

**Response:**
```json
{
  "message": "Acciones disponibles obtenidas exitosamente",
  "currentTeam": 1,
  "remainingActions": 3,
  "availableAttackers": [
    {
      "id": 1,
      "alias": "Spider-Man",
      "currentHealth": 100,
      "isAlive": true
    },
    {
      "id": 2,
      "alias": "Iron Man",
      "currentHealth": 100,
      "isAlive": true
    },
    {
      "id": 3,
      "alias": "Thor",
      "currentHealth": 100,
      "isAlive": true
    }
  ],
  "availableTargets": [
    {
      "id": 4,
      "alias": "Superman",
      "currentHealth": 100,
      "isAlive": true
    },
    {
      "id": 5,
      "alias": "Batman",
      "currentHealth": 100,
      "isAlive": true
    },
    {
      "id": 6,
      "alias": "Wonder Woman",
      "currentHealth": 100,
      "isAlive": true
    }
  ]
}
```

## Flujo de Juego Mejorado

### Turno del Equipo 1 (Los Vengadores)
1. **Acción 1**: Spider-Man ataca a Superman
2. **Acción 2**: Iron Man ataca a Batman
3. **Acción 3**: Thor ataca a Wonder Woman
4. **Cambio de Turno**: Ahora es el turno del Equipo 2

### Turno del Equipo 2 (La Liga de la Justicia)
1. **Acción 1**: Superman ataca a Spider-Man
2. **Acción 2**: Batman ataca a Iron Man
3. **Acción 3**: Wonder Woman ataca a Thor
4. **Cambio de Turno**: Vuelve al Equipo 1

## Validaciones Actualizadas

### ✅ **Nuevas Validaciones**

1. **Acciones Restantes**: Verifica que el equipo tenga acciones disponibles
2. **Personajes Vivos**: Solo personajes vivos pueden atacar
3. **Objetivos Válidos**: Solo personajes vivos del equipo contrario

### ❌ **Errores Nuevos**

- `"El equipo ya no tiene acciones restantes en este turno"`
- `"El atacante está derrotado y no puede atacar"`
- `"El objetivo ya está derrotado"`

## Cálculo Dinámico de Acciones

### **Fórmula:**
```javascript
const nextTeamAliveCount = battle.currentCharacterStates.filter(c => 
    c.teamId === nextTeamId && c.isAlive
).length;
battle.remainingActions = Math.max(1, nextTeamAliveCount);
```

### **Ejemplos:**

1. **Equipo Completo**: 3 personajes vivos = 3 acciones
2. **Equipo Reducido**: 2 personajes vivos = 2 acciones
3. **Último Sobreviviente**: 1 personaje vivo = 1 acción
4. **Equipo Derrotado**: 0 personajes vivos = Batalla termina

## Ventajas del Nuevo Sistema

### 🎮 **Mejor Experiencia de Juego**
- Turnos más largos y estratégicos
- Más opciones tácticas por turno
- Mejor balance entre equipos

### ⚔️ **Más Acción**
- 3 ataques por turno en lugar de 1
- Más interacción con el sistema
- Progresión más rápida de la batalla

### 🧠 **Estrategia Mejorada**
- Coordinación entre personajes del equipo
- Decisiones tácticas más complejas
- Mejor uso de ataques especiales

## Ejemplo de Uso

### **Crear Batalla:**
```bash
POST /api/battles/team-vs-team
{
  "equipo1Id": 1,
  "equipo2Id": 2
}
```

### **Ver Acciones Disponibles:**
```bash
GET /api/battles/{battleId}/available-actions
```

### **Ejecutar Acciones:**
```bash
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

# Acción 3 del Equipo 1
POST /api/battles/action
{
  "battleId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "attackerId": 3,
  "targetId": 6,
  "attackType": "especial"
}
```

## Script de Prueba Actualizado

El script `test_battle_system.js` ha sido actualizado para demostrar:

1. **Creación de batalla** con nuevo sistema
2. **Visualización de acciones disponibles**
3. **Ejecución de múltiples ataques por turno**
4. **Cambio automático de turnos**
5. **Estado actualizado con acciones restantes**

### **Ejecutar Demo:**
```bash
node test_battle_system.js
```

## Compatibilidad

### ✅ **Compatibilidad Hacia Atrás**
- Las batallas existentes funcionan normalmente
- Los endpoints existentes mantienen su funcionalidad
- No se requieren cambios en el frontend existente

### 🔄 **Migración Automática**
- Las nuevas batallas usan el sistema mejorado
- Las batallas existentes mantienen su comportamiento original
- No se requiere migración de datos

## Documentación Swagger

La documentación de Swagger ha sido actualizada para incluir:

- ✅ Nuevo campo `remainingActions` en esquemas
- ✅ Nuevo endpoint `/available-actions`
- ✅ Ejemplos actualizados con acciones restantes
- ✅ Códigos de error para acciones agotadas

## Próximas Mejoras

### 🚀 **Funcionalidades Futuras**
- Ataques combinados entre personajes
- Habilidades especiales de equipo
- Sistema de iniciativa basado en velocidad
- Efectos de estado (veneno, confusión, etc.)

### 🎯 **Optimizaciones**
- Caché de acciones disponibles
- Validaciones más eficientes
- Mejor manejo de concurrencia 