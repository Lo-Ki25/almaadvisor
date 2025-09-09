export interface LLMProvider {
  generateText(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string>
}

export class OpenAIProvider implements LLMProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "gpt-3.5-turbo") {
    this.apiKey = apiKey
    this.model = model
  }

  async generateText(prompt: string, options: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ""
  }
}

export class AnthropicProvider implements LLMProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "claude-3-sonnet-20240229") {
    this.apiKey = apiKey
    this.model = model
  }

  async generateText(prompt: string, options: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content[0]?.text || ""
  }
}

export class GroqProvider implements LLMProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "llama3-8b-8192") {
    this.apiKey = apiKey
    this.model = model
  }

  async generateText(prompt: string, options: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ""
  }
}

export class LLMProviderFactory {
  static createProvider(provider: string, apiKey: string): LLMProvider {
    switch (provider.toLowerCase()) {
      case "openai":
        return new OpenAIProvider(apiKey)
      case "anthropic":
        return new AnthropicProvider(apiKey)
      case "groq":
        return new GroqProvider(apiKey)
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`)
    }
  }
}