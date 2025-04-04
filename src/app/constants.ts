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
  bstRange: 10,
  weightRange: 5,
  heightRange: 0.5,
  ppRange: 0,
  powerRange: 0,
  accuracyRange: 0,
}
