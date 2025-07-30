import mongoose from 'mongoose';
import Character from './models/characterModel.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Datos de los personajes de Digimon con ataques
const digimonCharacters = [
  {
    "id": 1,
    "nombre": "Agumon",
    "alias": "El Valiente",
    "tipo": "heroe",
    "ciudad": "Archivo",
    "equipo": "Equipo Fuego",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 30,
      "defense": 20,
      "speed": 25
    },
    "ataques": {
      "normal": "Garra Férrea",
      "especial": "Llama Bebé",
      "ultimate": "Gran Flama Evolutiva"
    }
  },
  {
    "id": 2,
    "nombre": "Gabumon",
    "alias": "El Leal",
    "tipo": "heroe",
    "ciudad": "Bosque Helado",
    "equipo": "Equipo Hielo",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 28,
      "defense": 22,
      "speed": 25
    },
    "ataques": {
      "normal": "Zarpazo Ártico",
      "especial": "Fuego Azul",
      "ultimate": "Llama de Lobo"
    }
  },
  {
    "id": 3,
    "nombre": "Patamon",
    "alias": "El Volador",
    "tipo": "heroe",
    "ciudad": "Cielos Nube",
    "equipo": "Equipo Cielo",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 22,
      "defense": 18,
      "speed": 35
    },
    "ataques": {
      "normal": "Vuelo Picado",
      "especial": "Aire Explosivo",
      "ultimate": "Golpe del Juicio"
    }
  },
  {
    "id": 4,
    "nombre": "Gatomon",
    "alias": "La Ágil",
    "tipo": "heroe",
    "ciudad": "Ruinas Lunares",
    "equipo": "Equipo Luz",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 26,
      "defense": 22,
      "speed": 30
    },
    "ataques": {
      "normal": "Golpe Felino",
      "especial": "Garra Relámpago",
      "ultimate": "Anillo de la Reina"
    }
  },
  {
    "id": 5,
    "nombre": "Tentomon",
    "alias": "El Eléctrico",
    "tipo": "heroe",
    "ciudad": "Selva Tronadora",
    "equipo": "Equipo Bicho",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 25,
      "defense": 25,
      "speed": 20
    },
    "ataques": {
      "normal": "Antena Golpeadora",
      "especial": "Rayo Súbito",
      "ultimate": "Tormenta Megaelectro"
    }
  },
  {
    "id": 6,
    "nombre": "Palmon",
    "alias": "La Serena",
    "tipo": "heroe",
    "ciudad": "Valle Florido",
    "equipo": "Equipo Planta",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 24,
      "defense": 26,
      "speed": 20
    },
    "ataques": {
      "normal": "Látigo Floral",
      "especial": "Esporas Venenosas",
      "ultimate": "Flor Destructor"
    }
  },
  {
    "id": 7,
    "nombre": "Biyomon",
    "alias": "La Fénix",
    "tipo": "heroe",
    "ciudad": "Pico Ígneo",
    "equipo": "Equipo Viento",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 26,
      "defense": 20,
      "speed": 28
    },
    "ataques": {
      "normal": "Pico Cortante",
      "especial": "Torbellino de Fuego",
      "ultimate": "Ave Flamígera"
    }
  },
  {
    "id": 8,
    "nombre": "Gomamon",
    "alias": "El Marino",
    "tipo": "heroe",
    "ciudad": "Costa Helada",
    "equipo": "Equipo Agua",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 24,
      "defense": 22,
      "speed": 24
    },
    "ataques": {
      "normal": "Mordisco Marino",
      "especial": "Oleaje Cortante",
      "ultimate": "Tsunami Ártico"
    }
  },
  {
    "id": 9,
    "nombre": "Veemon",
    "alias": "El Impulsivo",
    "tipo": "heroe",
    "ciudad": "Arena Sagrada",
    "equipo": "Equipo Valor",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 32,
      "defense": 20,
      "speed": 23
    },
    "ataques": {
      "normal": "Puñetazo Vee",
      "especial": "V-Impacto",
      "ultimate": "Golpe Final Extremo"
    }
  },
  {
    "id": 10,
    "nombre": "Wormmon",
    "alias": "El Silencioso",
    "tipo": "heroe",
    "ciudad": "Bosque Denso",
    "equipo": "Equipo Insecto",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 22,
      "defense": 25,
      "speed": 22
    },
    "ataques": {
      "normal": "Zancada Sigilosa",
      "especial": "Látigo de Telaraña",
      "ultimate": "Cañón Destructor Insecto"
    }
  },
  {
    "id": 11,
    "nombre": "Hawkmon",
    "alias": "El Centinela",
    "tipo": "heroe",
    "ciudad": "Templo del Cielo",
    "equipo": "Equipo Alas",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 26,
      "defense": 20,
      "speed": 27
    },
    "ataques": {
      "normal": "Golpe de Ala",
      "especial": "Disparo de Pluma",
      "ultimate": "Cóndor Destructor"
    }
  },
  {
    "id": 12,
    "nombre": "Armadillomon",
    "alias": "El Rudo",
    "tipo": "heroe",
    "ciudad": "Montaña Grava",
    "equipo": "Equipo Tierra",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 24,
      "defense": 30,
      "speed": 15
    },
    "ataques": {
      "normal": "Rodillazo Rígido",
      "especial": "Excavación Letal",
      "ultimate": "Armadura de Tierra Absoluta"
    }
  },
  {
    "id": 13,
    "nombre": "Terriermon",
    "alias": "El Calmado",
    "tipo": "heroe",
    "ciudad": "Pradera Verde",
    "equipo": "Equipo Eco",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 24,
      "defense": 24,
      "speed": 22
    },
    "ataques": {
      "normal": "Oreja Giratoria",
      "especial": "Ráfaga Espiral",
      "ultimate": "Trueno de la Doble Espiral"
    }
  },
  {
    "id": 14,
    "nombre": "Renamon",
    "alias": "La Mística",
    "tipo": "heroe",
    "ciudad": "Bosque Niebla",
    "equipo": "Equipo Espíritu",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 28,
      "defense": 20,
      "speed": 28
    },
    "ataques": {
      "normal": "Golpe Sombrío",
      "especial": "Llama de Zorra",
      "ultimate": "Explosión Diamante"
    }
  },
  {
    "id": 15,
    "nombre": "Impmon",
    "alias": "El Travieso",
    "tipo": "villano",
    "ciudad": "Red Oscura",
    "equipo": "Caos Menor",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 30,
      "defense": 18,
      "speed": 27
    },
    "ataques": {
      "normal": "Lanzallamas Travieso",
      "especial": "Bola Oscura",
      "ultimate": "Fuego del Caos"
    }
  },
  {
    "id": 16,
    "nombre": "DemiDevimon",
    "alias": "El Sombra",
    "tipo": "villano",
    "ciudad": "Valle Tenebroso",
    "equipo": "Alas del Caos",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 25,
      "defense": 16,
      "speed": 30
    },
    "ataques": {
      "normal": "Picotazo Venenoso",
      "especial": "Ala Sombría",
      "ultimate": "Maldición Lunar"
    }
  },
  {
    "id": 17,
    "nombre": "BlackAgumon",
    "alias": "El Renegado",
    "tipo": "villano",
    "ciudad": "Cráter Abismo",
    "equipo": "Llamas Negras",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 32,
      "defense": 20,
      "speed": 22
    },
    "ataques": {
      "normal": "Garra Negra",
      "especial": "Llama Oscura",
      "ultimate": "Explosión Infernal"
    }
  },
  {
    "id": 18,
    "nombre": "Lopmon",
    "alias": "El Silente",
    "tipo": "heroe",
    "ciudad": "Montaña Hueca",
    "equipo": "Equipo Dual",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 22,
      "defense": 25,
      "speed": 22
    },
    "ataques": {
      "normal": "Orejas Látigo",
      "especial": "Lluvia de Energía",
      "ultimate": "Juicio Dual"
    }
  },
  {
    "id": 19,
    "nombre": "Salamon",
    "alias": "La Esperanza",
    "tipo": "heroe",
    "ciudad": "Santuario Claro",
    "equipo": "Equipo Esperanza",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 24,
      "defense": 20,
      "speed": 26
    },
    "ataques": {
      "normal": "Mordida Celestial",
      "especial": "Luz Purificadora",
      "ultimate": "Rugido de la Esperanza"
    }
  },
  {
    "id": 20,
    "nombre": "Elecmon",
    "alias": "El Cargado",
    "tipo": "heroe",
    "ciudad": "Cañón Voltio",
    "equipo": "Equipo Rayo",
    "stats": {
      "health": 100,
      "maxHealth": 100,
      "attack": 27,
      "defense": 21,
      "speed": 25
    },
    "ataques": {
      "normal": "Zarpazo Estático",
      "especial": "Descarga Voltaica",
      "ultimate": "Rayo del Trueno Alfa"
    }
  }
];

