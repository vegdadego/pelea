# 🚀 Automatización Completa de API Superhéroes con Postman

## 📋 Descripción General

Esta colección de Postman proporciona una automatización completa para tu API de superhéroes, incluyendo:

- ✅ **Generación aleatoria de datos** para todos los endpoints
- ✅ **Autenticación automática** con tokens JWT
- ✅ **Flujos automatizados** para crear equipos y batallas
- ✅ **Scripts de validación** para respuestas
- ✅ **Manejo de errores** y logging detallado

## 🎯 Características Principales

### 🔐 **Autenticación Automática**
- Login automático con credenciales de admin
- Guardado automático de tokens JWT
- Manejo de sesiones entre requests

### 🎲 **Generación Aleatoria de Datos**
- Usuarios con nombres aleatorios
- Personajes con stats variados
- Equipos con combinaciones únicas
- Batallas con personajes aleatorios

### ⚡ **Flujos Automatizados**
- Creación automática de equipos y batallas
- Ejecución de múltiples acciones en secuencia
- Validación automática de estados

## 📁 Estructura de Archivos

```
api-superheroes/
├── Postman_Complete_Collection.json    # Colección principal
├── Postman_Scripts/
│   ├── Auth_Scripts.js                 # Scripts de autenticación
│   ├── Character_Scripts.js            # Scripts de personajes
│   ├── Team_Scripts.js                 # Scripts de equipos
│   └── Battle_Scripts.js               # Scripts de batallas
└── README_POSTMAN_AUTOMATION.md        # Esta documentación
```

## 🚀 Instalación y Configuración

### 1. **Importar la Colección**
1. Abre Postman
2. Haz clic en "Import"
3. Selecciona `Postman_Complete_Collection.json`
4. La colección se importará con todas las variables configuradas

### 2. **Configurar Variables de Entorno**
```json
{
  "baseUrl": "https://pelea.onrender.com/api",
  "authToken": "",
  "adminToken": "",
  "currentBattleId": "",
  "currentTeamId": "",
  "availableCharacters": "[]",
  "availableTeams": "[]"
}
```

### 3. **API Desplegada**
Tu API ya está desplegada en: **https://pelea.onrender.com**

No necesitas iniciar el servidor localmente, la automatización usará directamente la URL desplegada.

## 🎮 Cómo Usar la Automatización

### **Paso 1: Autenticación**
1. Ejecuta "Login Admin" para obtener el token
2. El token se guarda automáticamente en las variables

### **Paso 2: Crear Datos de Prueba**
1. Ejecuta "Obtener Todos los Personajes" para cargar personajes disponibles
2. Ejecuta "Crear Equipo Aleatorio" para crear equipos
3. Los datos se guardan automáticamente en las variables

### **Paso 3: Crear Batallas**
1. Ejecuta "Crear Batalla entre Equipos" para iniciar una batalla
2. El ID de la batalla se guarda automáticamente
3. Usa "Obtener Estado de Batalla" para ver el progreso

### **Paso 4: Ejecutar Acciones**
1. Usa "Ejecutar Acción de Batalla" para hacer ataques
2. Usa "Obtener Acciones Disponibles" para ver opciones
3. Repite hasta que la batalla termine

## 📊 Scripts Disponibles

### **🔐 Autenticación**
```javascript
// Login automático
function loginUserScript() {
    const loginData = {
        user: "vegdadego",
        password: "admin123"
    };
    // Configura request automáticamente
}

// Guardar token
function saveTokenScript() {
    if (pm.response.code === 200) {
        const response = pm.response.json();
        pm.collectionVariables.set("authToken", response.token);
    }
}
```

### **👥 Personajes**
```javascript
// Generar personaje aleatorio
function generateRandomCharacter() {
    const superheroes = [/* datos predefinidos */];
    const personaje = superheroes[Math.floor(Math.random() * superheroes.length)];
    // Modificar stats ligeramente para variabilidad
    return personaje;
}

// Crear personaje
function createCharacterScript() {
    const characterData = generateRandomCharacter();
    pm.request.body.raw = JSON.stringify(characterData);
}
```

### **⚔️ Equipos**
```javascript
// Generar equipo aleatorio
function generateRandomTeam() {
    const teamNames = [/* nombres predefinidos */];
    const nombre = teamNames[Math.floor(Math.random() * teamNames.length)];
    const miembros = [/* 3 personajes aleatorios */];
    return { nombre, miembros };
}

// Validar miembros del equipo
function validateTeamMembers(miembros) {
    const availableCharacters = JSON.parse(pm.collectionVariables.get("availableCharacters"));
    // Verificar que todos los personajes existen
}
```

