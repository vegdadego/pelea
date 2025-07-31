import mongoose from 'mongoose';
import User from './models/userModel.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUser() {
    try {
        console.log('🔍 Conectando a MongoDB...');
        
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas');
        
        // Verificar si ya existe el usuario de prueba
        const existingUser = await User.findOne({ user: 'testuser' });
        
        if (existingUser) {
            console.log('✅ Usuario de prueba ya existe');
            console.log('👤 Usuario: testuser');
            console.log('🔑 Contraseña: 123456');
        } else {
            console.log('🛠️ Creando usuario de prueba...');
            
            // Crear usuario de prueba
            const hashedPassword = await bcrypt.hash('123456', 10);
            const newUser = new User({
                user: 'testuser',
                password: hashedPassword,
                nombre: 'Usuario de Prueba'
            });
            
            await newUser.save();
            console.log('✅ Usuario de prueba creado exitosamente');
            console.log('👤 Usuario: testuser');
            console.log('🔑 Contraseña: 123456');
        }
        
        // Mostrar todos los usuarios
        const allUsers = await User.find({}, { password: 0 });
        console.log('\n📋 Usuarios en la base de datos:');
        allUsers.forEach(user => {
            console.log(`- ${user.user} (${user.nombre})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
    }
}

createTestUser(); 