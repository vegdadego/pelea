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

export default {
    getBattles,
    saveBattles
}; 