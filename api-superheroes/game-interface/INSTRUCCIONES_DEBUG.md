# 🐛 Instrucciones de Debug - Problema de Inicio de Batalla

## 🎯 Problema Identificado
La pelea no inicia cuando se presiona el botón "Iniciar Batalla".

## 🔧 Pasos para Depurar

### 1. **Abrir la Consola del Navegador**
- Presiona `F12` o `Ctrl+Shift+I`
- Ve a la pestaña **Console**
- Limpia la consola con `Ctrl+L`

### 2. **Probar el Panel de Debug**
1. Abre el archivo `debug_battle.html` en tu navegador
2. Sigue estos pasos:
   - **Probar Autenticación**: Verifica si tienes token
   - **Cargar Personajes**: Obtén los personajes de la API
   - **Probar Batalla 1v1**: Intenta crear una batalla directamente
   - **Probar Batalla 3v3**: Intenta crear una batalla 3v3

### 3. **Verificar el Juego Principal**
1. Abre `index.html` en tu navegador
2. Inicia sesión o regístrate
3. Selecciona modo 1v1 o 3v3
4. Selecciona personajes
5. Intenta iniciar la batalla
6. **Observa los logs en la consola**

## 📊 Información que Buscar en la Consola

### ✅ **Logs Exitosos**
```
🔍 Verificando elementos del DOM...
✅ Elemento encontrado: startBattleBtn1v1
✅ Elemento encontrado: startBattleBtn3v3
✅ Elemento encontrado: selectedCharacter1v1
✅ Elemento encontrado: selectedEnemy1v1
✅ Elemento encontrado: selectedTeam
✅ Elemento encontrado: selectedEnemyTeam

=== INICIANDO BATALLA ===
Modo: 1v1
Personajes seleccionados 1v1: {player: {...}, enemy: {...}}
✅ Validaciones pasadas, iniciando batalla...
Configurando botón 1v1...
Creando batalla 1v1 con: {hero1Id: 1, hero2Id: 2}
Respuesta de batalla 1v1: {id: "123", ...}
Battle ID obtenido: 123
Mostrando pantalla de batalla...
Cargando estado de batalla...
```

### ❌ **Logs de Error Comunes**

#### **Error de Elementos del DOM**
```
❌ Elemento crítico no encontrado: startBattleBtn1v1
❌ Elemento crítico no encontrado: selectedCharacter1v1
```
**Solución**: Verificar que el HTML esté correctamente cargado

#### **Error de Validación**
```
❌ Validación 1v1 falló
❌ Validación 3v3 falló
```
**Solución**: Asegurarse de seleccionar personajes para ambos equipos

#### **Error de API**
```
❌ Error en batalla 1v1: HTTP 401: Unauthorized
❌ Error en batalla 1v1: HTTP 400: Bad Request
```
**Solución**: Verificar autenticación y formato de datos

## 🎮 Pasos de Prueba Específicos

### **Prueba 1: Verificación de Elementos**
1. Abre `index.html`
2. Abre la consola (`F12`)
3. Recarga la página
4. Busca los logs de verificación de elementos
5. **Reporta**: ¿Todos los elementos están encontrados?

### **Prueba 2: Selección de Personajes**
1. Inicia sesión
2. Selecciona modo 1v1
3. Selecciona **DOS** personajes (uno para cada lado)
4. **Reporta**: ¿El botón "Iniciar Batalla" se habilita?

### **Prueba 3: Inicio de Batalla**
1. Con personajes seleccionados, haz clic en "Iniciar Batalla"
2. **Reporta**: ¿Qué logs aparecen en la consola?

### **Prueba 4: Panel de Debug**
1. Abre `debug_battle.html`
2. Prueba cada función del panel
3. **Reporta**: ¿Cuál es el resultado de cada prueba?

## 🔍 Posibles Causas del Problema

### 1. **Elementos del DOM no Encontrados**
- **Causa**: HTML no cargado correctamente
- **Síntoma**: Logs de "Elemento crítico no encontrado"
- **Solución**: Verificar que `index.html` esté completo

### 2. **Validaciones Fallando**
- **Causa**: No se seleccionaron personajes correctamente
- **Síntoma**: "Validación 1v1/3v3 falló"
- **Solución**: Asegurar selección de ambos equipos

### 3. **Error de Autenticación**
- **Causa**: Token JWT inválido o expirado
- **Síntoma**: HTTP 401 en llamadas a la API
- **Solución**: Volver a iniciar sesión

### 4. **Error de API**
- **Causa**: Formato de datos incorrecto
- **Síntoma**: HTTP 400 en llamadas a la API
- **Solución**: Verificar estructura de datos enviados

### 5. **Error de Red**
- **Causa**: API no disponible
- **Síntoma**: Error de conexión
- **Solución**: Verificar que la API esté funcionando

## 📋 Checklist de Verificación

### ✅ **Antes de Probar**
- [ ] Consola del navegador abierta
- [ ] Archivo `index.html` cargado correctamente
- [ ] Usuario autenticado (token presente)
- [ ] Personajes cargados desde la API

### ✅ **Durante la Prueba**
- [ ] Elementos del DOM encontrados
- [ ] Personajes seleccionados correctamente
- [ ] Botón de batalla habilitado
- [ ] Logs de inicio de batalla aparecen
- [ ] Respuesta de API exitosa

### ✅ **Después de la Prueba**
- [ ] Pantalla de batalla mostrada
- [ ] Estado de batalla cargado
- [ ] Controles de batalla funcionando

## 🚨 Reporte de Problemas

Si encuentras un problema, incluye:

1. **Logs de la consola** (copiar y pegar)
2. **Pasos exactos** que seguiste
3. **Resultado esperado** vs **resultado obtenido**
4. **Navegador y versión** que estás usando
5. **Captura de pantalla** si es relevante

## 🎯 Comandos Útiles para Debug

### **En la Consola del Navegador**
```javascript
// Verificar elementos del DOM
console.log(document.getElementById('startBattleBtn1v1'));
console.log(document.getElementById('selectedCharacter1v1'));

// Verificar estado del juego
console.log(window.gameInstance);

// Verificar localStorage
console.log(localStorage.getItem('authToken'));
console.log(localStorage.getItem('currentUser'));

// Probar llamada a API directamente
fetch('https://pelea.onrender.com/api/personajes/public')
  .then(response => response.json())
  .then(data => console.log(data));
```

---

**¡Con estos pasos podremos identificar exactamente dónde está el problema! 🕵️‍♂️** 