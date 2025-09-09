import { 
  Pokemon, 
  PokemonTeam, 
  PokemonRanking,
  PokemonApiResponse, 
  TypeApiResponse 
} from '@/types';
import { 
  API_ENDPOINTS, 
  POKEMON_CONFIG, 
  PokemonAPIError 
} from '@/types/api';

/**
 * Fetches detailed Pokémon data from the PokéAPI
 */
export async function getPokemonData(pokemonName: string): Promise<Pokemon> {
  try {
    const url = `${API_ENDPOINTS.POKEMON_API}/pokemon/${pokemonName.toLowerCase()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      // Log the error but don't expose it to user
      console.warn(`Pokémon not found: ${pokemonName}`);
      throw new PokemonAPIError(`Pokemon data not available`, pokemonName);
    }
    
    const data: PokemonApiResponse = await response.json();
    
    return transformPokemonData(data);
  } catch (error) {
    if (error instanceof PokemonAPIError) {
      throw error;
    }
    console.error(`Error fetching Pokemon ${pokemonName}:`, error);
    throw new PokemonAPIError(
      `Pokemon data temporarily unavailable`,
      pokemonName
    );
  }
}

/**
 * Gets Pokemon rankings based on specified criteria
 */
export async function getPokemonRankings(
  criteria: string,
  pokemonType?: string,
  limit: number = 10,
  order: 'desc' | 'asc' = 'desc'
): Promise<PokemonRanking> {
  try {
    const pokemonList = await fetchPokemonListForRanking(pokemonType, Math.min(limit * 3, 60));
    const pokemonData = await fetchPokemonDataSafely(pokemonList);
    
    return createRankedList(pokemonData, criteria, pokemonType, limit, order);
  } catch (error) {
    console.error('Error creating Pokemon rankings:', error);
    throw new PokemonAPIError(
      `Unable to generate rankings at this time`
    );
  }
}

/**
 * Builds a strategic Pokémon team based on concept and preferred types
 */
export async function buildPokemonTeam(
  teamConcept: string, 
  preferredTypes?: string[]
): Promise<PokemonTeam> {
  try {
    const typeQueries = getTypeQueries(preferredTypes);
    const teamSuggestions = await fetchPokemonByTypes(typeQueries);
    
    return createTeamStructure(teamConcept, teamSuggestions);
  } catch (error) {
    throw new PokemonAPIError(
      `Failed to build team: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Transforms raw PokéAPI response to our Pokemon interface
 */
function transformPokemonData(data: PokemonApiResponse): Pokemon {
  return {
    name: data.name,
    id: data.id,
    height: data.height,
    weight: data.weight,
    types: data.types.map(type => type.type.name),
    abilities: data.abilities.map(ability => ability.ability.name),
    stats: data.stats.map(stat => ({
      name: stat.stat.name,
      base_stat: stat.base_stat
    })),
    sprites: {
      front_default: data.sprites.front_default,
      front_shiny: data.sprites.front_shiny
    }
  };
}

/**
 * Determines which types to query for team building
 */
function getTypeQueries(preferredTypes?: string[]): string[] {
  return preferredTypes && preferredTypes.length > 0 
    ? preferredTypes 
    : [...POKEMON_CONFIG.DEFAULT_TYPES];
}

/**
 * Fetches Pokémon data for each type
 */
async function fetchPokemonByTypes(typeQueries: string[]): Promise<Pokemon[]> {
  const teamSuggestions: Pokemon[] = [];
  
  for (const type of typeQueries.slice(0, POKEMON_CONFIG.MAX_TEAM_SIZE)) {
    try {
      const pokemonData = await fetchRandomPokemonOfType(type);
      if (pokemonData) {
        teamSuggestions.push(pokemonData);
      }
    } catch (error) {
      console.error(`Error fetching ${type} Pokemon:`, error);
    }
  }
  
  return teamSuggestions;
}

async function fetchRandomPokemonOfType(type: string): Promise<Pokemon | null> {
  const url = `${API_ENDPOINTS.POKEMON_API}/type/${type}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    return null;
  }
  
  const typeData: TypeApiResponse = await response.json();
  const pokemon = typeData.pokemon.slice(0, POKEMON_CONFIG.MAX_POKEMON_PER_TYPE);
  const randomPokemon = pokemon[Math.floor(Math.random() * pokemon.length)];
  
  if (!randomPokemon) {
    return null;
  }
  
  return await getPokemonData(randomPokemon.pokemon.name);
}

function createTeamStructure(teamConcept: string, pokemonList: Pokemon[]): PokemonTeam {
  return {
    concept: teamConcept,
    team: pokemonList.slice(0, POKEMON_CONFIG.MAX_TEAM_SIZE).map(pokemon => ({
      ...pokemon,
      role: `${capitalize(pokemon.types[0])} specialist`,
      teamConcept: teamConcept
    })),
    synergy: `This team is built around the concept: "${teamConcept}". Each Pokémon brings unique strengths that complement the overall strategy.`
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Fetches Pokemon list for ranking (with type filtering)
 */
async function fetchPokemonListForRanking(pokemonType?: string, limit: number = 60): Promise<string[]> {
  if (pokemonType) {
    const url = `${API_ENDPOINTS.POKEMON_API}/type/${pokemonType}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const typeData: TypeApiResponse = await response.json();
      return typeData.pokemon
        .slice(0, limit)
        .map(p => p.pokemon.name);
    }
  }
  
  // Fallback to popular Pokemon for general rankings
  return [
    'charizard', 'blastoise', 'venusaur', 'pikachu', 'mewtwo', 'mew', 'lugia', 'ho-oh',
    'celebi', 'kyogre', 'groudon', 'rayquaza', 'dialga', 'palkia', 'giratina', 'arceus',
    'reshiram', 'zekrom', 'kyurem', 'xerneas', 'yveltal', 'zygarde', 'solgaleo', 'lunala',
    'necrozma', 'zacian', 'zamazenta', 'eternatus', 'calyrex', 'dragonite', 'tyranitar',
    'salamence', 'metagross', 'garchomp', 'lucario', 'zoroark', 'hydreigon', 'volcarona',
    'serperior', 'emboar', 'samurott', 'greninja', 'talonflame', 'goodra', 'noivern',
    'decidueye', 'incineroar', 'primarina', 'lycanroc', 'toxapex', 'kommo-o', 'mimikyu',
    'dragapult', 'corviknight', 'toxapex', 'ferrothorn', 'magnezone'
  ].slice(0, limit);
}

