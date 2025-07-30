import mongoose from 'mongoose';
import User from './models/userModel.js';
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

async function checkAdminUser() {
    try {
        console.log('🔍 Verificando usuario admin...');
        
        const adminUser = await User.findOne({ user: 'vegdadego' });
        
        if (adminUser) {
            console.log('✅ Usuario admin encontrado:');
            console.log(`   - Usuario: ${adminUser.user}`);
            console.log(`   - Nombre: ${adminUser.nombre}`);
            console.log(`   - ID: ${adminUser._id}`);
        } else {
            console.log('❌ Usuario admin NO encontrado');
            console.log('📝 Creando usuario admin...');
            
            const newAdminUser = new User({
                user: 'vegdadego',
                password: 'admin123', // Contraseña por defecto
                nombre: 'Administrador',
                email: 'admin@digimon.com'
            });
            
            await newAdminUser.save();
            console.log('✅ Usuario admin creado exitosamente');
        }
        
        // Mostrar todos los usuarios
        const allUsers = await User.find({}, { password: 0 });
        console.log('\n📊 Usuarios en la base de datos:');
        allUsers.forEach(user => {
            console.log(`   - ${user.user} (${user.nombre})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function main() {
    await connectDB();
    await checkAdminUser();
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
}

main(); 