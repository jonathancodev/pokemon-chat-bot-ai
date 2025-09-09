import { PokemonType } from './pokemon';

// UI Component Props Types
export interface PokemonCardProps {
  pokemon: {
    name: string;
    id: number;
    height: number;
    weight: number;
    types: string[];
    abilities: string[];
    stats: Array<{
      name: string;
      base_stat: number;
    }>;
    sprites: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

export interface TeamDisplayProps {
  team: {
    concept: string;
    synergy: string;
    team: Array<{
      name: string;
      id: number;
      types: string[];
      role: string;
      sprites: {
        front_default: string | null;
      };
      stats: Array<{
        name: string;
        base_stat: number;
      }>;
    }>;
  };
}

// Type Color Mapping
export type TypeColorMap = Record<PokemonType, string>;

// Stat Color Functions
export type StatColorFunction = (value: number) => string;

// Loading States
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

// Error States
export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
}

// Chat UI States
export interface ChatUIState extends LoadingState, ErrorState {
  streamingMessage: string;
  isStreaming: boolean;
}

// Quick Action Suggestions
export interface QuickAction {
  id: string;
  text: string;
  category: 'pokemon' | 'team' | 'battle' | 'general';
}

// Theme Types
export type Theme = 'light' | 'dark' | 'auto';

// Responsive Breakpoints
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Animation States
export interface AnimationState {
  isAnimating: boolean;
  animationType?: 'fade' | 'slide' | 'bounce' | 'pulse';
  duration?: number;
}
