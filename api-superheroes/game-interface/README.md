# 🎮 Superhéroes Battle - Interfaz Web

## 🌐 Descripción

Interfaz web completa para el juego de combate por turnos **Superhéroes Battle**. Esta aplicación interactúa directamente con tu API desplegada en [https://pelea.onrender.com](https://pelea.onrender.com) para crear una experiencia de juego completa y funcional.

## 🚀 Características

### ✅ **Funcionalidades Principales**
- **Pantalla de Inicio**: Interfaz atractiva con instrucciones del juego
- **Selección de Personajes**: Carga dinámica de personajes desde la API
- **Sistema de Combate**: Batallas 1v1 con turnos alternados
- **Movimientos Estratégicos**: 3 tipos de ataques (Normal, Especial, Ultimate)
- **Barras de Salud**: Visualización dinámica con efectos visuales
- **Log de Batalla**: Registro detallado de todas las acciones
- **Diseño Responsive**: Funciona en desktop, tablet y móvil

### 🎨 **Interfaz de Usuario**
- **Diseño Moderno**: Gradientes, animaciones y efectos visuales
- **Colores Dinámicos**: Barras de salud que cambian según el estado
- **Animaciones Suaves**: Transiciones fluidas entre pantallas
- **Feedback Visual**: Indicadores de turno y selección
- **Scrollbar Personalizado**: Mejor experiencia de usuario

### 🔧 **Integración con API**
- **Autenticación Automática**: Login automático con credenciales admin
- **Carga Dinámica**: Personajes cargados desde `/personajes`
- **Creación de Batallas**: Batallas 1v1 automáticas
- **Ejecución de Acciones**: Ataques en tiempo real
- **Estado en Tiempo Real**: Actualización continua del estado de batalla

## 📁 Estructura de Archivos

```
game-interface/
├── index.html          # Página principal del juego
├── styles.css          # Estilos CSS completos
├── game.js             # Lógica del juego (JavaScript)
└── README.md           # Esta documentación
```

## 🎯 Cómo Usar

### **1. Abrir el Juego**
```bash
# Navegar al directorio
cd api-superheroes/game-interface

# Abrir en el navegador
# Opción A: Doble clic en index.html
# Opción B: Servidor local
python -m http.server 8000
# Luego abrir: http://localhost:8000
```

### **2. Flujo de Juego**

#### **Paso 1: Inicio**
- Presiona "🚀 Comenzar Juego"
- El juego se conectará automáticamente a tu API
- Verás un mensaje de confirmación en el log

#### **Paso 2: Selección de Personaje**
- Se cargarán todos los personajes disponibles
- Haz clic en el personaje que quieras usar
- Verás las estadísticas completas (HP, ATK, DEF, SPD)
- Presiona "⚔️ Iniciar Batalla"

#### **Paso 3: Combate**
- Se creará una batalla 1v1 automáticamente
- El enemigo se seleccionará aleatoriamente
- Verás las barras de salud de ambos personajes
- Selecciona tu movimiento y presiona "⚔️ Realizar Ataque"

#### **Paso 4: Continuar Batalla**
- Los turnos alternarán automáticamente
- El log mostrará todos los ataques y daños
- La batalla terminará cuando un personaje llegue a 0 HP

## 🎮 Tipos de Movimientos

### **1. Ataque Normal**
- Daño base del personaje
- Alta precisión
- Sin efectos especiales

### **2. Ataque Especial**
- Daño aumentado
- Menor precisión
- Efectos especiales ocasionales

### **3. Ataque Ultimate**
- Máximo daño posible
- Baja precisión
- Efectos especiales garantizados

## 🎨 Personalización

### **Colores y Temas**
Los colores se pueden personalizar editando las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #ff6b6b;      /* Color principal */
    --secondary-color: #ee5a24;    /* Color secundario */
    --accent-color: #4299e1;       /* Color de acento */
    --success-color: #48bb78;      /* Color de éxito */
    --warning-color: #f56565;      /* Color de advertencia */
}
```

### **Animaciones**
El juego incluye varias animaciones que se pueden modificar:

```css
/* Animación de entrada */
.fade-in {
    animation: fadeIn 0.6s ease-in;
}

