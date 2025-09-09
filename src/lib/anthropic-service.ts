import { 
  AnthropicMessage, 
  ToolCall, 
  StreamChunk, 
  AnthropicTool 
} from '@/types';
import { 
  API_ENDPOINTS, 
  ANTHROPIC_CONFIG, 
  AnthropicHeaders, 
  StreamProcessor, 
  ToolExecutionContext,
  AnthropicAPIError,
  StreamProcessingError 
} from '@/types/api';

export function createAnthropicHeaders(): AnthropicHeaders {
  return {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY!,
    'anthropic-version': ANTHROPIC_CONFIG.API_VERSION,
  };
}

export function createAnthropicRequestBody(
  messages: AnthropicMessage[],
  tools: AnthropicTool[],
  systemPrompt: string
) {
  return {
    model: ANTHROPIC_CONFIG.MODEL,
    max_tokens: ANTHROPIC_CONFIG.MAX_TOKENS,
    system: systemPrompt,
    messages,
    tools,
    stream: true,
  };
}

export async function createAnthropicStream(
  messages: AnthropicMessage[],
  tools: AnthropicTool[],
  systemPrompt: string
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetch(API_ENDPOINTS.ANTHROPIC, {
    method: 'POST',
    headers: createAnthropicHeaders(),
    body: JSON.stringify(createAnthropicRequestBody(messages, tools, systemPrompt)),
  });

  if (!response.ok) {
    throw new AnthropicAPIError(
      `Anthropic API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new AnthropicAPIError('No response body reader available');
  }

  return reader;
}

export async function processStreamChunks(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  processor: StreamProcessor
): Promise<ToolCall[]> {
  const context: ToolExecutionContext = {
    toolCalls: [],
    currentToolCall: null,
    inputBuffer: '',
  };

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += processor.decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        if (data === '[DONE]') {
          return context.toolCalls;
        }

        await processStreamChunk(data, context, processor);
      }
    }
  }

  return context.toolCalls;
}

async function processStreamChunk(
  data: string,
  context: ToolExecutionContext,
  processor: StreamProcessor
): Promise<void> {
  try {
    const chunk: StreamChunk = JSON.parse(data);

    switch (chunk.type) {
      case 'message_start':
        break;

      case 'content_block_start':
        handleContentBlockStart(chunk, context);
        break;

      case 'content_block_delta':
        await handleContentBlockDelta(chunk, context, processor);
        break;

      case 'content_block_stop':
        handleContentBlockStop(context);
        break;

      case 'message_stop':
        break;

      default:
        console.warn('Unknown chunk type:', chunk.type);
    }
  } catch (error) {
    throw new StreamProcessingError(
      `Error parsing chunk: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data
    );
  }
}

function handleContentBlockStart(
  chunk: StreamChunk, 
  context: ToolExecutionContext
): void {
  if (chunk.content_block?.type === 'tool_use') {
    context.currentToolCall = {
      id: chunk.content_block.id!,
      name: chunk.content_block.name!,
      input: {}
    };
    context.inputBuffer = '';
  }
}

async function handleContentBlockDelta(
  chunk: StreamChunk,
  context: ToolExecutionContext,
  processor: StreamProcessor
): Promise<void> {
  if (chunk.delta?.type === 'text_delta') {
    const responseData = JSON.stringify({ 
      type: 'text', 
      content: chunk.delta.text 
    });
    processor.controller.enqueue(
      processor.encoder.encode(`data: ${responseData}\n\n`)
    );
  } else if (chunk.delta?.type === 'input_json_delta' && context.currentToolCall) {
    if (chunk.delta.partial_json) {
      context.inputBuffer += chunk.delta.partial_json;
    }
  }
}

function handleContentBlockStop(context: ToolExecutionContext): void {
  if (context.currentToolCall) {
    try {
      if (context.inputBuffer.trim()) {
        context.currentToolCall.input = JSON.parse(context.inputBuffer);
      }
    } catch (parseError) {
      console.error('Failed to parse tool input JSON:', context.inputBuffer, parseError);
      context.currentToolCall.input = {};
    }

    context.toolCalls.push(context.currentToolCall as ToolCall);
    context.currentToolCall = null;
    context.inputBuffer = '';
  }
}

export function createFollowUpMessages(
  originalMessages: AnthropicMessage[],
  toolCall: ToolCall,
  result: any
): AnthropicMessage[] {
  return [
    ...originalMessages,
    {
      role: 'assistant',
      content: [
        {
          type: 'tool_use',
          id: toolCall.id,
          name: toolCall.name,
          input: toolCall.input
        }
      ]
    },
    {
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: JSON.stringify(result)
        }
      ]
    }
  ];
}
