# Solución: Inicialización de Personajes en Nuevas Batallas

## Problema
Los personajes estaban iniciando nuevas batallas con 0 HP en lugar de su vida completa. Esto ocurría porque había una inconsistencia en los nombres de campos entre el backend y el frontend.

## Causa Raíz
1. **Inconsistencia de campos**: El backend usaba `hp` y `maxHp` para inicializar personajes, pero el frontend esperaba `currentHealth` y `maxHealth`.
2. **Falta de `currentCharacterStates`**: Las batallas 1v1 no estaban creando el array `currentCharacterStates` que es necesario para el seguimiento del estado de los personajes.

## Solución Implementada

### 1. Estandarización de Campos
**Archivo**: `services/battleService.js`

**Antes**:
```javascript
const getCharState = (char) => ({
    id: char.id,
    nombre: char.nombre,
    alias: char.alias,
    tipo: char.tipo,
    hp: Number(char.stats.health) || 100,
    maxHp: Number(char.stats.maxHealth) || 100,
    ataque_normal: (char.attacks && char.attacks[0] && Number(char.attacks[0].baseDamage)) || 10,
    ataque_especial: (char.attacks && char.attacks[1] && Number(char.attacks[1].baseDamage)) || 20,
    escudo: Number(char.stats.defense) || 20,
    escudoUsado: false
});
```

**Después**:
```javascript
const getCharState = (char) => ({
    id: char.id,
    nombre: char.nombre,
    alias: char.alias,
    tipo: char.tipo,
    currentHealth: Number(char.stats.health) || 100,
    maxHealth: Number(char.stats.maxHealth) || 100,
    attack: Number(char.stats.attack) || 10,
    defense: Number(char.stats.defense) || 20,
    specialAttack: Number(char.stats.specialAttack) || Number(char.stats.attack) || 10,
    specialDefense: Number(char.stats.specialDefense) || Number(char.stats.defense) || 20,
    isAlive: true,
    attacks: char.attacks || []
});
```

### 2. Agregar `currentCharacterStates` a Batallas 1v1
**Archivo**: `services/battleService.js`

**Función**: `createBattle()`

**Cambio**:
```javascript
// Crear estados iniciales de los personajes
const characterStates = [
    getCharState(char1),
    getCharState(char2)
];

const battleDoc = new Battle({
    userId,
    type: '1v1',
    char1: getCharState(char1),
    char2: getCharState(char2),
    currentCharacterStates: characterStates, // ← Agregado
    rounds: [],
    currentRound: 0,
    isFinished: false,
    startTime: new Date(),
    turnoActual: 'jugador'
});
```

### 3. Agregar `currentCharacterStates` a Batallas 3v3
**Archivo**: `services/battleService.js`

**Función**: `createBattle3v3()`

**Cambio**:
```javascript
// Crear estados iniciales de los personajes
const characterStates = [...miembros1, ...miembros2];

const battleDoc = new Battle({
    // ... otros campos ...
    currentCharacterStates: characterStates, // ← Agregado
    // ... resto de campos ...
});
```

## Beneficios de la Solución

1. **Consistencia**: Todos los personajes ahora usan los mismos nombres de campos (`currentHealth`, `maxHealth`, `isAlive`).
2. **Compatibilidad**: El frontend puede acceder correctamente a los datos de salud de los personajes.
3. **Seguimiento de Estado**: Las batallas 1v1 ahora tienen el mismo sistema de seguimiento de estado que las batallas 3v3.
4. **Inicialización Correcta**: Los personajes inician con su vida completa en lugar de 0 HP.

## Archivos Modificados
- `api_jorge/pelea/api-superheroes/services/battleService.js`

## Verificación
Para verificar que la solución funciona:
1. Iniciar una nueva batalla 1v1
2. Verificar que los personajes aparecen con su vida completa (100 HP)
3. Verificar que el sistema de personajes muertos sigue funcionando correctamente
4. Probar tanto batallas 1v1 como 3v3 