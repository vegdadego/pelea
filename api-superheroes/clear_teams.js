import mongoose from 'mongoose';
import Team from './models/teamModel.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

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

// Función para vaciar todos los equipos
async function clearAllTeams() {
    try {
        console.log('🗑️  Iniciando proceso de limpieza de equipos...');
        
        // Contar equipos antes de eliminar
        const countBefore = await Team.countDocuments();
        console.log(`📊 Equipos encontrados: ${countBefore}`);
        
        if (countBefore === 0) {
            console.log('ℹ️  No hay equipos para eliminar');
            return;
        }
        
        // Eliminar todos los equipos
        const result = await Team.deleteMany({});
        
        console.log(`✅ Proceso completado:`);
        console.log(`   - Equipos eliminados: ${result.deletedCount}`);
        console.log(`   - Equipos restantes: 0`);
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error.message);
    }
}

// Función principal
async function main() {
    console.log('🚀 Iniciando script de limpieza de equipos...\n');
    
    await connectDB();
    await clearAllTeams();
    
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