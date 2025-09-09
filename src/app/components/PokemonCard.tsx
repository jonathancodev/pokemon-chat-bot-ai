'use client';

import Image from 'next/image';
import { PokemonCardProps, PokemonType } from '@/types';

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

export default function PokemonCard({ pokemon }: Readonly<PokemonCardProps>) {
  const statNames: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
  };

  const getStatColor = (value: number) => {
    if (value >= 100) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-md">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold capitalize">{pokemon.name}</h3>
            <p className="text-blue-100">#{pokemon.id.toString().padStart(3, '0')}</p>
          </div>
          <div className="flex space-x-2">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                    typeColors[type as PokemonType] || 'bg-gray-500'
                  }`}
                >
                  {type.toUpperCase()}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-center space-x-4 mb-4">
          {pokemon.sprites.front_default && (
            <div className="text-center">
              <Image
                src={pokemon.sprites.front_default}
                alt={`${pokemon.name} sprite`}
                width={96}
                height={96}
                className="mx-auto"
              />
              <p className="text-xs text-gray-500 mt-1">Normal</p>
            </div>
          )}
          {pokemon.sprites.front_shiny && (
            <div className="text-center">
              <Image
                src={pokemon.sprites.front_shiny}
                alt={`${pokemon.name} shiny sprite`}
                width={96}
                height={96}
                className="mx-auto"
              />
              <p className="text-xs text-gray-500 mt-1">Shiny ✨</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(pokemon.height / 10).toFixed(1)}m
            </p>
            <p className="text-sm text-gray-500">Height</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(pokemon.weight / 10).toFixed(1)}kg
            </p>
            <p className="text-sm text-gray-500">Weight</p>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Abilities</h4>
          <div className="flex flex-wrap gap-2">
            {pokemon.abilities.map((ability) => (
              <span
                key={ability}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm capitalize"
              >
                {ability.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Base Stats</h4>
          <div className="space-y-2">
            {pokemon.stats.map((stat) => (
              <div key={stat.name} className="flex items-center">
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                  {statNames[stat.name] || stat.name}
                </div>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStatColor(stat.base_stat)}`}
                      style={{ width: `${Math.min((stat.base_stat / 150) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="w-8 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                  {stat.base_stat}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-gray-100">Total</span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
