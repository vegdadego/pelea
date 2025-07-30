import mongoose from 'mongoose';
import Character from './models/characterModel.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Datos de ataques por personaje
const ataquesPorPersonaje = {
  1: { // Agumon
    normal: "Garra Férrea",
    especial: "Llama Bebé",
    ultimate: "Gran Flama Evolutiva"
  },
  2: { // Gabumon
    normal: "Zarpazo Ártico",
    especial: "Fuego Azul",
    ultimate: "Llama de Lobo"
  },
  3: { // Patamon
    normal: "Vuelo Picado",
    especial: "Aire Explosivo",
    ultimate: "Golpe del Juicio"
  },
  4: { // Gatomon
    normal: "Golpe Felino",
    especial: "Garra Relámpago",
    ultimate: "Anillo de la Reina"
  },
  5: { // Tentomon
    normal: "Antena Golpeadora",
    especial: "Rayo Súbito",
    ultimate: "Tormenta Megaelectro"
  },
  6: { // Palmon
    normal: "Látigo Floral",
    especial: "Esporas Venenosas",
    ultimate: "Flor Destructor"
  },
  7: { // Biyomon
    normal: "Pico Cortante",
    especial: "Torbellino de Fuego",
    ultimate: "Ave Flamígera"
  },
  8: { // Gomamon
    normal: "Mordisco Marino",
    especial: "Oleaje Cortante",
    ultimate: "Tsunami Ártico"
  },
  9: { // Veemon
    normal: "Puñetazo Vee",
    especial: "V-Impacto",
    ultimate: "Golpe Final Extremo"
  },
  10: { // Wormmon
    normal: "Zancada Sigilosa",
    especial: "Látigo de Telaraña",
    ultimate: "Cañón Destructor Insecto"
  },
  11: { // Hawkmon
    normal: "Golpe de Ala",
    especial: "Disparo de Pluma",
    ultimate: "Cóndor Destructor"
  },
  12: { // Armadillomon
    normal: "Rodillazo Rígido",
    especial: "Excavación Letal",
    ultimate: "Armadura de Tierra Absoluta"
  },
  13: { // Terriermon
    normal: "Oreja Giratoria",
    especial: "Ráfaga Espiral",
    ultimate: "Trueno de la Doble Espiral"
  },
  14: { // Renamon
    normal: "Golpe Sombrío",
    especial: "Llama de Zorra",
    ultimate: "Explosión Diamante"
  },
  15: { // Impmon
    normal: "Lanzallamas Travieso",
    especial: "Bola Oscura",
    ultimate: "Fuego del Caos"
  },
  16: { // DemiDevimon
    normal: "Picotazo Venenoso",
    especial: "Ala Sombría",
    ultimate: "Maldición Lunar"
  },
  17: { // BlackAgumon
    normal: "Garra Negra",
    especial: "Llama Oscura",
    ultimate: "Explosión Infernal"
  },
  18: { // Lopmon
    normal: "Orejas Látigo",
    especial: "Lluvia de Energía",
    ultimate: "Juicio Dual"
  },
  19: { // Salamon
    normal: "Mordida Celestial",
    especial: "Luz Purificadora",
    ultimate: "Rugido de la Esperanza"
  },
  20: { // Elecmon
    normal: "Zarpazo Estático",
    especial: "Descarga Voltaica",
    ultimate: "Rayo del Trueno Alfa"
  }
};

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

// Función para actualizar los ataques
async function updateAttacks() {
    try {
        console.log('🚀 Iniciando actualización de ataques Digimon...\n');
        
        let updatedCount = 0;
        
        for (const [id, ataques] of Object.entries(ataquesPorPersonaje)) {
            const result = await Character.updateOne(
                { id: parseInt(id) },
                { $set: { ataques: ataques } }
            );
            
            if (result.modifiedCount > 0) {
                updatedCount++;
                const character = await Character.findOne({ id: parseInt(id) });
                console.log(`✅ ${character.nombre}: ${ataques.normal} / ${ataques.especial} / ${ataques.ultimate}`);
            }
        }
        
        console.log(`\n📊 Resumen:`);
        console.log(`   - Personajes actualizados: ${updatedCount}`);
        console.log(`   - Total de ataques agregados: ${updatedCount * 3}`);
        
    } catch (error) {
        console.error('❌ Error durante la actualización:', error.message);
    }
}

// Función principal
async function main() {
    await connectDB();
    await updateAttacks();
    
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