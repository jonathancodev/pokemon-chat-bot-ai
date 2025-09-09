import { NextRequest, NextResponse } from 'next/server';
import { ChatApiRequest, AnthropicMessage, ToolCall } from '@/types';
import { StreamProcessor } from '@/types/api';
import { 
  createAnthropicStream, 
  processStreamChunks, 
  createFollowUpMessages 
} from '@/lib/anthropic-service';
import { 
  executeToolCall, 
  sendToolResult, 
  sendToolError 
} from '@/lib/tool-executor';
import { POKEMON_TOOLS, SYSTEM_PROMPT, STREAM_HEADERS } from '@/config/tools';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { messages }: ChatApiRequest = await req.json();
    const stream = createChatStream(messages);
    
    return new NextResponse(stream, { headers: STREAM_HEADERS });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function createChatStream(messages: AnthropicMessage[]): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      const processor: StreamProcessor = {
        encoder: new TextEncoder(),
        decoder: new TextDecoder(),
        controller,
      };

      try {
        await processChatRequest(messages, processor);
      } catch (error) {
        await handleStreamError(error, processor);
      }
    }
  });
}

async function processChatRequest(
  messages: AnthropicMessage[], 
  processor: StreamProcessor
): Promise<void> {
  const reader = await createAnthropicStream(messages, POKEMON_TOOLS, SYSTEM_PROMPT);
  
  const toolCalls = await processStreamChunks(reader, processor);
  
  if (toolCalls.length > 0) {
    await executeTools(toolCalls, messages, processor);
  }
  
  processor.controller.enqueue(
    processor.encoder.encode(`data: [DONE]\n\n`)
  );
  processor.controller.close();
}

async function executeTools(
  toolCalls: ToolCall[],
  originalMessages: AnthropicMessage[],
  processor: StreamProcessor
): Promise<void> {
  for (const toolCall of toolCalls) {
    try {
      const result = await executeToolCall(toolCall);
      
      sendToolResult(toolCall, result, processor.controller, processor.encoder);
      
      const followUpMessages = createFollowUpMessages(originalMessages, toolCall, result);
      await processFollowUpResponse(followUpMessages, processor);
      
    } catch (toolError) {
      sendToolError(
        toolCall, 
        toolError as Error, 
        processor.controller, 
        processor.encoder
      );
    }
  }
}

async function processFollowUpResponse(
  followUpMessages: AnthropicMessage[],
  processor: StreamProcessor
): Promise<void> {
  try {
    const followUpReader = await createAnthropicStream(
      followUpMessages, 
      POKEMON_TOOLS, 
      SYSTEM_PROMPT
    );
    
    await processFollowUpStream(followUpReader, processor);
    
  } catch (error) {
    console.error('Error processing follow-up response:', error);
  }
}

async function processFollowUpStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  processor: StreamProcessor
): Promise<void> {
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer = await processStreamBuffer(buffer, value, processor);
  }
}

async function processStreamBuffer(
  buffer: string,
  value: Uint8Array,
  processor: StreamProcessor
): Promise<string> {
  buffer += processor.decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  const remainingBuffer = lines.pop() ?? '';
  
  for (const line of lines) {
    const shouldStop = await processStreamLine(line, processor);
    if (shouldStop) break;
  }
  
  return remainingBuffer;
}

async function processStreamLine(
  line: string,
  processor: StreamProcessor
): Promise<boolean> {
  if (!line.startsWith('data: ')) return false;
  
  const data = line.slice(6);
  if (data === '[DONE]') return true;
  
  try {
    const chunk = JSON.parse(data);
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      const responseData = JSON.stringify({ 
        type: 'text', 
        content: chunk.delta.text 
      });
      processor.controller.enqueue(
        processor.encoder.encode(`data: ${responseData}\n\n`)
      );
    }
  } catch (parseError) {
    console.error('Error parsing follow-up chunk:', parseError);
  }
  
  return false;
}


async function handleStreamError(
  error: unknown,
  processor: StreamProcessor
): Promise<void> {
  console.error('Stream error:', error);
  
  const errorData = JSON.stringify({
    type: 'error',
    content: `Stream error: ${error instanceof Error ? error.message : 'Unknown error'}`
  });
  
  processor.controller.enqueue(
    processor.encoder.encode(`data: ${errorData}\n\n`)
  );
  processor.controller.close();
}
