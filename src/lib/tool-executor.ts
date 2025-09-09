import { 
  Pokemon, 
  PokemonTeam, 
  PokemonRanking,
  ToolCall, 
  GetPokemonDataInput, 
  GetPokemonRankingsInput,
  BuildPokemonTeamInput 
} from '@/types';
import { getPokemonData, getPokemonRankings, buildPokemonTeam } from './pokemon-service';

export type ToolExecutionResult = Pokemon | PokemonTeam | PokemonRanking;

export async function executeToolCall(toolCall: ToolCall): Promise<ToolExecutionResult> {
  switch (toolCall.name) {
    case 'get_pokemon_data':
      return await executePokemonDataTool(toolCall);
      
    case 'get_pokemon_rankings':
      return await executePokemonRankingsTool(toolCall);
      
    case 'build_pokemon_team':
      return await executeTeamBuildingTool(toolCall);
      
    default:
      throw new Error(`Unknown tool: ${toolCall.name}`);
  }
}

async function executePokemonDataTool(toolCall: ToolCall): Promise<Pokemon> {
  const input = toolCall.input as GetPokemonDataInput;
  return await getPokemonData(input.pokemon_name);
}

async function executePokemonRankingsTool(toolCall: ToolCall): Promise<PokemonRanking> {
  const input = toolCall.input as GetPokemonRankingsInput;
  return await getPokemonRankings(
    input.ranking_criteria,
    input.pokemon_type,
    input.limit || 10,
    input.order || 'desc'
  );
}

async function executeTeamBuildingTool(toolCall: ToolCall): Promise<PokemonTeam> {
  const input = toolCall.input as BuildPokemonTeamInput;
  return await buildPokemonTeam(input.team_concept, input.preferred_types);
}

export function sendToolResult(
  toolCall: ToolCall,
  result: ToolExecutionResult,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): void {
  const toolResultData = JSON.stringify({
    type: 'tool_result',
    tool_name: toolCall.name,
    result: result
  });
  
  controller.enqueue(encoder.encode(`data: ${toolResultData}\n\n`));
}

export function sendToolError(
  toolCall: ToolCall,
  error: Error,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): void {
  const errorData = JSON.stringify({
    type: 'error',
    content: `Error executing ${toolCall.name}: ${error.message}`
  });
  
  controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
}
