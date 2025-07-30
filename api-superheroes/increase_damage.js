import mongoose from 'mongoose';
import Character from './models/characterModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
}

async function increaseDamage() {
    try {
        console.log('⚔️  Aumentando daño de personajes...\n');
        
        // Obtener todos los personajes
        const characters = await Character.find({});
        console.log(`📊 Total de personajes encontrados: ${characters.length}`);
        
        let updatedCount = 0;
        
        for (const character of characters) {
            // Aumentar el ataque significativamente
            const newAttack = Math.floor(character.stats.attack * 2.5); // Aumentar 2.5x
            
            // Actualizar el personaje
            const result = await Character.updateOne(
                { _id: character._id },
                { 
                    $set: { 
                        'stats.attack': newAttack 
                    } 
                }
            );
            
            if (result.modifiedCount > 0) {
                updatedCount++;
                console.log(`✅ ${character.nombre}: Ataque ${character.stats.attack} → ${newAttack}`);
            }
        }
        
        console.log(`\n📊 Resumen:`);
        console.log(`   - Personajes actualizados: ${updatedCount}`);
        console.log(`   - Daño aumentado 2.5x en todos los personajes`);
        
        // Mostrar algunos ejemplos
        console.log('\n🎯 Ejemplos de daño actualizado:');
        const sampleCharacters = await Character.find({}).limit(5);
        sampleCharacters.forEach(char => {
            console.log(`   - ${char.nombre}: ${char.stats.attack} de ataque`);
        });
        
    } catch (error) {
        console.error('❌ Error durante la actualización:', error.message);
    }
}

async function main() {
    await connectDB();
    await increaseDamage();
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
}

main(); 