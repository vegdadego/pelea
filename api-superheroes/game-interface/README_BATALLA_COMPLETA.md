# ⚔️ Superhéroes Battle - Sistema de Batalla Completo

## 🎯 Descripción

Sistema completo de batalla por turnos con autenticación JWT, selección de equipos 3v3, simulación de batallas y recapitulación detallada.

## 🔐 Características de Autenticación

- **Registro de usuarios** con validaciones
- **Inicio de sesión** con JWT
- **Persistencia de sesión** en localStorage
- **Cerrar sesión** con limpieza de datos

## 🎮 Modos de Batalla

### ⚔️ Batalla 1v1
- Selección de un personaje vs un enemigo aleatorio
- Combate directo por turnos
- Sistema de movimientos (Normal, Especial, Ultimate)

### ⚔️⚔️⚔️ Batalla 3v3
- Selección de equipo de 3 personajes
- Sistema de relevos automático cuando un héroe muere
- Combate por turnos con equipos completos

## 🎲 Sistema de Combate

### Acciones Disponibles

#### ⚔️ Tu Turno
- **Ataque Normal**: Daño base del personaje
- **Ataque Especial**: Daño aumentado con efectos especiales
- **Ataque Ultimate**: Daño máximo con efectos únicos

#### 🎲 Simulación
- **Siguiente Round**: Procesar un round manualmente
- **Auto Play**: Simulación automática de rounds
- **Simular Batalla Completa**: Ejecutar toda la batalla de una vez

### Características del Combate

- **Sistema de Turnos**: Basado en la velocidad de los héroes
- **Daño Crítico**: 10% de probabilidad de hacer daño doble
- **Defensa**: Reduce el daño recibido
- **Vida Mínima**: El daño mínimo siempre es 1
- **Muerte**: Cuando la vida llega a 0, el héroe muere
- **Relevos**: En 3v3, cuando un héroe muere, el siguiente toma su lugar

## 📊 Recapitulación de Batalla

### 🏆 Resultado
- **Victoria/Derrota** con indicadores visuales
- **Estadísticas completas** de la batalla
- **Historial detallado** de todos los rounds

### 📈 Estadísticas Mostradas
- **Rounds Totales**: Número de rounds jugados
- **Daño Total**: Daño acumulado en la batalla
- **Críticos**: Número de golpes críticos
- **Duración**: Tiempo total de la batalla

### 📜 Historial de Rounds
- **Round por round** con detalles completos
- **Atacante y defensor** en cada round
- **Daño causado** con indicadores de crítico
- **HP restante** después de cada ataque
- **Efectos especiales** y estados

## 🚀 Flujo Completo del Juego

### 1. 🔐 Autenticación
```
Pantalla de Login/Registro → Inicio de Sesión → Pantalla Principal
```

### 2. 🎯 Selección de Modo
```
Pantalla Principal → Elegir 1v1 o 3v3 → Pantalla de Selección
```

### 3. 👥 Selección de Personajes
```
1v1: Seleccionar 1 personaje
3v3: Seleccionar 3 personajes para el equipo
```

### 4. ⚔️ Batalla
```
Iniciar Batalla → Pantalla de Combate → Opciones de Juego
```

### 5. 🎲 Opciones de Combate
```
- Realizar Ataque (turno por turno)
- Siguiente Round (manual)
- Auto Play (automático)
- Simular Batalla Completa
```

### 6. 🏆 Recapitulación
```
Resultado → Estadísticas → Historial → Opciones de Continuar
```

## 🎨 Interfaz de Usuario

### Pantallas Disponibles

1. **Pantalla de Autenticación** (`authScreen`)
   - Login y registro de usuarios
   - Validaciones de formularios
   - Mensajes de estado

2. **Pantalla Principal** (`startScreen`)
   - Información del usuario
   - Selección de modo de batalla
   - Instrucciones del juego

3. **Pantalla de Selección 1v1** (`selectionScreen1v1`)
   - Grid de personajes disponibles
   - Selección individual

4. **Pantalla de Selección 3v3** (`selectionScreen3v3`)
   - Grid de personajes disponibles
   - Slots de equipo (3 slots)
   - Gestión de equipo (agregar/remover)

5. **Pantalla de Batalla** (`battleScreen`)
   - Visualización de equipos
   - Controles de combate
   - Log de batalla en tiempo real
   - Opciones de simulación

6. **Pantalla de Recapitulación** (`recapScreen`)
   - Resultado de la batalla
   - Estadísticas detalladas
   - Historial completo de rounds
   - Opciones para continuar

### Controles de Batalla

#### Controles Superiores
- **🏁 Simular Batalla Completa**: Ejecutar toda la batalla
- **🔄 Nueva Batalla**: Volver a selección

#### Controles de Combate
- **⚔️ Tu Turno**: Movimientos y ataque manual
- **🎲 Simulación**: Control de rounds y auto play

## 🔧 Endpoints de la API Utilizados

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Personajes
- `GET /api/personajes/public` - Obtener personajes (público)

### Batallas
- `POST /api/battles/1v1` - Crear batalla 1v1
- `POST /api/battles/3v3` - Crear batalla 3v3
- `GET /api/battles/:id` - Obtener estado de batalla
- `POST /api/battles/:id/round` - Procesar un round
- `POST /api/battles/:id/simulate` - Simular batalla completa

## 📱 Características Técnicas

### Almacenamiento Local
- `authToken`: Token JWT para autenticación
- `currentUser`: Información del usuario actual

### Estado del Juego
- `battleMode`: Modo actual (1v1 o 3v3)
- `selectedCharacter`: Personaje seleccionado (1v1)
- `selectedTeam`: Equipo seleccionado (3v3)
- `battleRounds`: Historial de rounds
- `battleStats`: Estadísticas de la batalla
- `isAutoPlaying`: Estado de auto play

### Seguridad
- Todas las llamadas a la API (excepto auth) requieren JWT
- Validación de datos en frontend y backend
- Manejo de errores de autenticación

## 🎯 Características Avanzadas

### Auto Play
- **Simulación automática** de rounds
- **Control de velocidad** (1 segundo entre rounds)
- **Pausa/Reanudación** en cualquier momento
- **Indicadores visuales** del estado

### Simulación Completa
- **Ejecución instantánea** de toda la batalla
- **Recopilación automática** de estadísticas
- **Historial completo** de todos los rounds
- **Transición directa** a recapitulación

### Gestión de Equipos (3v3)
- **Selección visual** con slots
- **Validaciones**: No repetir personajes, máximo 3
- **Gestión dinámica**: Agregar/remover personajes
- **Botón de limpieza** para reiniciar equipo

## 🐛 Solución de Problemas

### Errores Comunes

1. **"Error al cargar personajes"**
   - Verificar conexión a internet
   - Comprobar que la API esté funcionando

2. **"Error al iniciar batalla"**
   - Verificar selección de personajes
   - Comprobar token de autenticación

3. **"Error en simulación"**
   - Verificar que la batalla esté activa
   - Comprobar permisos de usuario

### Debugging

- **Consola del navegador**: Logs detallados de todas las operaciones
- **Network tab**: Verificar llamadas a la API
- **Local Storage**: Comprobar tokens y datos guardados

## 🔄 Actualizaciones Futuras

- [ ] Modo multijugador en tiempo real
- [ ] Chat durante las batallas
- [ ] Rankings y estadísticas globales
- [ ] Personalización de personajes
- [ ] Modo torneo
- [ ] Replays de batallas
- [ ] Logros y badges

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contactar al desarrollador de la API.

---

**¡Disfruta de las batallas épicas de Superhéroes Battle! ⚔️🏆** 