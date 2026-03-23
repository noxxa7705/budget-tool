// AI Module — OpenAI-compatible endpoint abstraction with streaming + single-shot fallback
const DEFAULT_LLM_ENDPOINT = '';
const DEFAULT_LLM_MODEL = 'gpt-4.1-mini';
const DEFAULT_VISION_MODEL = 'gpt-4.1-mini';

function formatCapabilityLabel(value) {
  const labels = {
    vision: 'Vision',
    reasoning: 'Reasoning',
    tools: 'Tools',
    json: 'JSON',
    audio: 'Audio',
  };
  return labels[value] || value;
}

function normalizeModalities(...values) {
  const out = new Set();

  const visit = (value) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value === 'string') {
      value
        .split(/[,\s]+/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
        .forEach((item) => out.add(item));
      return;
    }
    if (typeof value === 'object') {
      Object.values(value).forEach(visit);
    }
  };

  values.forEach(visit);
  return Array.from(out);
}

function coerceNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function inferCapabilities(model) {
  const raw = model || {};
  const id = String(raw.id || raw.name || '').toLowerCase();
  const capabilities = raw.capabilities || {};
  const modalities = normalizeModalities(
    raw.input_modalities,
    raw.output_modalities,
    raw.modalities,
    capabilities.input_modalities,
    capabilities.output_modalities,
    capabilities.modalities,
    raw.supported_modalities
  );
  const supported = normalizeModalities(
    raw.supported_features,
    raw.supported_generation_methods,
    raw.features,
    capabilities.supported_features,
    capabilities.supported_generation_methods,
    capabilities.features
  );

  const hasVision = Boolean(
    raw.supports_vision ||
      raw.vision ||
      capabilities.vision ||
      capabilities.supports_vision ||
      modalities.some((item) => ['image', 'vision'].includes(item)) ||
      /(?:vision|vl|llava|gpt-4o|gpt-4\.1|claude-3|claude-3\.5|claude-3\.7|gemini)/i.test(id)
  );

  const hasReasoning = Boolean(
    raw.reasoning ||
      raw.supports_reasoning ||
      capabilities.reasoning ||
      capabilities.supports_reasoning ||
      supported.some((item) => ['reasoning', 'thinking'].includes(item)) ||
      /(?:reason|thinking|deepseek-r1|\bqwq\b|\bo1\b|\bo3\b|\bo4\b|qwen3|\br1\b)/i.test(id)
  );

  const hasTools = Boolean(
    raw.supports_tools ||
      raw.supports_tool_calling ||
      raw.function_calling ||
      capabilities.tools ||
      capabilities.supports_tools ||
      capabilities.function_calling ||
      supported.some((item) => ['tool', 'tools', 'function', 'function_calling', 'tool_calling'].includes(item))
  );

  const hasJson = Boolean(
    raw.supports_json ||
      raw.response_format === 'json' ||
      capabilities.json ||
      capabilities.supports_json ||
      supported.some((item) => ['json', 'structured', 'structured_output', 'response_format'].includes(item))
  );

  const hasAudio = Boolean(
    raw.supports_audio ||
      capabilities.audio ||
      capabilities.supports_audio ||
      modalities.some((item) => ['audio', 'speech'].includes(item))
  );

  return [
    hasVision ? 'vision' : null,
    hasReasoning ? 'reasoning' : null,
    hasTools ? 'tools' : null,
    hasJson ? 'json' : null,
    hasAudio ? 'audio' : null,
  ].filter(Boolean);
}

function normalizeModel(raw) {
  const id = String(raw?.id || raw?.name || '').trim();
  if (!id) return null;

  const capabilities = inferCapabilities(raw);
  const contextWindow =
    coerceNumber(raw.context_window) ||
    coerceNumber(raw.max_context_length) ||
    coerceNumber(raw.max_input_tokens) ||
    coerceNumber(raw.max_tokens) ||
    coerceNumber(raw.token_limit) ||
    coerceNumber(raw?.capabilities?.context_window);
  const promptRateLimit =
    coerceNumber(raw.tpm) ||
    coerceNumber(raw.tokens_per_minute) ||
    coerceNumber(raw.prompt_tokens_per_minute) ||
    coerceNumber(raw?.capabilities?.tpm);
  const requestRateLimit =
    coerceNumber(raw.rpm) ||
    coerceNumber(raw.requests_per_minute) ||
    coerceNumber(raw?.capabilities?.rpm);

  const capabilityLabel = capabilities.length
    ? capabilities.map(formatCapabilityLabel).join(', ')
    : 'Text';

  return {
    id,
    label: id,
    dropdownLabel: `${id} — ${capabilityLabel}`,
    capabilities,
    contextWindow,
    promptRateLimit,
    requestRateLimit,
    raw,
  };
}

window.AI = {
  getConfig() {
    return {
      endpoint: localStorage.getItem('ai_endpoint') || DEFAULT_LLM_ENDPOINT,
      apiKey: localStorage.getItem('ai_key') || '',
      model: localStorage.getItem('ai_model') || DEFAULT_LLM_MODEL,
      visionEndpoint: localStorage.getItem('ai_vision_endpoint') || '',
      visionApiKey: localStorage.getItem('ai_vision_key') || '',
      visionModel: localStorage.getItem('ai_vision_model') || DEFAULT_VISION_MODEL,
    };
  },

  saveConfig(config) {
    localStorage.setItem('ai_endpoint', config.endpoint || DEFAULT_LLM_ENDPOINT);
    localStorage.setItem('ai_key', config.apiKey || '');
    localStorage.setItem('ai_model', config.model || DEFAULT_LLM_MODEL);
    localStorage.setItem('ai_vision_endpoint', config.visionEndpoint || '');
    localStorage.setItem('ai_vision_key', config.visionApiKey || '');
    localStorage.setItem('ai_vision_model', config.visionModel || DEFAULT_VISION_MODEL);
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
    if (!endpoint) {
      return { ok: false, error: 'no_endpoint', message: 'No endpoint provided.', models: [] };
    }

    const normalized = this.normalizeEndpoint(endpoint);
    if (window.location.protocol === 'https:' && normalized.startsWith('http://')) {
      return {
        ok: false,
        error: 'mixed_content',
        message: 'HTTPS page cannot call an HTTP AI endpoint. Use HTTPS or run locally.',
        models: [],
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const resp = await fetch(`${normalized}/models`, {
        method: 'GET',
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        signal: controller.signal,
      });

      let models = [];
      let payload = null;
      try {
        payload = await resp.json();
      } catch (_) {
        payload = null;
      }

      if (resp.ok) {
        models = Array.isArray(payload?.data)
          ? payload.data.map(normalizeModel).filter(Boolean)
          : [];
      }

      return {
        ok: resp.ok,
        status: resp.status,
        error: resp.ok ? null : `http_${resp.status}`,
        message: resp.ok
          ? `Connected${models.length ? ` • ${models.length} model${models.length === 1 ? '' : 's'} discovered` : ''}`
          : `Connection failed (HTTP ${resp.status})`,
        models,
        raw: payload,
      };
    } catch (err) {
      return {
        ok: false,
        error: err?.name === 'AbortError' ? 'timeout' : 'network_error',
        message: err?.name === 'AbortError' ? 'Connection timed out.' : (err?.message || 'Connection failed.'),
        models: [],
      };
    } finally {
      clearTimeout(timeout);
    }
  },

  async getModels(endpoint, apiKey) {
    const result = await this.testConnection(endpoint, apiKey);
    return result.ok ? result.models : [];
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
    const model = config.llmModel || DEFAULT_LLM_MODEL;

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
        model,
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
