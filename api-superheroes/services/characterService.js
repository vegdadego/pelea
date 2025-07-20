import Character from '../models/characterModel.js';

async function getAllCharacters() {
    return await Character.find();
}

async function getCharacterById(id) {
    const character = await Character.findById(id);
    if (!character) throw new Error('Personaje no encontrado');
    return character;
}

async function addCharacter(character) {
    if (!character.nombre || !character.alias || !character.tipo) {
        throw new Error('El personaje debe tener nombre, alias y tipo.');
    }
    const newCharacter = new Character(character);
    await newCharacter.save();
    return newCharacter;
}

async function updateCharacter(id, updatedCharacter) {
    const character = await Character.findById(id);
    if (!character) throw new Error('Personaje no encontrado');
    delete updatedCharacter.id;
    Object.assign(character, updatedCharacter);
    await character.save();
    return character;
}

async function deleteCharacter(id) {
    const character = await Character.findById(id);
    if (!character) throw new Error('Personaje no encontrado');
    await character.deleteOne();
    return { message: 'Personaje eliminado' };
}

async function getCharactersByType(tipo) {
    const characters = await Character.find();
    return characters.filter(c => c.tipo === tipo);
}

export default {
    getAllCharacters,
    getCharacterById,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    getCharactersByType
}; 