import fs from 'fs-extra';

const filePath = './data/equipos.json';

async function getTeams() {
    try {
        return await fs.readJson(filePath);
    } catch (error) {
        return [];
    }
}

async function saveTeams(teams) {
    await fs.writeJson(filePath, teams);
}

export default {
    getTeams,
    saveTeams
}; 