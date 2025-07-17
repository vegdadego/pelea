import fs from 'fs-extra';
import Character from '../models/characterModel.js';

const filePath = './data/personajes.json';

async function getCharacters() {
    try {
        const data = await fs.readJson(filePath);
        return data.map(p => new Character(
            p.id, p.nombre, p.alias, p.tipo, p.ciudad, p.equipo, p.stats
        ));
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeJson(filePath, characters);
    } catch (error) {
        console.error(error);
    }
}

export default {
    getCharacters,
    saveCharacters
}; 