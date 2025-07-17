# Sistema de Batallas Activas - API de Superhéroes

## Descripción General

El sistema de batallas activas permite crear batallas entre equipos y ejecutar acciones de pelea paso a paso, manteniendo el estado de cada personaje en tiempo real.

## Endpoints Principales

### 1. Crear Batalla entre Equipos

**POST** `/api/battles/team-vs-team`

Crea una nueva batalla entre dos equipos sin simular automáticamente.

**Request Body:**
```json
{
  "equipo1Id": 1,
  "equipo2Id": 2
}
```

**Response:**
```json
{
  "message": "Batalla entre equipos creada exitosamente",
  "battleId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "equipo1": {
    "id": 1,
    "nombre": "Los Vengadores",
    "miembros": [1, 2, 3]
  },
  "equipo2": {
    "id": 2,
    "nombre": "La Liga de la Justicia",
    "miembros": [4, 5, 6]
  },
  "currentCharacterStates": [
    {
      "id": 1,
      "nombre": "Peter Parker",
      "alias": "Spider-Man",
      "tipo": "heroe",
      "currentHealth": 100,
      "maxHealth": 100,
      "isAlive": true,
      "teamId": 1
    }
    // ... más personajes
  ],
  "currentTurn": 1,
  "currentTeamTurn": 1,
  "battleStatus": "active"
}
```

### 2. Ejecutar Acción de Pelea

**POST** `/api/battles/action`

Ejecuta una acción de pelea en una batalla existente.

**Request Body:**
```json
{
  "battleId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "attackerId": 1,
  "targetId": 4,
  "attackType": "especial"
}
```

**Parámetros:**
- `battleId` (string): ID de la batalla activa
- `attackerId` (int): ID del personaje que ataca
- `targetId` (int): ID del personaje que recibe el ataque
- `attackType` (string): Tipo de ataque ("normal" o "especial")

**Response:**
```json
{
  "message": "Acción de pelea ejecutada exitosamente",
  "attackResult": {
    "attackName": "🕷️ Lanzamiento de Telaraña",
    "attackDescription": "Lanza una telaraña que reduce la velocidad del oponente",
    "baseDamage": 60,
    "finalDamage": 72,
    "actualDamage": 42,
    "critical": false,
    "miss": false
  },
  "battleState": {
    "currentTurn": 2,
    "currentTeamTurn": 2,
    "characterStates": [
      {
        "id": 4,
        "nombre": "Clark Kent",
        "alias": "Superman",
        "currentHealth": 58,
        "isAlive": true,
        "teamId": 2
      }
    ],
    "isFinished": false
  },
  "attackLog": {
    "attacker": "Spider-Man",
    "defender": "Superman",
    "attackName": "🕷️ Lanzamiento de Telaraña",
    "damage": 42,
    "critical": false,
    "miss": false,
    "defenderHealth": 58,
    "attackType": "especial"
  }
}
```

### 3. Obtener Estado de Batalla

**GET** `/api/battles/{battleId}/state`

Obtiene el estado actual de una batalla.

**Response:**
```json
{
  "message": "Estado de la batalla obtenido exitosamente",
  "battleState": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "3v3",
    "equipo1": {
      "id": 1,
      "nombre": "Los Vengadores",
      "miembros": [1, 2, 3]
    },
    "equipo2": {
      "id": 2,
      "nombre": "La Liga de la Justicia",
      "miembros": [4, 5, 6]
    },
    "currentTurn": 5,
    "currentTeamTurn": 1,
    "currentRound": 3,
    "characterStates": [
      {
        "id": 1,
        "nombre": "Peter Parker",
        "alias": "Spider-Man",
        "currentHealth": 85,
        "maxHealth": 100,
        "isAlive": true,
        "teamId": 1
      }
      // ... más personajes
    ],
    "rounds": [
      {
        "round": 1,
        "attacks": [
          {
            "attacker": "Spider-Man",
            "defender": "Superman",
            "attackName": "🕷️ Lanzamiento de Telaraña",
            "damage": 42,
            "critical": false,
            "miss": false,
            "attackType": "especial"
          }
        ]
      }
    ],
    "isFinished": false,
    "battleStatus": "active"
  }
}
```

## Reglas del Sistema

### Validaciones de Acciones

1. **Batalla Activa**: La batalla debe estar en estado "active" y no haber terminado
2. **Personajes Válidos**: Tanto el atacante como el objetivo deben existir en la batalla
3. **Personajes Vivos**: El atacante debe estar vivo y el objetivo no debe estar derrotado
4. **Equipos Diferentes**: No se puede atacar a un miembro del propio equipo
5. **Turno Correcto**: Solo el equipo que tiene el turno puede ejecutar acciones

### Sistema de Turnos

- Los equipos se alternan turnos automáticamente
- Cada acción incrementa el contador de turnos
- El sistema verifica automáticamente si la batalla ha terminado

### Tipos de Ataque

- **Normal**: Usa ataques aleatorios del personaje
- **Especial**: Usa ataques especiales específicos del personaje (más daño)

### Cálculo de Daño

- **Daño Base**: `ataque * multiplicador_del_ataque`
- **Crítico**: 15% de probabilidad, duplica el daño
- **Fallar**: 10% de probabilidad, no hace daño
- **Daño Real**: `daño_final - defensa_del_objetivo` (mínimo 1)

### Fin de Batalla

La batalla termina cuando:
- Todos los miembros de un equipo están derrotados
- Se declara un ganador automáticamente
- El estado cambia a "finished"

## Códigos de Error

- **400**: Datos inválidos, batalla terminada, turno incorrecto
- **404**: Batalla no encontrada
- **500**: Error interno del servidor

## Ejemplo de Flujo de Uso

1. **Crear Batalla**: `POST /api/battles/team-vs-team`
2. **Obtener Estado**: `GET /api/battles/{battleId}/state`
3. **Ejecutar Acción**: `POST /api/battles/action`
4. **Repetir pasos 2-3** hasta que la batalla termine
5. **Ver Resultado Final**: `GET /api/battles/{battleId}/state`

## Notas Técnicas

- Todas las batallas se almacenan en MongoDB
- El estado de los personajes se mantiene en tiempo real
- Los logs de ataques se guardan por round
- El sistema es thread-safe para múltiples usuarios
- Se requiere autenticación para todos los endpoints 