// Función para conectar a MongoDB
async function connectDB() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/superheroes';
        await mongoose.connect(mongoURI);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
}

// Función para insertar los personajes
async function insertCharacters() {
    try {
        console.log('🚀 Iniciando inserción de personajes Digimon con ataques...\n');
        
        // Contar personajes existentes
        const countBefore = await Character.countDocuments();
        console.log(`📊 Personajes existentes: ${countBefore}`);
        
        // Verificar si ya existen personajes con los mismos IDs
        const existingIds = await Character.find({ id: { $in: digimonCharacters.map(c => c.id) } }).select('id');
        const existingIdSet = new Set(existingIds.map(c => c.id));
        
        const newCharacters = digimonCharacters.filter(char => !existingIdSet.has(char.id));
        
        if (newCharacters.length === 0) {
            console.log('ℹ️  Todos los personajes ya existen en la base de datos');
            return;
        }
        
        console.log(`📝 Personajes nuevos a insertar: ${newCharacters.length}`);
        
        // Insertar los personajes
        const result = await Character.insertMany(newCharacters);
        
        console.log(`✅ Proceso completado:`);
        console.log(`   - Personajes insertados: ${result.length}`);
        console.log(`   - Total de personajes en BD: ${countBefore + result.length}`);
        
        // Mostrar estadísticas por tipo
        const heroes = newCharacters.filter(c => c.tipo === 'heroe').length;
        const villains = newCharacters.filter(c => c.tipo === 'villano').length;
        
        console.log(`   - Héroes: ${heroes}`);
        console.log(`   - Villanos: ${villains}`);
        
        // Mostrar algunos ejemplos de ataques
        console.log('\n🎯 Ejemplos de ataques agregados:');
        console.log(`   🐉 Agumon: ${newCharacters[0].ataques.normal} / ${newCharacters[0].ataques.especial} / ${newCharacters[0].ataques.ultimate}`);
        console.log(`   🐺 Gabumon: ${newCharacters[1].ataques.normal} / ${newCharacters[1].ataques.especial} / ${newCharacters[1].ataques.ultimate}`);
        console.log(`   😈 Impmon: ${newCharacters[14].ataques.normal} / ${newCharacters[14].ataques.especial} / ${newCharacters[14].ataques.ultimate}`);
        
    } catch (error) {
        console.error('❌ Error durante la inserción:', error.message);
    }
}

// Función principal
async function main() {
    await connectDB();
    await insertCharacters();
    
    console.log('\n🏁 Proceso completado');
    process.exit(0);
}

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Error no manejado:', err);
    process.exit(1);
});

// Ejecutar el script
main(); 