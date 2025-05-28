export const PkmnTypes: string[] = [
  'None',
  'Normal',
  'Fighting',
  'Flying',
  'Poison',
  'Ground',
  'Rock',
  'Bug',
  'Ghost',
  'Steel',
  'Fire',
  'Water',
  'Grass',
  'Electric',
  'Psychic',
  'Ice',
  'Dragon',
  'Dark',
  'Fairy',
];

export const Generations: string[] = [
  'generation-i',
  'generation-ii',
  'generation-iii',
  'generation-iv',
  'generation-v',
  'generation-vi',
  'generation-vii',
  'generation-viii',
  'generation-ix',
];

export const MoveCategories: string[] = [
  'physical',
  'special',
  'status'
]

export const findGeneration = (game: string): number => {
  if (['red', 'blue', 'yellow'].includes(game)) {
    return 1
  }
  else if (['gold', 'silver', 'crystal'].includes(game)) {
    return 2
  }
  else if (['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen', 'colosseum', 'xd'].includes(game)) {
    return 3
  }
  else if (['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'].includes(game)) {
    return 4
  }
  else if (['black', 'white', 'black-2', 'white-2'].includes(game)) {
    return 5
  }
  else if (['x', 'y', 'omega-ruby', 'alpha-sapphire'].includes(game)) {
    return 6
  }
  else if (['sun', 'moon', 'ultra-sun', 'ultra-moon', 'lets-go-pikachu', 'lets-go-eevee'].includes(game)) {
    return 7
  }
  else if (['sword', 'shield', 'the-isle-of-armor', 'the-crown-tundra', 'brilliant-diamond', 'shining-pearl', 'legends-arceus'].includes(game)) {
    return 8
  }
  else if (['scarlet', 'violet', 'the-teal-mask', 'the-indigo-disk'].includes(game)) {
    return 9
  }
  else {
    return 0
  }
}

export const findGenerationByDexID = (id: number): number => {
  if (id >= 1 && id <= 151) {
    return 1
  }
  else if (id >= 152 && id <= 251) {
    return 2
  }
  else if ((id >= 252 && id <= 386) || (id >= 10001 && id <= 10003) || (id >= 10013 && id <= 10015)) {
    return 3
  }
  else if ((id >= 387 && id <= 493) || (id >= 10004 && id <= 10012)) {
    return 4
  }
  else if ((id >= 494 && id <= 649) || (id >= 10016 && id <= 10024)) {
    return 5
  }
  else if ((id >= 650 && id <= 721) || (id >= 10025 && id <= 10090)) {
    return 6
  }
  else if ((id >= 722 && id <= 809) || (id >= 10091 && id <= 10159) || (id === 10181)) {
    return 7
  }
  else if ((id >= 810 && id <= 905) || (id >= 10160 && id <= 10180) || (id >= 10182 && id <= 10249)) {
    return 8
  }
  else if ((id >= 906 && id <= 1025) || (id >= 10250 && id <= 10277)) {
    return 9
  }
  else {
    return 0
  }
}

export const findPokemonIntervalsByGeneration = (generation: number): Array<Array<number>> => {
  switch (generation) {
    case 1:
      return [[1, 151]]
    case 2:
      return [[152, 251]]
    case 3:
      return [[252, 386], [10001, 10003], [10013, 10015]]
    case 4:
      return [[387, 493], [10004, 10012]]
    case 5:
      return [[494, 649], [10016, 10024]]
    case 6:
      return [[650, 721], [10025, 10090]]
    case 7:
      return [[722, 809], [10091, 10159], [10181, 10181]]
    case 8:
      return [[810, 905], [10160, 10180], [10182, 10249]]
    case 9:
      return [[906, 1025], [10250, 10277]]
  }
  return [[0, 0]]
}


export const findAbilityIntervalsByGeneration = (generation: number): Array<number> => {
  switch (generation) {
    case 3:
      return [1, 76]
    case 4:
      return [77, 123]
    case 5:
      return [124, 164]
    case 6:
      return [165, 191]
    case 7:
      return [192, 233]
    case 8:
      return [234, 267]
    case 9:
      return [268, 307]
  }
  return [0, 0]
}

export const findMoveIntervalsByGeneration = (generation: number): Array<number> => {
  switch(generation) {
    case 1:
      return [1, 165]
    case 2:
      return [166, 251]
    case 3:
      return [252, 354]
    case 4:
      return [355, 467]
    case 5:
      return [468, 559]
    case 6:
      return [560, 621]
    case 7:
      return [622, 742]
    case 8:
      return [743, 850]
    case 9:
      return [851, 919]
  }
  return [0,0]
}

/**
 * Converts custom user input into a format to compare against data returned by the API
 * @param s User Input
 * @returns A string in the format "xxx-yyy"
 */
export const FormatInput = (s: string): string => {
  return s.toLowerCase().replaceAll(' ', '-');
};

export const FormatOutput = (val: any): string => {
  let arr: Array<any> = []
  let output = ""
  // Convert a non-array to an array for compatability with forEach
  if (!Array.isArray(val)) {
    arr.push(val)
  }
  else {
    arr = val
  }
  arr.forEach((element) => {
    if (typeof element !== 'string') {
      output += element + ", "
    }
    else {
      let formatted = element.split(/[-_ ]/).map((part) => {
        part = upper(part)
        return part
      }).join(" ")
      output += formatted + ", "
    }
  })
  // Strips the last comma and whitespace from the result
  return output.replace(/,\s*$/, "")
}

export const upper = (s: string): string => {
  if (s.length > 0) {
    return s.charAt(0).toUpperCase() + s.substring(1)
  } else {
    return s.toUpperCase()
  }
}

