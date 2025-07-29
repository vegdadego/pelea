# 🚀 Instrucciones para API Desplegada en Render

## 🌐 Tu API está desplegada en: [https://pelea.onrender.com](https://pelea.onrender.com)

### 📋 Configuración Actualizada

He actualizado toda la automatización de Postman para usar tu API desplegada en lugar de localhost. Los cambios incluyen:

- ✅ **URL base actualizada**: `https://pelea.onrender.com/api`
- ✅ **Variables de entorno configuradas**
- ✅ **Scripts de prueba de conectividad**
- ✅ **Documentación actualizada**

## 🎯 Cómo Usar la Automatización

### **Paso 1: Probar Conectividad**

Antes de usar Postman, verifica que tu API esté funcionando:

```bash
# Instalar dependencias si no las tienes
npm install node-fetch

# Probar conectividad
node test_production_api.js
```

Este script verificará:
- ✅ Conectividad básica con la API
- ✅ Autenticación de admin
- ✅ Endpoints de personajes
- ✅ Endpoints de equipos
- ✅ Endpoints de batallas
- ✅ Documentación Swagger

### **Paso 2: Importar en Postman**

1. **Abrir Postman**
2. **Importar colección**: `Postman_Complete_Collection.json`
3. **Importar entorno**: `postman_environment_production.json`
4. **Seleccionar entorno**: "API Superhéroes - Producción (Render)"

### **Paso 3: Configurar Variables**

Las variables ya están configuradas, pero puedes verificarlas:

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

### **Paso 4: Ejecutar Automatización**

#### **Opción A: Usando Postman Manualmente**
1. Ejecuta "Login Admin" para obtener el token
2. Ejecuta "Obtener Todos los Personajes" para cargar datos
3. Ejecuta "Crear Equipo Aleatorio" para crear equipos
4. Ejecuta "Crear Batalla entre Equipos" para iniciar batallas
5. Ejecuta "Ejecutar Acción de Batalla" para combatir

#### **Opción B: Usando Newman (Automático)**
```bash
# Instalar Newman
npm install -g newman

# Ejecutar automatización completa
node run_postman_automation.js
```

## 🎮 Flujos de Prueba Recomendados

### **Flujo 1: Testing Básico**
```bash
# 1. Probar conectividad
node test_production_api.js

# 2. Ejecutar automatización
node run_postman_automation.js
```

### **Flujo 2: Testing Manual en Postman**
1. **Login Admin** → Obtener token
2. **Obtener Personajes** → Cargar datos disponibles
3. **Crear Equipo** → Generar equipo aleatorio
4. **Crear Batalla** → Iniciar batalla entre equipos
5. **Ejecutar Acciones** → Hacer ataques automáticos
6. **Ver Estado** → Monitorear progreso

### **Flujo 3: Testing Completo**
```bash
# Ejecutar todo automáticamente
npm install -g newman
node run_postman_automation.js
```

## 📊 Endpoints Disponibles

### **🔐 Autenticación**
- `POST /auth/login` - Login con credenciales
- `POST /auth/register` - Registro de usuarios

### **👥 Personajes (Admin)**
- `GET /personajes` - Listar todos los personajes
- `POST /personajes` - Crear personaje
- `GET /personajes/:id` - Obtener personaje específico
- `PUT /personajes/:id` - Actualizar personaje
- `DELETE /personajes/:id` - Eliminar personaje

### **⚔️ Equipos**
- `GET /equipos` - Listar mis equipos
- `POST /equipos` - Crear equipo
- `GET /equipos/:id` - Obtener equipo específico
- `PUT /equipos/:id` - Actualizar equipo
- `DELETE /equipos/:id` - Eliminar equipo

### **⚔️ Batallas**
- `GET /battles` - Listar batallas
- `POST /battles/1v1` - Crear batalla 1v1
- `POST /battles/team-vs-team` - Crear batalla entre equipos
- `GET /battles/:id/state` - Obtener estado de batalla
- `POST /battles/action` - Ejecutar acción de batalla
- `GET /battles/characters` - Obtener personajes para batalla

## 🔧 Troubleshooting

### **Error: "API no responde"**
```bash
# Verificar que la API esté activa
curl https://pelea.onrender.com/api/auth/login
```

### **Error: "Token no válido"**
1. Ejecuta "Login Admin" nuevamente
2. Verifica las credenciales: `vegdadego` / `admin123`
3. Revisa que el token se guarde en las variables

### **Error: "Personajes no encontrados"**
1. Ejecuta "Obtener Todos los Personajes" primero
2. Verifica que existan personajes en la base de datos
3. Usa IDs válidos (1-8 por defecto)

### **Error: "Equipos no encontrados"**
1. Crea equipos primero con "Crear Equipo Aleatorio"
2. Verifica que los personajes existan
3. Usa IDs válidos

## 📈 Monitoreo

### **Logs en Consola**
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

## 🎯 Casos de Uso Específicos

### **1. Testing de Producción**
```bash
# Probar conectividad completa
node test_production_api.js
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

## 🌐 URLs Importantes

- **API Base**: https://pelea.onrender.com/api
- **Swagger UI**: https://pelea.onrender.com/api-docs
- **Colección Postman**: `Postman_Complete_Collection.json`
- **Entorno Postman**: `postman_environment_production.json`

## 🎉 Beneficios de la Configuración

1. **✅ Sin Configuración Local**: No necesitas iniciar servidor
2. **✅ Testing Real**: Pruebas contra API desplegada
3. **✅ Datos Aleatorios**: Generación automática sin errores
4. **✅ Logs Detallados**: Monitoreo completo de operaciones
5. **✅ Escalabilidad**: Fácil agregar nuevos casos de prueba

## 📞 Soporte

Para problemas o preguntas:
1. Revisa los logs en la consola de Postman
2. Ejecuta `node test_production_api.js` para diagnosticar
3. Verifica que la API esté activa en Render
4. Revisa la documentación Swagger en https://pelea.onrender.com/api-docs

---

**¡Tu API está lista para ser automatizada! 🦸‍♂️**

**URL de tu API**: [https://pelea.onrender.com](https://pelea.onrender.com) 