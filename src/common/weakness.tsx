export function getWeakness(types: string[]) {
    const weaknessTable: { [key: string]: string[] } = {
        "normal": ["fighting"],
        "fighting": ["flying", "psychic", "fairy"],
        "flying": ["rock", "electric", "ice"],
        "poison": ["ground", "psychic"],
        "ground": ["water", "grass", "ice"],
        "rock": ["fighting", "ground", "steel", "water", "grass"],
        "bug": ["flying", "rock", "fire"],
        "ghost": ["ghost", "dark"],
        "steel": ["fighting", "ground", "fire"],
        "fire": ["ground", "rock", "water"],
        "water": ["grass", "electric"],
        "grass": ["flying", "poison", "bug", "fire", "ice"],
        "electric": ["ground"],
        "psychic": ["bug", "ghost", "dark", "psychic"],
        "ice": ["fighting", "rock", "steel", "fire"],
        "dragon": ["ice", "dragon", "fairy"],
        "dark": ["fighting", "bug", "fairy"],
        "fairy": ["poison", "steel"]
    }

    const resistanceTable: { [key: string]: string[] } = {
        "normal": ["ghost"],
        "fighting": ["bug", "rock", "dark"],
        "flying": ["fighting", "bug", "grass", "ground"],
        "poison": ["fighting", "poison", "bug", "grass", "fairy"],
        "ground": ["poison", "rock", "electric"],
        "rock": ["normal", "flying", "poison", "fire"],
        "bug": ["fighting", "ground", "grass"],
        "ghost": ["normal", "fighting", "poison", "bug"],
        "steel": ["normal", "flying", "rock", "bug", "steel", "grass", "psychic", "ice", "dragon", "fairy"],
        "fire": ["bug", "steel", "fire", "grass", "ice", "fairy"],
        "water": ["steel", "fire", "water", "ice"],
        "grass": ["ground", "water", "grass", "electric"],
        "electric": ["flying", "steel", "electric"],
        "psychic": ["fighting", "psychic"],
        "ice": ["ice"],
        "dragon": ["fire", "water", "grass", "electric"],
        "dark": ["ghost", "psychic", "dark"],
        "fairy": ["fighting", "bug", "dragon", "dark"]
    };


    let weaknesses:string[] =  []
    // collect all weaknesses
    for (let i = 0; i < types.length; i++) 
        weaknesses.push(...weaknessTable[types[i]])
    
    // remove duplicates
    weaknesses = Array.from(new Set(weaknesses))

    // remove resistances
    // collect all resistances
    let resistances:string[] = []
    for (let i = 0; i < types.length; i++) 
        resistances.push(...resistanceTable[types[i]])
    // remove duplicates
    resistances = Array.from(new Set(resistances))
    // remove resistances from weaknesses
    weaknesses = weaknesses.filter(type => !resistances.includes(type))

    return weaknesses;
}