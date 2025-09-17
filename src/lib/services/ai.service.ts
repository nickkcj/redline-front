export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{ type: 'text'; text: string }>;
    id?: string;
}

export interface ChatCompletionRequest {
    messages: ChatMessage[];
    model?: string;
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
}

export interface ChatCompletionStreamChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: string | null;
    }>;
}

export interface AIProvider {
    name: string;
    supportedModels: string[];
    supportsStreaming: boolean;
    supportsVision: boolean;
    displayName: string;
    tier: 'premium' | 'standard' | 'experimental';
}

class AiService {
    private static providers: Record<string, AIProvider> = {
        anthropic: {
            name: 'anthropic',
            displayName: 'Claude (Anthropic)',
            tier: 'premium',
            supportedModels: [
                'claude-opus-4-1-20250805',
                'claude-sonnet-4-20250514',
            ],
            supportsStreaming: true,
            supportsVision: true
        },
        mock: {
            name: 'mock',
            displayName: 'Mock Provider',
            tier: 'experimental',
            supportedModels: ['mock-model'],
            supportsStreaming: true,
            supportsVision: false
        }
    };

    getProviders(): Record<string, AIProvider> {
        return AiService.providers;
    }

    getProvider(name: string): AIProvider | null {
        return AiService.providers[name] || null;
    }

    // Mock implementation for demonstration
    async *streamChatCompletions(
        slug: string,
        request: ChatCompletionRequest,
        provider: string = 'mock'
    ): AsyncGenerator<ChatCompletionStreamChunk, void, unknown> {
        const userMessage = request.messages[request.messages.length - 1];

        // Simulate streaming response
        const responses = [
            "Olá! Sou seu assistente virtual do Vaultly.",
            " Como posso ajudá-lo hoje?",
            " Posso te auxiliar com questões sobre data rooms,",
            " documentos, links compartilhados",
            " e muito mais!"
        ];

        for (let i = 0; i < responses.length; i++) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

            yield {
                id: `chatcmpl-mock-${Date.now()}-${i}`,
                object: 'chat.completion.chunk',
                created: Date.now(),
                model: 'mock-model',
                choices: [{
                    index: 0,
                    delta: {
                        content: responses[i]
                    },
                    finish_reason: i === responses.length - 1 ? 'stop' : null
                }]
            };
        }
    }
}

export const aiService = new AiService();