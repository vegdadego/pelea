import fs from 'fs-extra';

const filePath = './data/batallas.json';

async function getBattles() {
    try {
        return await fs.readJson(filePath);
    } catch (error) {
        return [];
    }
}

async function saveBattles(battles) {
    await fs.writeJson(filePath, battles);
}

// Obtener todas las batallas (para admin)
async function getAllBattles() {
    try {
        return await fs.readJson(filePath);
    } catch (error) {
        return [];
    }
}

// Obtener batallas por usuario
async function getBattlesByUserId(userId) {
    try {
        const battles = await fs.readJson(filePath);
        return battles.filter(battle => battle.userId === userId);
    } catch (error) {
        return [];
    }
}

export default {
    getBattles,
    saveBattles,
    getAllBattles,
    getBattlesByUserId
}; 