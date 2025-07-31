# Test Plan: Personajes Muertos en Batalla 3v3

## Objetivo
Verificar que la lógica de personajes muertos funcione correctamente en el modo de batalla 3v3, incluyendo personajes activos y en banca.

## Casos de Prueba

### 1. Validación de Ataques con Personajes Muertos

#### 1.1 Personaje Activo Muerto Intenta Atacar
**Pasos:**
1. Iniciar batalla 3v3
2. Reducir HP de un personaje activo a 0
3. Intentar atacar con ese personaje

**Resultado Esperado:**
- Mensaje: "¡No puedes atacar con un personaje muerto!"
- Ataque cancelado
- Botones de ataque permanecen habilitados para otros personajes

#### 1.2 Enemigo Muerto como Objetivo
**Pasos:**
1. Reducir HP de un enemigo a 0
2. Intentar atacar al enemigo muerto

**Resultado Esperado:**
- Mensaje: "¡El enemigo ya está derrotado!"
- Ataque cancelado
- Sistema automáticamente selecciona siguiente enemigo vivo

### 2. Efectos Visuales de Muerte

#### 2.1 Personajes Activos Muertos
**Pasos:**
1. Reducir HP de personaje activo a 0
2. Observar efectos visuales

**Resultado Esperado:**
- Barra de vida gris (`#666666, #888888`)
- Sprite con filtro `grayscale(100%)`
- Opacidad reducida (`0.6`)
- Texto HP: "0 / MaxHp"
- Cursor `not-allowed`

#### 2.2 Personajes en Banca Muertos
**Pasos:**
1. Reducir HP de personaje en banca a 0
2. Observar efectos visuales en banca

**Resultado Esperado:**
- Barra de vida gris en banca
- Sprite en banca con efectos de muerte
- Texto HP actualizado a "0 / MaxHp"
- Efectos consistentes con personajes activos

#### 2.3 Enemigos Muertos
**Pasos:**
1. Reducir HP de enemigo a 0
2. Observar efectos visuales

**Resultado Esperado:**
- Barra de vida gris para enemigos
- Sprite enemigo con efectos de muerte
- Efectos aplicados tanto en banca como activo

### 3. Lógica de Cambio de Personajes

#### 3.1 Cambio Automático a Personaje Vivo
**Pasos:**
1. Tener personaje activo muerto
2. Presionar botón "CAMBIAR"

**Resultado Esperado:**
- Automáticamente selecciona siguiente personaje vivo
- Mensaje: "Cambiaste a [Nombre]"
- Nuevo personaje activo tiene HP > 0

#### 3.2 Todos los Personajes Muertos
**Pasos:**
1. Reducir HP de todos los personajes del equipo a 0
2. Presionar "CAMBIAR"

**Resultado Esperado:**
- Mensaje: "¡Todos tus personajes han caído!"
- Batalla termina con derrota
- Pantalla de resumen se muestra

#### 3.3 Enemigos Muertos
**Pasos:**
1. Reducir HP de todos los enemigos a 0

**Resultado Esperado:**
- Mensaje: "¡Victoria! Has derrotado a todos los enemigos!"
- Batalla termina con victoria
- Pantalla de resumen se muestra

### 4. Persistencia de Estado

#### 4.1 Recarga de Página
**Pasos:**
1. Reducir HP de varios personajes a 0
2. Recargar la página
3. Verificar efectos visuales

**Resultado Esperado:**
- Efectos de muerte se mantienen
- Barras de vida grises preservadas
- Estado de muerte correcto en todos los personajes

#### 4.2 Estado de Batalla
**Pasos:**
1. Iniciar batalla
2. Recargar página
3. Verificar que la batalla continúe

**Resultado Esperado:**
- Batalla se restaura correctamente
- Turnos y estado se mantienen
- Efectos visuales preservados

### 5. Validación de Elementos DOM

#### 5.1 IDs Únicos de Barras de Salud
**Pasos:**
1. Inspeccionar elementos DOM
2. Verificar IDs de barras de salud

**Resultado Esperado:**
- `enemy0Hp`, `enemy1Hp`, `enemy2Hp` para enemigos
- `player0Hp`, `player1Hp`, `player2Hp` para jugadores
- `activePlayerHp`, `activeEnemyHp` para personajes activos