### **⚔️ Batallas**
```javascript
// Generar batalla 1v1 aleatoria
function generateRandom1v1Battle() {
    const char1Id = Math.floor(Math.random() * 8) + 1;
    let char2Id = Math.floor(Math.random() * 8) + 1;
    while (char2Id === char1Id) {
        char2Id = Math.floor(Math.random() * 8) + 1;
    }
    return { char1Id, char2Id };
}

// Ejecutar acción de batalla
function executeBattleActionScript() {
    const actionData = {
        battleId: pm.collectionVariables.get("currentBattleId"),
        attackerId: Math.floor(Math.random() * 8) + 1,
        targetId: Math.floor(Math.random() * 8) + 1,
        attackType: ["normal", "especial", "ultimate"][Math.floor(Math.random() * 3)]
    };
    pm.request.body.raw = JSON.stringify(actionData);
}
```

## 🔄 Flujos Automatizados

### **Flujo 1: Crear Equipo y Batalla**
```javascript
// Después de crear equipo, crear batalla automáticamente
if (pm.response.code === 201) {
    const team = pm.response.json();
    
    // Crear batalla automáticamente
    const battleData = {
        equipo1Id: team.id,
        equipo2Id: 2,
    };
    
    pm.sendRequest({
        url: pm.collectionVariables.get('baseUrl') + '/battles/team-vs-team',
        method: 'POST',
        // ... configuración
    });
}
```

### **Flujo 2: Múltiples Acciones**
```javascript
// Ejecutar múltiples acciones en secuencia
if (pm.response.code === 200) {
    const action2 = {
        battleId: pm.collectionVariables.get('currentBattleId'),
        attackerId: 2,
        targetId: 5,
        attackType: 'normal'
    };
    
    setTimeout(() => {
        pm.sendRequest({
            // ... segunda acción
        });
    }, 1000);
}
```

## 🎯 Casos de Uso Comunes

### **1. Testing Automatizado**
```bash
# Ejecutar toda la colección
newman run Postman_Complete_Collection.json
```

### **2. Crear Datos de Prueba**
1. Login Admin
2. Crear 5 personajes aleatorios
3. Crear 3 equipos aleatorios
4. Crear 2 batallas

### **3. Simular Batalla Completa**
1. Crear batalla entre equipos
2. Ejecutar 10 acciones aleatorias
3. Verificar estado final

### **4. Testing de Errores**
1. Intentar crear equipo con personajes inexistentes
2. Intentar acceder sin autenticación
3. Intentar modificar recursos de otros usuarios

## 🔧 Personalización

### **Modificar Datos Aleatorios**
```javascript
// En Character_Scripts.js
const superheroes = [
    {
        nombre: "Tu Personaje",
        alias: "Tu Alias",
        tipo: "heroe",
        // ... más datos
    }
];
```

### **Agregar Nuevos Flujos**
```javascript
// Nuevo flujo personalizado
function customFlow() {
    // Tu lógica aquí
    pm.sendRequest({
        // ... configuración
    });
}
```

### **Modificar Variables**
```javascript
// Cambiar URL base (ya configurada para tu API desplegada)
pm.collectionVariables.set("baseUrl", "https://pelea.onrender.com/api");

// Cambiar credenciales
pm.collectionVariables.set("adminUser", "tu-usuario");
pm.collectionVariables.set("adminPassword", "tu-password");
```

## 🐛 Troubleshooting

### **Error: Token no válido**
- Ejecuta "Login Admin" nuevamente
- Verifica que el servidor esté corriendo
- Revisa las credenciales en el script

### **Error: Personajes no encontrados**
- Ejecuta "Obtener Todos los Personajes" primero
- Verifica que existan personajes en la base de datos
- Usa IDs válidos (1-8 por defecto)

### **Error: Equipos no encontrados**
- Crea equipos primero con "Crear Equipo Aleatorio"
- Verifica que los personajes existan
- Usa IDs válidos

### **Error: Batalla no encontrada**
- Crea una batalla primero
- Verifica que el ID de batalla esté guardado
- Usa "Obtener Estado de Batalla" para verificar

## 📈 Monitoreo y Logs

### **Console Logs**
Todos los scripts incluyen logs detallados:
```javascript
console.log("Creando personaje:", characterData.alias);
console.log("Token guardado:", response.token.substring(0, 20) + "...");
console.log("ID de batalla guardado:", response.battleId);
```

### **Validaciones Automáticas**
```javascript
// Validar respuesta exitosa
if (pm.response.code === 200) {
    console.log("Operación exitosa");
} else {
    console.log("Error:", pm.response.text());
}
```

## 🎉 Beneficios de la Automatización

1. **Ahorro de Tiempo**: No más datos manuales
2. **Consistencia**: Datos siempre válidos
3. **Testing Completo**: Cobertura de todos los endpoints
4. **Debugging Fácil**: Logs detallados
5. **Escalabilidad**: Fácil agregar nuevos casos

## 📞 Soporte

Para problemas o preguntas:
1. Revisa los logs en la consola de Postman
2. Verifica que el servidor esté corriendo
3. Comprueba las variables de entorno
4. Revisa la documentación de la API

---

**¡Disfruta automatizando tu API de superhéroes! 🦸‍♂️** 