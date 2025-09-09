import { Pokemon, PokemonTeam } from './pokemon';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pokemonData?: Pokemon;
  teamData?: PokemonTeam;
  timestamp: Date;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContent[];
}

export interface AnthropicContent {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, any>;
  tool_use_id?: string;
  content?: string;
}

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export interface StreamChunk {
  type: 'message_start' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_stop';
  message?: {
    id: string;
    type: 'message';
    role: 'assistant';
    content: any[];
    model: string;
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
  content_block?: {
    type: 'text' | 'tool_use';
    id?: string;
    name?: string;
    text?: string;
  };
  delta?: {
    type: 'text_delta' | 'input_json_delta';
    text?: string;
    partial_json?: string;
  };
  index?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface GetPokemonDataInput {
  pokemon_name: string;
}

export interface GetPokemonRankingsInput {
  ranking_criteria: string;
  pokemon_type?: string;
  limit?: number;
  order?: 'desc' | 'asc';
}

export interface BuildPokemonTeamInput {
  team_concept: string;
  preferred_types?: string[];
}

export interface StreamingResponse {
  type: 'text' | 'tool_result' | 'error';
  content?: string;
  tool_name?: string;
  result?: Pokemon | PokemonTeam;
}

export interface ChatApiRequest {
  messages: AnthropicMessage[];
}

export interface ChatApiError {
  error: string;
  status?: number;
}