export const colorBar = (data: number): string => {
  switch (data) {
    case 0:
      return 'rgba(0,0,0,1)';
    case 1:
      return 'rgba(44, 0, 6, 1)';
    case 2:
      return 'rgba(111, 2, 17, 1)';
    case 3:
      return 'rgba(179, 0, 25, 1)';
    case 4:
      return 'rgba(202, 54, 4, 1)';
    case 5:
      return 'rgba(227, 126, 1, 1)';
    case 6:
      return 'rgba(227, 198, 1, 1)';
    case 7:
      return 'rgba(102, 164, 1, 1)';
    case 8:
      return 'rgba(0, 234, 5, 1)';
    case 9:
      return 'rgba(0, 234, 156, 1)';
    case 10:
      return 'rgba(0, 207, 234, 1)';
    default:
      return '0xffffff';
  }
};

export const defaultSettings = {
  timer: 30,
  rounds: 10,
  timeBetween: 0,
  bstRange: 10,
  weightRange: 5,
  heightRange: 0.5,
  ppRange: 0,
  powerRange: 0,
  accuracyRange: 0,
}

export const nameMap: any = {
  29: 'Nidoran (Female)',
  32: 'Nidoran (Male)',
  122: 'Mr. Mime',
  439: 'Mime Jr.',
  555: 'Darmanitan',
  718: 'Zygarde (50%)',
  866: 'Mr. Rime',
  902: 'Basculegion',
  978: 'Tatsugiri',
  982: 'Dudunsparce (Two Segment)',
  10118: 'Zygarde (10% Power Construct)',
  10119: 'Zygarde (50% Power Construct)',
  10123: 'Oricorio (Pom-Pom)',
  10146: 'Kommo-o (Totem)',
  10155: 'Dusk Mane Necrozma',
  10156: 'Dawn Wings Necrozma',
  10157: 'Ultra Necrozma',
  10177: 'Galarian Darmanitan',
  10181: 'Zygarde (10%)',
  10248: 'Basculegion',
  10250: 'Paldean Tauros (Combat Breed)',
  10251: 'Paldean Tauros (Blaze Breed)',
  10252: 'Paldean Tauros (Aqua Breed)',
}

export function FormatMega(name: string) {
  const parts: string[] = name.split('-')
  let formatted: string = ''
  const baseName: string[] = parts.filter(part => part !== 'mega' && part !== 'x' && part !== 'y');
  const suffix = parts.includes('x') ? ' X' : parts.includes('y') ? ' Y' : ''
  formatted = `Mega ${upper(baseName.join(' '))}${suffix}`
  return formatted
}

export function SpecialFormFormatting(name: string) {
  const split = FormatOutput(name).split(' ');
  let slice = split;
  split.forEach(word => {
    if (['Gmax', 'Alola', 'Galar', 'Hisui', 'Paldea'].includes(word)) {
      slice = split.slice(0, -1)
    }
  });
  return `${slice[0]} (${slice.slice(1).join(' ')})`;
}

/**
 * Searches for the most recent (by generation) English description of a move
 * @param text_entries A list of flavor_text_entries returned by the API
 * @returns The most recent (by generation) flavor_text entry's value
 */
export function searchForDescription(text_entries: Array<any>): string {
  for (let i = text_entries.length - 1; i >= 0; i--) {
    if (text_entries[i].language.name === 'en') {
      if (
        !text_entries[i].flavor_text.includes(
          'recommended that this move is forgotten'
        ) &&
        !text_entries[i].flavor_text.includes('Dummy Data')
      ) {
        return text_entries[i].flavor_text;
      }
    }
  }
  return 'r';
}

/**
 * Since some pokemon have special names (Ex. nidoran-f), this function converts special names to be more readable.
 * Uses the constant name map for most forms. Some pokemon (such as Wo-Chien) actually have a hyphen in their name.
 * Others have a hyphen in the API (Such as great-tusk) and need to be checked
 * Other forms are handled separately (Ex. Galarian / Alolan / Paldean)
 * @param index The pokedex number of the pokemon, used to determine whether this pokemon needs a name change
 * @param name The original name, used if the index does not match
 * @returns
 */
export function obtainDisplayName(index: number, name: string): string {
  if (index in nameMap) {
    return nameMap[index];
  } else if (
    [
      'ho-oh',
      'porygon-z',
      'wo-chien',
      'chien-pao',
      'ting-lu',
      'chi-yu',
    ].includes(name)
  ) {
    return name
      .split('-')
      .map((part) => {
        part = upper(part);
        return part;
      })
      .join('-');
  } else if (
    (index >= 785 && index <= 788) ||
    (index >= 984 && index <= 995) ||
    (index >= 1005 && index <= 1006) ||
    (index >= 1009 && index <= 1010) ||
    (index >= 1020 && index <= 1023)
  ) {
    return FormatOutput(name);
  } else if (name.includes('-mega')) {
    return FormatMega(name);
  } else if (name.includes('-alola')) {
    return `Alolan ${SpecialFormFormatting(name)}`;
  } else if (name.includes('-galar')) {
    return `Galarian ${SpecialFormFormatting(name)}`;
  } else if (name.includes('-gmax')) {
    return `Gigantamax ${SpecialFormFormatting(name)}`;
  } else if (name.includes('-hisui')) {
    return `Hisuian ${SpecialFormFormatting(name)}`;
  } else if (name.includes('-')) {
    return SpecialFormFormatting(name);
  }
  return name[0].toUpperCase() + name.substring(1);
}