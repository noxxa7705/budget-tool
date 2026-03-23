// AI Module — OpenAI-compatible endpoint abstraction with streaming + single-shot fallback
const DEFAULT_LLM_ENDPOINT = '';
const DEFAULT_LLM_MODEL = 'gpt-4.1-mini';
const DEFAULT_VISION_MODEL = 'gpt-4.1-mini';

window.AI = {
  getConfig() {
    return {
      endpoint: localStorage.getItem('ai_endpoint') || DEFAULT_LLM_ENDPOINT,
      apiKey: localStorage.getItem('ai_key') || '',
      visionEndpoint: localStorage.getItem('ai_vision_endpoint') || '',
      visionApiKey: localStorage.getItem('ai_vision_key') || '',
    };
  },

  saveConfig(config) {
    localStorage.setItem('ai_endpoint', config.endpoint || DEFAULT_LLM_ENDPOINT);
    localStorage.setItem('ai_key', config.apiKey || '');
    localStorage.setItem('ai_vision_endpoint', config.visionEndpoint || '');
    localStorage.setItem('ai_vision_key', config.visionApiKey || '');
  },

  isConfigured() {
    const cfg = this.getConfig();
    return !!(cfg.endpoint || cfg.visionEndpoint);
  },

  normalizeEndpoint(raw) {
    if (!raw) return '';
    let s = raw.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    if (!/\/v1$/i.test(s)) s += '/v1';
    return s;
  },

  async testConnection(endpoint, apiKey) {
    if (!endpoint) return false;
    try {
      const normalized = this.normalizeEndpoint(endpoint);
      const resp = await fetch(`${normalized}/models`, {
        method: 'GET',
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      });
      return resp.ok;
    } catch (_) {
      return false;
    }
  },

  async getModels(endpoint, apiKey) {
    if (!endpoint) return [];
    try {
      const normalized = this.normalizeEndpoint(endpoint);
      const resp = await fetch(`${normalized}/models`, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      });
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.data || [];
    } catch (_) {
      return [];
    }
  },

  async runAI(messages, options = {}) {
    const {
      endpoint = DEFAULT_LLM_ENDPOINT,
      apiKey = '',
      model = DEFAULT_LLM_MODEL,
      temperature = 0.7,
      onChunk = () => {},
      onDone = () => {},
      onError = () => {},
      signal = null,
    } = options;

    if (!endpoint) {
      onError('LLM endpoint not configured');
      return '';
    }

    const normalized = this.normalizeEndpoint(endpoint);
    const body = {
      model,
      messages,
      temperature,
      stream: true,
    };

    try {
      const resp = await fetch(`${normalized}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const contentType = resp.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        const json = await resp.json();
        const text = extractText(
          json.choices?.[0]?.message?.content ||
          json.choices?.[0]?.text ||
          json.output_text || ''
        );
        onChunk(text);
        onDone();
        return text;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line || line === ':ping') continue;
          if (line === 'data: [DONE]') {
            onDone();
            return fullText;
          }
          if (!line.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(line.slice(6));
            if (
              json.choices?.[0]?.delta?.reasoning_content !== undefined &&
              json.choices?.[0]?.delta?.content === undefined
            ) {
              continue;
            }

            const chunk = extractText(
              json.choices?.[0]?.delta?.content ||
              json.choices?.[0]?.delta?.text ||
              ''
            );

            if (chunk) {
              onChunk(chunk);
              fullText += chunk;
            }
          } catch (_) {
            // Ignore malformed SSE lines.
          }
        }
      }

      onDone();
      return fullText;
    } catch (err) {
      if (err.name === 'AbortError') {
        onError('Cancelled');
        return '';
      }
    }

    try {
      const resp = await fetch(`${normalized}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ ...body, stream: false }),
        signal,
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json();
      const text = extractText(
        json.choices?.[0]?.message?.content ||
        json.choices?.[0]?.text ||
        json.output_text || ''
      );

      for (const word of text.split(' ')) {
        if (!word) continue;
        onChunk(word + ' ');
        await new Promise((resolve) => setTimeout(resolve, 8));
      }

      onDone();
      return text;
    } catch (err) {
      onError(err.message || 'Request failed');
      return '';
    }
  },

  async parseNaturalLanguage(input, config) {
    if (!config.llmEndpoint && !config.visionEndpoint) {
      throw new Error('No LLM configured');
    }

    const endpoint = config.llmEndpoint || config.visionEndpoint || DEFAULT_LLM_ENDPOINT;
    const apiKey = endpoint === config.llmEndpoint ? config.apiKey : config.visionApiKey;

    let result = '';
    await this.runAI(
      [
        {
          role: 'system',
          content:
            'Parse a transaction description. Return ONLY a JSON object: {"amount": 12.34, "category": "cat-groceries", "description": "item name", "date": "YYYY-MM-DD"}',
        },
        {
          role: 'user',
          content: input,
        },
      ],
      {
        endpoint,
        apiKey,
        model: DEFAULT_LLM_MODEL,
        onChunk: (chunk) => {
          result += chunk;
        },
        onDone: () => {},
      }
    );

    const parsed = parseJsonFromText(result);
    return parsed || null;
  },

  defaults: {
    endpoint: DEFAULT_LLM_ENDPOINT,
    model: DEFAULT_LLM_MODEL,
    visionModel: DEFAULT_VISION_MODEL,
  },
};
