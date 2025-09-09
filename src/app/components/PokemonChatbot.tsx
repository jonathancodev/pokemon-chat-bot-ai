'use client';

import { useState, useRef, useEffect } from 'react';
import PokemonCard from './PokemonCard';
import TeamDisplay from './TeamDisplay';
import { Message, StreamingResponse, ChatApiRequest, Pokemon, PokemonTeam } from '@/types';

export function PokemonChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello, Trainer! I'm PokéBot, your AI Pokédex companion! \n\nI can help you with:\n• **Pokémon Information** - Ask about any Pokémon's stats, types, abilities, and more!\n• **Team Building** - Get strategic team suggestions for battles\n• **Type Matchups** - Learn about strengths and weaknesses\n\nTry asking: \"Tell me about Pikachu\" or \"Build me a balanced team for competitive battles\"",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        } as ChatApiRequest),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let assistantContent = '';
      let pokemonData: Pokemon | undefined = undefined;
      let teamData: PokemonTeam | undefined = undefined;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              const finalMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: assistantContent,
                pokemonData,
                teamData,
                timestamp: new Date(),
              };
              
              setMessages(prev => [...prev, finalMessage]);
              setStreamingMessage('');
              break;
            }

            try {
              const parsed: StreamingResponse = JSON.parse(data);
              
              if (parsed.type === 'text') {
                assistantContent += parsed.content ?? '';
                setStreamingMessage(assistantContent);
              } else if (parsed.type === 'tool_result') {
                if (parsed.tool_name === 'get_pokemon_data') {
                  pokemonData = parsed.result as Pokemon;
                } else if (parsed.tool_name === 'build_pokemon_team') {
                  teamData = parsed.result as PokemonTeam;
                }
              } else if (parsed.type === 'error') {
                assistantContent += `\n\n❌ ${parsed.content ?? 'Unknown error'}`;
                setStreamingMessage(assistantContent);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error.message}. Please try again!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessage('');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="h-[600px] overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white ml-4'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-4'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              
              {message.pokemonData && (
                <div className="mt-4">
                  <PokemonCard pokemon={message.pokemonData} />
                </div>
              )}
              
              {message.teamData && (
                <div className="mt-4">
                  <TeamDisplay team={message.teamData} />
                </div>
              )}
              
              <div className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-4">
              <div className="whitespace-pre-wrap break-words">
                {streamingMessage}
                <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {isLoading && !streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="text-sm text-gray-500">PokéBot is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about any Pokémon, request team building help, or explore the Pokémon world!"
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              onClick={stopGeneration}
              className="rounded-xl bg-red-600 px-6 py-3 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="rounded-xl bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "Tell me about Charizard",
            "Build me a balanced competitive team",
            "What are the strongest Electric-type Pokémon?",
            "Create a team with Fire and Water types"
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              disabled={isLoading}
              className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
