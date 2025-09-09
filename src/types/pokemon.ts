// PokéAPI Response Types
export interface PokemonApiResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    back_default: string | null;
    back_shiny: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
}

export interface TypeApiResponse {
  id: number;
  name: string;
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
    slot: number;
  }>;
}

// Processed Pokemon Data Types
export interface PokemonStat {
  name: string;
  base_stat: number;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
}

export interface Pokemon {
  name: string;
  id: number;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
}

// Team Building Types
export interface TeamPokemon extends Pokemon {
  role: string;
  teamConcept: string;
}

export interface PokemonTeam {
  concept: string;
  synergy: string;
  team: TeamPokemon[];
}

export interface PokemonRanking {
  criteria: string;
  type_filter?: string;
  total_found: number;
  rankings: Array<{
    rank: number;
    pokemon: Pokemon;
    stat_value: number;
    total_stats: number;
  }>;
}

// Type definitions for Pokemon types
export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

// Stat name mapping
export type StatName = 
  | 'hp' | 'attack' | 'defense' 
  | 'special-attack' | 'special-defense' | 'speed';

export interface StatDisplayInfo {
  shortName: string;
  displayName: string;
  color: string;
}