#### 5.2 Elementos No Encontrados
**Pasos:**
1. Intentar actualizar barra de salud con ID inexistente
2. Verificar manejo de errores

**Resultado Esperado:**
- Mensaje de consola: "Health bar with ID '[ID]' not found"
- No errores en la aplicación
- Funcionamiento normal continúa

### 6. Actualización de Barras de Salud

#### 6.1 Función updateAllHealthBars()
**Pasos:**
1. Iniciar batalla
2. Verificar llamada a updateAllHealthBars()

**Resultado Esperado:**
- Función se ejecuta después de renderTeams()
- Todas las barras de salud se actualizan correctamente
- Efectos visuales aplicados a todos los personajes

#### 6.2 Actualización Individual
**Pasos:**
1. Cambiar HP de personaje específico
2. Llamar updateHealthBar() manualmente

**Resultado Esperado:**
- Barra de salud se actualiza correctamente
- Efectos visuales aplicados según HP
- Texto HP actualizado

### 7. Estilos CSS

#### 7.1 Clases CSS para Personajes Muertos
**Pasos:**
1. Inspeccionar elementos con clase 'dead'
2. Verificar estilos aplicados

**Resultado Esperado:**
- `.enemy-sprite.dead`, `.player-sprite.dead` aplicados
- `.hp-fill.dead` para barras de salud
- `.active-sprite.dead` para personajes activos
- Estilos consistentes en todos los elementos

#### 7.2 Responsive Design
**Pasos:**
1. Cambiar tamaño de ventana
2. Verificar efectos visuales en diferentes tamaños

**Resultado Esperado:**
- Efectos visuales se mantienen en todos los tamaños
- Barras de salud escalan correctamente
- Sprites mantienen proporciones

## Criterios de Aceptación

### ✅ Funcionalidad Básica
- [ ] Personajes muertos no pueden atacar
- [ ] Personajes muertos no pueden ser seleccionados
- [ ] Barras de vida grises para personajes muertos
- [ ] Efectos visuales consistentes

### ✅ Lógica de Juego
- [ ] Cambio automático a personajes vivos
- [ ] Fin de batalla cuando todos están muertos
- [ ] Validación de turnos correcta
- [ ] Mensajes informativos claros

### ✅ Persistencia
- [ ] Estado se mantiene al recargar
- [ ] Efectos visuales preservados
- [ ] Batalla se restaura correctamente

### ✅ Robustez
- [ ] Manejo de errores implementado
- [ ] Validación de elementos DOM
- [ ] IDs únicos para todas las barras
- [ ] No errores en consola

### ✅ UI/UX
- [ ] Efectos visuales claros y consistentes
- [ ] Feedback inmediato al usuario
- [ ] Mensajes de error informativos
- [ ] Transiciones suaves

## Comandos de Prueba

### Verificar IDs de Barras de Salud
```javascript
// En consola del navegador
document.querySelectorAll('.hp-fill').forEach((bar, index) => {
    console.log(`Barra ${index}:`, bar.id);
});
```

### Verificar Personajes Muertos
```javascript
// En consola del navegador
enemyTeam.forEach((char, index) => {
    console.log(`Enemigo ${index}:`, char.hp <= 0 ? 'MUERTO' : 'VIVO');
});
playerTeam.forEach((char, index) => {
    console.log(`Jugador ${index}:`, char.hp <= 0 ? 'MUERTO' : 'VIVO');
});
```

### Verificar Efectos Visuales
```javascript
// En consola del navegador
document.querySelectorAll('.dead').forEach(element => {
    console.log('Elemento muerto:', element);
});
```

## Notas de Implementación

### Archivos Críticos
- `battle-3v3.html`: Lógica principal de 3v3
- `updateHealthBar()`: Función clave para efectos visuales
- `renderTeams()`: Renderizado con IDs únicos
- `updateAllHealthBars()`: Actualización completa

### Puntos de Atención
1. **IDs únicos**: Asegurar que todas las barras tengan IDs únicos
2. **Validación**: Verificar existencia de elementos antes de manipularlos
3. **Consistencia**: Aplicar efectos visuales uniformemente
4. **Performance**: Evitar llamadas innecesarias a updateHealthBar()

### Debugging
- Usar `console.log()` para verificar valores de HP
- Inspeccionar elementos DOM para verificar clases CSS
- Verificar IDs de barras de salud en DevTools
- Monitorear llamadas a funciones de actualización 