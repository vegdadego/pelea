// ========================================
// SCRIPTS DE AUTENTICACIÓN - POSTMAN
// ========================================

// Función para generar nombres aleatorios
function generateRandomName() {
    const nombres = [
        "Alex", "Sam", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Quinn",
        "Avery", "Blake", "Cameron", "Drew", "Emery", "Finley", "Gray", "Hayden",
        "Indigo", "Jamie", "Kendall", "Logan", "Mason", "Noah", "Oakley", "Parker"
    ];
    const apellidos = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
        "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
        "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"
    ];
    return nombres[Math.floor(Math.random() * nombres.length)] + " " + 
           apellidos[Math.floor(Math.random() * apellidos.length)];
}

// Función para generar usuarios aleatorios
function generateRandomUser() {
    const nombres = ["alex", "sam", "jordan", "taylor", "casey", "morgan", "riley", "quinn"];
    const usuario = nombres[Math.floor(Math.random() * nombres.length)] + 
                   Math.floor(Math.random() * 1000);
    return {
        user: usuario,
        password: "password123",
        nombre: generateRandomName()
    };
}

// Script para el endpoint de registro
function registerUserScript() {
    const userData = generateRandomUser();
    
    pm.request.body.raw = JSON.stringify(userData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Registrando usuario:", userData);
}

// Script para el endpoint de login
function loginUserScript() {
    // Usar credenciales de admin por defecto
    const loginData = {
        user: "vegdadego",
        password: "admin123"
    };
    
    pm.request.body.raw = JSON.stringify(loginData);
    pm.request.headers.add({
        key: "Content-Type",
        value: "application/json"
    });
    
    console.log("Iniciando sesión con:", loginData);
}

// Script para guardar token después del login
function saveTokenScript() {
    if (pm.response.code === 200) {
        const response = pm.response.json();
        if (response.token) {
            pm.collectionVariables.set("authToken", response.token);
            console.log("Token guardado:", response.token.substring(0, 20) + "...");
            
            // Si es admin, guardar también como adminToken
            if (response.user && response.user.user === "vegdadego") {
                pm.collectionVariables.set("adminToken", response.token);
                console.log("Token de admin guardado");
            }
        }
    } else {
        console.log("Error en login:", pm.response.text());
    }
}

// Script para generar datos de prueba
function generateTestData() {
    const testUsers = [];
    for (let i = 0; i < 5; i++) {
        testUsers.push(generateRandomUser());
    }
    
    console.log("Usuarios de prueba generados:", testUsers);
    return testUsers;
}

// Exportar funciones para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateRandomName,
        generateRandomUser,
        registerUserScript,
        loginUserScript,
        saveTokenScript,
        generateTestData
    };
} 