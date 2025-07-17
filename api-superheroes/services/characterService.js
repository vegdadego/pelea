import characterRepository from '../repositories/characterRepository.js';

async function getAllCharacters() {
    return await characterRepository.getCharacters();
}

async function getCharacterById(id) {
    const characters = await characterRepository.getCharacters();
    const character = characters.find(c => c.id === parseInt(id));
    if (!character) throw new Error('Personaje no encontrado');
    return character;
}

async function addCharacter(character) {
    if (!character.nombre || !character.alias || !character.tipo) {
        throw new Error('El personaje debe tener nombre, alias y tipo.');
    }
    const characters = await characterRepository.getCharacters();
    const newId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) + 1 : 1;
    const newCharacter = { ...character, id: newId };
    characters.push(newCharacter);
    await characterRepository.saveCharacters(characters);
    return newCharacter;
}

async function updateCharacter(id, updatedCharacter) {
    const characters = await characterRepository.getCharacters();
    const index = characters.findIndex(c => c.id === parseInt(id));
    if (index === -1) throw new Error('Personaje no encontrado');
    delete updatedCharacter.id;
    characters[index] = { ...characters[index], ...updatedCharacter };
    await characterRepository.saveCharacters(characters);
    return characters[index];
}

async function deleteCharacter(id) {
    const characters = await characterRepository.getCharacters();
    const index = characters.findIndex(c => c.id === parseInt(id));
    if (index === -1) throw new Error('Personaje no encontrado');
    const filtered = characters.filter(c => c.id !== parseInt(id));
    await characterRepository.saveCharacters(filtered);
    return { message: 'Personaje eliminado' };
}

async function getCharactersByType(tipo) {
    const characters = await characterRepository.getCharacters();
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