/* Animación de selección */
.character-card.selected {
    transform: scale(1.02);
}

/* Animación de salud crítica */
.health-fill.critical {
    animation: critical 0.5s ease-in-out infinite;
}
```

## 🔧 Configuración Avanzada

### **Cambiar URL de la API**
Si necesitas cambiar la URL de la API, edita en `game.js`:

```javascript
class SuperheroesBattle {
    constructor() {
        this.API_BASE_URL = 'https://tu-api.com/api'; // Cambiar aquí
        // ...
    }
}
```

### **Modificar Credenciales**
Para cambiar las credenciales de login, edita en `game.js`:

```javascript
const loginData = await this.apiCall('/auth/login', 'POST', {
    user: 'tu-usuario',        // Cambiar usuario
    password: 'tu-password'    // Cambiar contraseña
});
```

### **Agregar Nuevos Movimientos**
Para agregar más tipos de movimientos, edita en `index.html`:

```html
<div class="moves-grid">
    <button class="move-btn" data-move="normal">Ataque Normal</button>
    <button class="move-btn" data-move="especial">Ataque Especial</button>
    <button class="move-btn" data-move="ultimate">Ataque Ultimate</button>
    <button class="move-btn" data-move="nuevo">Nuevo Movimiento</button> <!-- Agregar aquí -->
</div>
```

## 🐛 Troubleshooting

### **Error: "No se puede conectar a la API"**
1. Verifica que tu API esté activa en Render
2. Comprueba la URL en `game.js`
3. Revisa las credenciales de login

### **Error: "No se cargan los personajes"**
1. Verifica que tengas personajes en la base de datos
2. Comprueba que el endpoint `/personajes` funcione
3. Revisa la autenticación

### **Error: "No se puede crear batalla"**
1. Verifica que los IDs de personajes existan
2. Comprueba que el endpoint `/battles/1v1` funcione
3. Revisa el formato de datos enviado

### **Problemas de Rendimiento**
1. Verifica la conexión a internet
2. Comprueba que la API responda rápidamente
3. Considera implementar caché local

## 📱 Compatibilidad

### **Navegadores Soportados**
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### **Dispositivos**
- ✅ Desktop (1920x1080, 1366x768)
- ✅ Tablet (768x1024, 1024x768)
- ✅ Móvil (375x667, 414x896)

## 🚀 Despliegue

### **Opción 1: Servidor Local**
```bash
cd game-interface
python -m http.server 8000
# Abrir: http://localhost:8000
```

### **Opción 2: GitHub Pages**
1. Sube los archivos a un repositorio de GitHub
2. Activa GitHub Pages en la configuración
3. El juego estará disponible en `https://tu-usuario.github.io/repo`

### **Opción 3: Netlify/Vercel**
1. Sube los archivos a GitHub
2. Conecta con Netlify o Vercel
3. Despliegue automático en cada commit

## 🎯 Casos de Uso

### **1. Testing de la API**
- Usa el juego para probar todos los endpoints
- Verifica el flujo completo de batallas
- Comprueba la integridad de los datos

### **2. Demostración**
- Muestra el juego a otros desarrolladores
- Presenta las capacidades de tu API
- Ilustra la funcionalidad completa

### **3. Desarrollo**
- Usa como base para nuevas características
- Implementa mejoras en la interfaz
- Agrega nuevas funcionalidades

## 🔮 Próximas Mejoras

### **Funcionalidades Planificadas**
- [ ] Batallas entre equipos (3v3)
- [ ] Sistema de niveles y experiencia
- [ ] Efectos de sonido
- [ ] Modo multijugador
- [ ] Historial de batallas
- [ ] Estadísticas de jugador

### **Mejoras de UI/UX**
- [ ] Temas oscuro/claro
- [ ] Más animaciones
- [ ] Efectos de partículas
- [ ] Modo pantalla completa
- [ ] Controles de teclado

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la consola del navegador (F12)
2. Verifica que la API esté funcionando
3. Comprueba la conectividad de red
4. Revisa los logs del juego

---

**¡Disfruta jugando con tu API de Superhéroes! 🦸‍♂️**

**URL de tu API**: [https://pelea.onrender.com](https://pelea.onrender.com) 