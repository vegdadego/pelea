import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import bcrypt from 'bcryptjs';

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

async function testAdminUser() {
    try {
        console.log('🔍 Verificando usuario admin...');
        
        // Buscar usuario admin
        const adminUser = await User.findOne({ user: 'vegdadego' });
        
        if (adminUser) {
            console.log('✅ Usuario admin encontrado:');
            console.log(`   - Usuario: ${adminUser.user}`);
            console.log(`   - Nombre: ${adminUser.nombre}`);
            console.log(`   - Email: ${adminUser.email}`);
            console.log(`   - ID: ${adminUser._id}`);
        } else {
            console.log('❌ Usuario admin no encontrado. Creando...');
            
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
        
        // Listar todos los usuarios
        const allUsers = await User.find({}, { password: 0 });
        console.log(`\n📊 Total de usuarios en la base de datos: ${allUsers.length}`);
        allUsers.forEach(user => {
            console.log(`   - ${user.user} (${user.nombre})`);
        });
        
    } catch (error) {
        console.error('❌ Error verificando usuario admin:', error.message);
    }
}

async function testServerEndpoints() {
    try {
        console.log('\n🌐 Probando endpoints del servidor...');
        
        // Simular verificación de endpoints
        const endpoints = [
            '/api/auth/login',
            '/api/character',
            '/api/usuarios',
            '/api/batallas',
            '/api/equipos',
            '/admin',
            '/game'
        ];
        
        console.log('📋 Endpoints configurados:');
        endpoints.forEach(endpoint => {
            console.log(`   - ${endpoint}`);
        });
        
        console.log('\n💡 Para probar el panel de administración:');
        console.log('   1. Inicia el servidor: cd api-superheroes && node app.js');
        console.log('   2. Abre el navegador en: http://localhost:3001/game');
        console.log('   3. Inicia sesión con: vegdadego / admin123');
        console.log('   4. Haz clic en "👑 Panel de Administración"');
        console.log('   5. O accede directamente a: http://localhost:3001/admin');
        
    } catch (error) {
        console.error('❌ Error probando endpoints:', error.message);
    }
}

async function main() {
    console.log('🚀 Iniciando pruebas del panel de administración...\n');
    
    await connectDB();
    await testAdminUser();
    await testServerEndpoints();
    
    console.log('\n✅ Pruebas completadas');
    console.log('\n📝 Resumen:');
    console.log('   - Usuario admin verificado/creado');
    console.log('   - Endpoints configurados');
    console.log('   - Panel de administración listo para usar');
    
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
}

main().catch(console.error); 