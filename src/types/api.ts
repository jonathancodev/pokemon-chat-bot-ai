// API Constants and Configuration
export const API_ENDPOINTS = {
  ANTHROPIC: 'https://api.anthropic.com/v1/messages',
  POKEMON_API: 'https://pokeapi.co/api/v2',
} as const;

export const ANTHROPIC_CONFIG = {
  MODEL: 'claude-sonnet-4-20250514',
  MAX_TOKENS: 1024,
  API_VERSION: '2023-06-01',
} as const;

export const POKEMON_CONFIG = {
  MAX_POKEMON_PER_TYPE: 10,
  MAX_TEAM_SIZE: 6,
  DEFAULT_TYPES: ['fire', 'water', 'grass', 'electric', 'psychic', 'dragon'] as const,
} as const;

// HTTP Headers
export interface AnthropicHeaders extends Record<string, string> {
  'Content-Type': string;
  'x-api-key': string;
  'anthropic-version': string;
}

export interface StreamHeaders {
  'Content-Type': string;
  'Cache-Control': string;
  'Connection': string;
}

// Stream Processing Types
export interface StreamProcessor {
  encoder: TextEncoder;
  decoder: TextDecoder;
  controller: ReadableStreamDefaultController<Uint8Array>;
}

export interface ToolExecutionContext {
  toolCalls: ToolCall[];
  currentToolCall: Partial<ToolCall> | null;
  inputBuffer: string;
}

// Error Types
export class PokemonAPIError extends Error {
  constructor(message: string, public readonly pokemonName?: string) {
    super(message);
    this.name = 'PokemonAPIError';
  }
}

export class AnthropicAPIError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'AnthropicAPIError';
  }
}

export class StreamProcessingError extends Error {
  constructor(message: string, public readonly chunk?: any) {
    super(message);
    this.name = 'StreamProcessingError';
  }
}

// Re-export types for convenience
export type { 
  Pokemon, 
  PokemonTeam, 
  ToolCall, 
  StreamChunk,
  AnthropicMessage 
} from './index';
