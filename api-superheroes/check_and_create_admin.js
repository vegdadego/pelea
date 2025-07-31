import mongoose from 'mongoose';
import User from './models/userModel.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndCreateAdmin() {
    try {
        console.log('🔍 Verificando conexión a MongoDB...');
        
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas');
        
        // Verificar si existe el usuario admin
        const adminUser = await User.findOne({ user: 'vegdadego' });
        
        if (adminUser) {
            console.log('✅ Usuario administrador ya existe');
            console.log('👤 Usuario: vegdadego');
            console.log('🔑 Contraseña: admin123');
        } else {
            console.log('❌ Usuario administrador no encontrado');
            console.log('🛠️ Creando usuario administrador...');
            
            // Crear usuario administrador
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newAdmin = new User({
                user: 'vegdadego',
                password: hashedPassword,
                nombre: 'Administrador del Sistema',
                isAdmin: true
            });
            
            await newAdmin.save();
            console.log('✅ Usuario administrador creado exitosamente');
            console.log('👤 Usuario: vegdadego');
            console.log('🔑 Contraseña: admin123');
        }
        
        // Mostrar todos los usuarios
        const allUsers = await User.find({}, { password: 0 });
        console.log('\n📋 Usuarios en la base de datos:');
        allUsers.forEach(user => {
            console.log(`- ${user.user} (${user.nombre})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n🔧 Posibles soluciones:');
        console.log('1. Verifica que tienes un archivo .env con MONGODB_URI');
        console.log('2. Verifica que la URL de MongoDB Atlas es correcta');
        console.log('3. Verifica que tienes conexión a internet');
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
    }
}

checkAndCreateAdmin(); 