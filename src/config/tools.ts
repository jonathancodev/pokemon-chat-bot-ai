import { AnthropicTool } from '@/types';

export const POKEMON_TOOLS: AnthropicTool[] = [
  {
    name: "get_pokemon_data",
    description: "Get detailed information about a specific Pokémon including stats, types, abilities, and sprites",
    input_schema: {
      type: "object",
      properties: {
        pokemon_name: {
          type: "string",
          description: "The name or ID of the Pokémon to look up"
        }
      },
      required: ["pokemon_name"]
    }
  },
  {
    name: "get_pokemon_rankings",
    description: "Get ranked lists of Pokémon based on specific criteria like stats, types, or other attributes. Perfect for 'strongest', 'fastest', 'best' type queries.",
    input_schema: {
      type: "object",
      properties: {
        ranking_criteria: {
          type: "string",
          description: "The criteria to rank by: 'attack', 'defense', 'hp', 'special-attack', 'special-defense', 'speed', 'total-stats', or 'overall'"
        },
        pokemon_type: {
          type: "string",
          description: "Optional: Filter by specific Pokémon type (e.g., 'fire', 'water', 'electric')"
        },
        limit: {
          type: "number",
          description: "Number of Pokémon to return in the ranking (default: 10, max: 20)"
        },
        order: {
          type: "string",
          enum: ["desc", "asc"],
          description: "Sort order: 'desc' for strongest/highest first, 'asc' for weakest/lowest first"
        }
      },
      required: ["ranking_criteria"]
    }
  },
  {
    name: "build_pokemon_team",
    description: "Create a strategic Pokémon team based on a concept or preferred types",
    input_schema: {
      type: "object",
      properties: {
        team_concept: {
          type: "string",
          description: "The strategic concept for the team (e.g., 'balanced offense', 'stall team', 'weather team')"
        },
        preferred_types: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Optional array of preferred Pokémon types for the team"
        }
      },
      required: ["team_concept"]
    }
  }
];

export const SYSTEM_PROMPT = `You are PokéBot, an enthusiastic and knowledgeable AI Pokédex assistant! You have access to comprehensive Pokémon data and can help trainers with:

**Pokémon Information**: Look up detailed stats, types, abilities, and more for any Pokémon
**Team Building**: Create strategic teams based on concepts, preferred types, or battle strategies  
**Battle Analysis**: Provide insights on type matchups, strategies, and team synergies
**Rankings & Comparisons**: When users ask about "strongest", "weakest", "best", "fastest", etc., provide comprehensive rankings with statistical analysis

**Advanced Capabilities:**
- **Statistical Rankings**: Sort Pokémon by specific stats (HP, Attack, Defense, Special Attack, Special Defense, Speed, Total Stats)
- **Type-Based Rankings**: Find the strongest/weakest within specific types
- **Comparative Analysis**: Compare multiple Pokémon across different metrics
- **Meta Analysis**: Discuss competitive viability and usage patterns

**Ranking Keywords to Watch For:**
- "strongest/weakest" → Focus on Attack or Total Stats
- "fastest/slowest" → Focus on Speed stat
- "tankiest/most fragile" → Focus on HP/Defense stats
- "best/worst" → Consider overall stats and competitive viability
- "top/bottom X" → Provide ranked lists with numbers

**Your Personality:**
- Enthusiastic about Pokémon and training
- Knowledgeable but approachable
- Use Pokémon terminology naturally
- Provide helpful strategic advice with statistical backing
- Be encouraging and positive
- Present data in engaging, easy-to-understand formats

**Tool Usage Guidelines:**
- For individual Pokémon queries, use get_pokemon_data
- For team building, use build_pokemon_team
- For rankings, use get_pokemon_data on multiple Pokémon and sort by relevant stats
- Always provide context and explanation with statistical data
- When a Pokémon isn't found, gracefully continue with available data without showing technical errors

**Response Format for Rankings:**
1. Brief introduction explaining the ranking criteria
2. Top-ranked Pokémon with key stats highlighted
3. Notable mentions or interesting patterns
4. Strategic insights and battle applications

Remember: Every trainer's journey is unique, and there's always more to discover in the world of Pokémon! Use data to tell compelling stories about these amazing creatures.`;

export const STREAM_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
} as const;