/**
 * Safely fetches Pokemon data, filtering out failed requests
 */
async function fetchPokemonDataSafely(pokemonNames: string[]): Promise<Pokemon[]> {
  const results = await Promise.allSettled(
    pokemonNames.map(name => getPokemonData(name))
  );
  
  return results
    .filter((result): result is PromiseFulfilledResult<Pokemon> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value);
}

/**
 * Creates ranked list based on criteria
 */
function createRankedList(
  pokemonData: Pokemon[],
  criteria: string,
  typeFilter?: string,
  limit: number = 10,
  order: 'desc' | 'asc' = 'desc'
): PokemonRanking {
  const rankedPokemon = pokemonData
    .map(pokemon => {
      const statValue = getStatValue(pokemon, criteria);
      const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
      
      return {
        pokemon,
        stat_value: statValue,
        total_stats: totalStats
      };
    })
    .sort((a, b) => {
      const comparison = order === 'desc' 
        ? b.stat_value - a.stat_value 
        : a.stat_value - b.stat_value;
      
      // Secondary sort by total stats if primary stat is equal
      return comparison !== 0 ? comparison : b.total_stats - a.total_stats;
    })
    .slice(0, limit)
    .map((item, index) => ({
      rank: index + 1,
      pokemon: item.pokemon,
      stat_value: item.stat_value,
      total_stats: item.total_stats
    }));

  return {
    criteria,
    type_filter: typeFilter,
    total_found: pokemonData.length,
    rankings: rankedPokemon
  };
}

/**
 * Gets stat value based on criteria
 */
function getStatValue(pokemon: Pokemon, criteria: string): number {
  switch (criteria.toLowerCase()) {
    case 'attack':
      return pokemon.stats.find(s => s.name === 'attack')?.base_stat || 0;
    case 'defense':
      return pokemon.stats.find(s => s.name === 'defense')?.base_stat || 0;
    case 'hp':
      return pokemon.stats.find(s => s.name === 'hp')?.base_stat || 0;
    case 'special-attack':
      return pokemon.stats.find(s => s.name === 'special-attack')?.base_stat || 0;
    case 'special-defense':
      return pokemon.stats.find(s => s.name === 'special-defense')?.base_stat || 0;
    case 'speed':
      return pokemon.stats.find(s => s.name === 'speed')?.base_stat || 0;
    case 'total-stats':
    case 'overall':
      return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    default:
      // Default to total stats for unknown criteria
      return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  }
}
