import mongoose from 'mongoose';
import User from './models/userModel.js';
import bcrypt from 'bcryptjs';
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

async function createAdminUser() {
    try {
        console.log('🔍 Verificando usuario admin...');
        
        // Verificar si el usuario ya existe
        let adminUser = await User.findOne({ user: 'vegdadego' });
        
        if (adminUser) {
            console.log('✅ Usuario admin encontrado:');
            console.log(`   - Usuario: ${adminUser.user}`);
            console.log(`   - Nombre: ${adminUser.nombre}`);
            console.log(`   - ID: ${adminUser._id}`);
            
            // Actualizar contraseña si es necesario
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.updateOne(
                { user: 'vegdadego' },
                { password: hashedPassword }
            );
            console.log('✅ Contraseña actualizada');
        } else {
            console.log('📝 Creando usuario admin...');
            
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newAdminUser = new User({
                user: 'vegdadego',
                password: hashedPassword,
                nombre: 'Administrador',
                email: 'admin@digimon.com'
            });
            
            await newAdminUser.save();
            console.log('✅ Usuario admin creado exitosamente');
        }
        
        // Mostrar credenciales
        console.log('\n🔑 Credenciales del Admin:');
        console.log('   - Usuario: vegdadego');
        console.log('   - Contraseña: admin123');
        
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
    await createAdminUser();
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
}

main(); 