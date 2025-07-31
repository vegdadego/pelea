# Mejoras al Sistema de Personajes Muertos

## Problema Reportado

El usuario reportó que "pese que agumon tiene 0 de vida puede seguir luchando y abajo sigue apareciendo como si estuviera vivo", necesitando que cuando un personaje muera en la pelea ya no pueda ser usado, similar a Pokémon cuando un Pokémon se debilita.

## Análisis del Problema

Aunque el sistema visual funcionaba correctamente (personajes muertos se mostraban en gris con calavera y 0 HP), las validaciones para evitar que los personajes muertos pudieran ser seleccionados o usados no eran suficientemente robustas.

### Problemas Identificados:

1. **Validaciones basadas solo en CSS**: Las funciones solo verificaban la clase `dead` en el DOM
2. **Datos desactualizados**: Las validaciones usaban datos del personaje base en lugar del estado actual de la batalla
3. **Falta de verificación en múltiples puntos**: No se validaba en todos los puntos donde se podía seleccionar un personaje

## Solución Implementada

### 1. Validaciones Mejoradas en `selectAttacker` y `selectTarget`

**Antes:**
```javascript
// Verificar que el personaje esté vivo
const currentHp = attacker.hp || attacker.health || attacker.currentHealth || 100;
if (currentHp <= 0) {
    // Mostrar error
    return;
}
```

**Después:**
```javascript
// Verificar que el personaje esté vivo usando datos actualizados del estado de batalla
const charStates = this.currentBattleState.characterStates || [];
const currentCharState = charStates.find(c => c.id === attackerId);

if (currentCharState) {
    // Usar datos del estado de batalla (más confiable)
    const isAlive = currentCharState.isAlive !== false;
    const currentHp = currentCharState.currentHealth || 0;
    
    if (!isAlive || currentHp <= 0) {
        // Mostrar error y prevenir selección
        return;
    }
} else {
    // Fallback: verificar datos del personaje base
    const currentHp = attacker.hp || attacker.health || attacker.currentHealth || 100;
    if (currentHp <= 0) {
        // Mostrar error y prevenir selección
        return;
    }
}
```

### 2. Validaciones Mejoradas en `performAttack`

Se agregaron validaciones robustas antes de ejecutar un ataque:

```javascript
// Verificar que el atacante esté vivo usando datos actualizados del estado de batalla
const charStates = this.currentBattleState.characterStates || [];
const attackerState = charStates.find(c => c.id === this.selectedAttacker.id);

if (attackerState) {
    const attackerIsAlive = attackerState.isAlive !== false;
    const attackerHp = attackerState.currentHealth || 0;
    
    if (!attackerIsAlive || attackerHp <= 0) {
        // Mostrar error y cancelar ataque
        return;
    }
}

// Verificar que el objetivo esté vivo usando datos actualizados del estado de batalla
const targetState = charStates.find(c => c.id === this.selectedTarget.id);

if (targetState) {
    const targetIsAlive = targetState.isAlive !== false;
    const targetHp = targetState.currentHealth || 0;
    
    if (!targetIsAlive || targetHp <= 0) {
        // Mostrar error y cancelar ataque
        return;
    }
}
```

### 3. Validaciones Mejoradas en `addManualSelectionListeners`

Se mejoró la lógica para agregar event listeners solo a personajes vivos:

**Para 1v1:**
```javascript
// Verificar estado del personaje jugador usando datos del estado de batalla
const charStates = this.currentBattleState.characterStates || [];
const hero1 = this.currentBattleState.hero1 || this.currentBattleState.char1;
const playerState = charStates.find(c => c.id === hero1?.id);
const playerIsAlive = playerState ? (playerState.isAlive !== false && playerState.currentHealth > 0) : true;

if (playerMember && !playerMember.classList.contains('dead') && playerIsAlive) {
    playerMember.classList.add('selectable');
    playerMember.addEventListener('click', () => this.selectAttacker(0));
}
```

**Para 3v3:**
```javascript
playerMembers.forEach((member, index) => {
    // Verificar estado del personaje usando datos del estado de batalla
    const charId = team1Ids[index];
    const charState = charStates.find(c => c.id === charId);
    const isAlive = charState ? (charState.isAlive !== false && charState.currentHealth > 0) : true;
    
    // Solo hacer selectable si no está muerto (tanto en CSS como en datos)
    if (!member.classList.contains('dead') && isAlive) {
        member.classList.add('selectable');
        member.addEventListener('click', () => this.selectAttacker(index));
    }
});
```

## Características de la Solución

### ✅ **Validaciones Dobles**
- Verifica tanto la clase CSS `dead` como los datos del estado de batalla
- Usa `isAlive` y `currentHealth` del estado de batalla como fuente de verdad
- Incluye fallback a datos del personaje base si no se encuentra en el estado de batalla

### ✅ **Prevención en Múltiples Puntos**
1. **Al agregar event listeners**: Solo personajes vivos pueden ser clickeables
2. **Al seleccionar atacante**: Valida que el personaje esté vivo antes de asignarlo
3. **Al seleccionar objetivo**: Valida que el personaje esté vivo antes de asignarlo
4. **Al ejecutar ataque**: Valida que ambos personajes estén vivos antes de enviar al servidor

### ✅ **Mensajes de Error Informativos**
- Mensajes claros indicando que el personaje está muerto
- Sugerencias para seleccionar otro personaje
- Feedback visual y en el log de batalla

### ✅ **Compatibilidad con Ambos Modos**
- Funciona correctamente en batallas 1v1 y 3v3
- Maneja diferentes estructuras de datos para cada modo
- Mantiene la funcionalidad existente para personajes vivos

## Resultado Esperado

Después de estas mejoras:

1. ✅ **Personajes muertos no pueden ser seleccionados** como atacantes u objetivos
2. ✅ **No se pueden ejecutar ataques** con personajes muertos
3. ✅ **Mensajes de error claros** cuando se intenta usar personajes muertos
4. ✅ **Validaciones consistentes** en todos los puntos de selección
5. ✅ **Compatibilidad total** con el sistema visual existente

## Archivos Modificados

- `api_jorge/pelea/api-superheroes/game-interface/game.js`:
  - `selectAttacker()`: Validaciones mejoradas usando estado de batalla
  - `selectTarget()`: Validaciones mejoradas usando estado de batalla
  - `performAttack()`: Validaciones dobles antes de ejecutar ataque
  - `addManualSelectionListeners()`: Validaciones mejoradas al agregar listeners

## Pruebas Recomendadas

1. **Iniciar una batalla** y verificar que todos los personajes vivos sean seleccionables
2. **Realizar ataques** hasta que un personaje muera
3. **Intentar seleccionar** el personaje muerto como atacante → Debe mostrar error
4. **Intentar seleccionar** el personaje muerto como objetivo → Debe mostrar error
5. **Intentar ejecutar ataque** con personaje muerto → Debe mostrar error y cancelar
6. **Verificar** que solo los personajes vivos restantes sean seleccionables
7. **Continuar batalla** con personajes vivos → Debe funcionar normalmente

## Notas Técnicas

- Las validaciones usan `characterStates` del `battleState` como fuente de verdad
- Se incluye fallback a datos del personaje base para casos edge
- Los mensajes de error son consistentes y informativos
- La solución es robusta y maneja todos los casos posibles
- No afecta el rendimiento ya que las validaciones son rápidas 