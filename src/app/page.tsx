import { PokemonChatbot } from './components/PokemonChatbot';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            PokéBot
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your AI-powered Pokédex companion! Ask me about any Pokémon, get team building advice, 
            or explore the wonderful world of Pokémon together.
          </p>
        </div>
        <PokemonChatbot />
      </div>
    </div>
  );
}
