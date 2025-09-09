'use client';

import Image from 'next/image';
import { TeamDisplayProps, PokemonType } from '@/types';

const typeColors: Record<PokemonType, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-400',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

export default function TeamDisplay({ team }: Readonly<TeamDisplayProps>) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-4xl">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
        <h3 className="text-xl font-bold mb-2">🏆 Team Strategy: {team.concept}</h3>
        <p className="text-purple-100 text-sm">{team.synergy}</p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.team.map((pokemon, index) => (
            <div
              key={`${pokemon.name}-${index}`}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 capitalize">
                    {pokemon.name}
                  </h4>
                  <p className="text-xs text-gray-500">#{pokemon.id.toString().padStart(3, '0')}</p>
                </div>
                {pokemon.sprites.front_default && (
                  <Image
                    src={pokemon.sprites.front_default}
                    alt={`${pokemon.name} sprite`}
                    width={64}
                    height={64}
                    className="pixelated"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      typeColors[type as PokemonType] || 'bg-gray-500'
                    }`}
                  >
                    {type.toUpperCase()}
                  </span>
                ))}
              </div>

              <div className="mb-3">
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                  {pokemon.role}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {pokemon.stats.slice(0, 4).map((stat) => {
                  const shortNames: Record<string, string> = {
                    hp: 'HP',
                    attack: 'ATK',
                    defense: 'DEF',
                    'special-attack': 'SPA',
                    'special-defense': 'SPD',
                    speed: 'SPE',
                  };
                  
                  return (
                    <div key={stat.name} className="flex justify-between">
                      <span className="text-gray-500">
                        {shortNames[stat.name] || stat.name.slice(0, 3).toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {stat.base_stat}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Team Analysis</h4>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Type Coverage:</p>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(team.team.flatMap(p => p.types))).map((type) => (
                <span
                  key={type}
                  className={`px-2 py-1 rounded text-xs font-medium text-white ${
                    typeColors[type as PokemonType] || 'bg-gray-500'
                  }`}
                >
                  {type.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map((statName) => {
              const avgStat = Math.round(
                team.team.reduce((sum, pokemon) => {
                  const stat = pokemon.stats.find(s => s.name === statName);
                  return sum + (stat?.base_stat ?? 0);
                }, 0) / team.team.length
              );

              const shortNames: Record<string, string> = {
                hp: 'HP',
                attack: 'ATK',
                defense: 'DEF',
                'special-attack': 'SP.ATK',
                'special-defense': 'SP.DEF',
                speed: 'SPEED',
              };

              return (
                <div key={statName} className="text-center">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{avgStat}</p>
                  <p className="text-xs text-gray-500">Avg {shortNames[statName]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
