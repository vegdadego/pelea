# API de Superhéroes - Sistema de Batallas

Esta API permite gestionar superhéroes y simular batallas entre ellos con un sistema de combate por turnos.

## Características

### Superhéroes
- **Estadísticas de Combate**: Cada héroe tiene estadísticas únicas:
  - **Vida (Health)**: Puntos de vida actuales y máximos
  - **Ataque (Attack)**: Poder de ataque base
  - **Defensa (Defense)**: Capacidad de reducir el daño recibido
  - **Velocidad (Speed)**: Determina quién ataca primero

### Sistema de Batallas

#### Batallas 1v1
- Combate directo entre dos superhéroes
- Sistema de turnos basado en velocidad
- Daño calculado con críticos aleatorios
- Defensa reduce el daño recibido

#### Batallas 3v3
- Combate entre equipos de 3 superhéroes
- Cuando un héroe muere, el siguiente del equipo toma su lugar
- El equipo que pierda todos sus héroes pierde la batalla

## Endpoints Disponibles

### Héroes
- `GET /api/heroes` - Obtener todos los héroes
- `POST /api/heroes` - Crear un nuevo héroe
- `PUT /api/heroes/:id` - Actualizar un héroe
- `DELETE /api/heroes/:id` - Eliminar un héroe

### Batallas
- `GET /api/battles` - Obtener todas las batallas
- `GET /api/battles/heroes` - Obtener héroes disponibles para batalla
- `GET /api/battles/teams` - Obtener héroes organizados por equipos
- `POST /api/battles/1v1` - Crear una batalla 1v1
- `POST /api/battles/3v3` - Crear una batalla 3v3
- `POST /api/battles/:id/round` - Simular un round de batalla
- `POST /api/battles/:id/simulate` - Simular batalla completa
- `GET /api/battles/:id` - Obtener estadísticas de una batalla

## Ejemplos de Uso

### Crear una batalla 1v1
```bash
curl -X POST http://localhost:3001/api/battles/1v1 \
  -H "Content-Type: application/json" \
  -d '{
    "hero1Id": 1,
    "hero2Id": 2
  }'
```

### Crear una batalla 3v3
```bash
curl -X POST http://localhost:3001/api/battles/3v3 \
  -H "Content-Type: application/json" \
  -d '{
    "team1Ids": [1, 2, 6],
    "team2Ids": [3, 4, 5]
  }'
```

### Simular un round
```bash
curl -X POST http://localhost:3001/api/battles/1/round
```

### Simular batalla completa
```bash
curl -X POST http://localhost:3001/api/battles/1/simulate
```

## Héroes Disponibles

### Los Vengadores
- **Spider-Man** (ID: 1): Velocidad alta, ataque medio
- **Iron Man** (ID: 2): Ataque alto, defensa alta
- **Captain America** (ID: 6): Ataque alto, defensa alta
- **Thor** (ID: 7): Ataque muy alto, defensa alta

### Justice League
- **Batman** (ID: 3): Ataque alto, defensa media
- **Superman** (ID: 4): Ataque muy alto, defensa muy alta
- **Wonder Woman** (ID: 5): Ataque alto, defensa alta
- **Flash** (ID: 8): Velocidad máxima, ataque bajo
- **Aquaman** (ID: 9): Ataque alto, defensa media

## Instalación y Ejecución

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar el servidor:
```bash
npm start
```

3. Acceder a la documentación Swagger:
```
http://localhost:3001/api-docs
```

## Documentación API

La documentación completa de la API está disponible en Swagger UI en:
```
http://localhost:3001/api-docs
```

## Características del Sistema de Combate

- **Sistema de Turnos**: Basado en la velocidad de los héroes
- **Daño Crítico**: 10% de probabilidad de hacer daño doble
- **Defensa**: Reduce el daño recibido
- **Vida Mínima**: El daño mínimo siempre es 1
- **Muerte**: Cuando la vida llega a 0, el héroe muere
- **Batallas 3v3**: Sistema de relevos automático cuando un héroe muere 