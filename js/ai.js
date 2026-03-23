// AI Module — LLM endpoint abstraction with streaming + single-shot fallback
window.AI = {
  // Config management
  getConfig() {
    return {
      endpoint: localStorage.getItem('ai_endpoint') || '',
      apiKey: localStorage.getItem('ai_key') || '',
      visionEndpoint: localStorage.getItem('ai_vision_endpoint') || '',
      visionApiKey: localStorage.getItem('ai_vision_key') || '',
    };
  },

  saveConfig(config) {
    localStorage.setItem('ai_endpoint', config.endpoint || '');
    localStorage.setItem('ai_key', config.apiKey || '');
    localStorage.setItem('ai_vision_endpoint', config.visionEndpoint || '');
    localStorage.setItem('ai_vision_key', config.visionApiKey || '');
  },

  isConfigured() {
    const cfg = this.getConfig();
    return !!(cfg.endpoint || cfg.visionEndpoint);
  },

  // Normalize endpoint URL
  normalizeEndpoint(raw) {
    if (!raw) return '';
    let s = raw.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(s)) s = 'http://' + s;
    if (!/\/v1$/i.test(s)) s += '/v1';
    return s;
  },

  // Test endpoint connectivity
  async testConnection(endpoint, apiKey) {
    if (!endpoint) return false;
    try {
      const normalized = this.normalizeEndpoint(endpoint);
      const resp = await fetch(`${normalized}/models`, {
        method: 'GET',
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        timeout: 5000,
      });
      return resp.ok;
    } catch (err) {
      return false;
    }
  },

  // Fetch available models
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
    } catch (err) {
      return [];
    }
  },

  // Core streaming + single-shot runner
  async runAI(messages, options = {}) {
    const {
      endpoint = '',
      apiKey = '',
      model = 'gpt-3.5-turbo',
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

    // Try streaming
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
        // Not SSE, parse as JSON
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

      // Parse SSE stream
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
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const chunk = extractText(
                json.choices?.[0]?.delta?.content ||
                json.choices?.[0]?.delta?.text ||
                ''
              );
              // Skip reasoning tokens
              if (json.choices?.[0]?.delta?.reasoning_content !== undefined &&
                  json.choices?.[0]?.delta?.content === undefined) {
                continue;
              }
              if (chunk) {
                onChunk(chunk);
                fullText += chunk;
              }
            } catch (e) {
              // Malformed line, skip
            }
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
      // Fall through to single-shot
    }

    // Fallback: single-shot completion with simulated streaming
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

      // Simulate word-by-word streaming for consistent UX
      for (const word of text.split(' ')) {
        if (word) {
          onChunk(word + ' ');
          await new Promise(r => setTimeout(r, 8));
        }
      }
      onDone();
      return text;
    } catch (err) {
      onError(err.message);
      return '';
    }
  },

  // Parse natural language transaction
  async parseNaturalLanguage(input, config) {
    if (!config.llmEndpoint && !config.visionEndpoint) {
      throw new Error('No LLM configured');
    }

    const endpoint = config.llmEndpoint || config.visionEndpoint;
    const apiKey = config.llmEndpoint ? config.apiKey : config.visionApiKey;

    let result = '';
    await this.runAI(
      [
        {
          role: 'system',
          content: 'Parse a transaction description. Return ONLY a JSON object: {"amount": 12.34, "category": "groceries", "description": "item name", "date": "YYYY-MM-DD"}',
        },
        {
          role: 'user',
          content: input,
        },
      ],
      {
        endpoint,
        apiKey,
        model: 'gpt-3.5-turbo',
        onChunk: (chunk) => { result += chunk; },
        onDone: () => {},
      }
    );

    const parsed = parseJsonFromText(result);
    return parsed || null;
  },
};

// Make helper functions available
function extractText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(extractText).join('');
  if (value && typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;
    if (typeof value.content === 'string') return value.content;
    if (Array.isArray(value.content)) return value.content.map(extractText).join('');
    if (typeof value.output_text === 'string') return value.output_text;
    if (Array.isArray(value.parts)) return value.parts.map(extractText).join('');
  }
  return '';
}

function parseJsonFromText(text) {
  if (!text) return null;

  const cleaned = String(text || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  const arrIdx = cleaned.indexOf('[');
  const objIdx = cleaned.indexOf('{');
  let start = -1;

  if (arrIdx !== -1 && (objIdx === -1 || arrIdx < objIdx)) start = arrIdx;
  else if (objIdx !== -1) start = objIdx;

  if (start !== -1) {
    try {
      return JSON.parse(cleaned.slice(start));
    } catch (_) {}

    const opener = cleaned[start];
    const closer = opener === '[' ? ']' : '}';
    const end = cleaned.lastIndexOf(closer);
    if (end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (_) {}
    }
  }

  return null;
}
