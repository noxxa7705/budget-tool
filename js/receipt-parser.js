// Receipt OCR Parser — vision API integration
const RECEIPT_VISION_MODEL = 'gpt-4.1-mini';

window.ReceiptParser = {
  merchantCategoryMap: {
    'whole foods': 'cat-groceries',
    'trader joe': 'cat-groceries',
    safeway: 'cat-groceries',
    kroger: 'cat-groceries',
    costco: 'cat-groceries',
    walmart: 'cat-shopping',
    target: 'cat-shopping',
    amazon: 'cat-shopping',
    starbucks: 'cat-coffee',
    dunkin: 'cat-coffee',
    'tim horton': 'cat-coffee',
    chipotle: 'cat-dining',
    panera: 'cat-dining',
    subway: 'cat-dining',
    mcdonald: 'cat-dining',
    'burger king': 'cat-dining',
    'chick-fil-a': 'cat-dining',
    'uber eats': 'cat-dining',
    doordash: 'cat-dining',
    grubhub: 'cat-dining',
    shell: 'cat-gas',
    chevron: 'cat-gas',
    exxon: 'cat-gas',
    bp: 'cat-gas',
    mobil: 'cat-gas',
    walgreens: 'cat-healthcare',
    cvs: 'cat-healthcare',
    'walmart pharmacy': 'cat-healthcare',
    'whole foods pharmacy': 'cat-healthcare',
    uber: 'cat-transport',
    lyft: 'cat-transport',
    taxi: 'cat-transport',
    cinema: 'cat-entertainment',
    movie: 'cat-entertainment',
    concert: 'cat-entertainment',
    spotify: 'cat-entertainment',
    netflix: 'cat-entertainment',
    hulu: 'cat-entertainment',
    steam: 'cat-entertainment',
  },

  async parseReceipt(imageBase64, config) {
    if (!config.llmEndpoint && !config.visionEndpoint) {
      throw new Error('No AI endpoint configured. Add one in Settings.');
    }

    const endpoint = config.visionEndpoint || config.llmEndpoint || window.AI.defaults.endpoint;
    const apiKey = endpoint === config.visionEndpoint ? config.visionApiKey : config.apiKey;
    const visionModel = config.visionModel || config.llmModel || RECEIPT_VISION_MODEL;

    if (!endpoint) {
      throw new Error('Vision endpoint not configured');
    }

    if (window.location.protocol === 'https:' && endpoint.startsWith('http://')) {
      throw new Error('Mixed content: HTTPS page cannot call HTTP endpoint. Use an HTTPS endpoint or test locally.');
    }

    const visionPrompt = `You are a receipt parser. Extract transaction data from this receipt image.
Return ONLY valid JSON (no markdown, no explanation):
{
  "merchant": "Store Name",
  "amount": 12.34,
  "currency": "USD",
  "date": "2024-03-23",
  "items": [{"description": "item name", "qty": 1, "price": 12.34}],
  "tip": 0,
  "tax": 0,
  "note": ""
}`;

    let result = '';
    await window.AI.runAI(
      [
        {
          role: 'user',
          content: [
            { type: 'text', text: visionPrompt },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64.split(',')[1],
              },
            },
          ],
        },
      ],
      {
        endpoint,
        apiKey,
        model: config.model || visionModel,
        temperature: 0.2,
        onChunk: (chunk) => {
          result += chunk;
        },
        onDone: () => {},
      }
    );

    const parsed = parseJsonFromText(result);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Could not parse receipt data');
    }

    return {
      merchant: String(parsed.merchant || 'Unknown').trim(),
      amount: parseFloat(parsed.amount) || 0,
      currency: String(parsed.currency || 'USD').trim(),
      date: String(parsed.date || new Date().toISOString().split('T')[0]),
      items: Array.isArray(parsed.items) ? parsed.items : [],
      tip: parseFloat(parsed.tip) || 0,
      tax: parseFloat(parsed.tax) || 0,
      note: String(parsed.note || '').trim(),
      category: this.suggestCategory(String(parsed.merchant || ''), parseFloat(parsed.amount) || 0),
    };
  },

  suggestCategory(merchant, amount) {
    const lower = merchant.toLowerCase();

    for (const [key, catId] of Object.entries(this.merchantCategoryMap)) {
      if (lower.includes(key)) return catId;
    }

    if (amount > 100 && (lower.includes('amazon') || lower.includes('store') || lower.includes('shop'))) {
      return 'cat-shopping';
    }

    return 'cat-other';
  },

  async parseReceiptWithAICategory(imageBase64, config) {
    const basic = await this.parseReceipt(imageBase64, config);

    try {
      const categoryPrompt = `Given this receipt:
Merchant: ${basic.merchant}
Amount: $${basic.amount}
Items: ${basic.items.map((i) => i.description).join(', ') || 'Not specified'}

Suggest a budget category from: groceries, dining, coffee, gas, shopping, utilities, healthcare, entertainment, transport, other.
Return ONLY the category name, nothing else.`;

      let suggestion = '';
      await window.AI.runAI(
        [{ role: 'user', content: categoryPrompt }],
        {
          endpoint: config.llmEndpoint || config.visionEndpoint || window.AI.defaults.endpoint,
          apiKey: config.apiKey || config.visionApiKey || '',
          model: config.llmModel || window.AI.defaults.model,
          onChunk: (chunk) => {
            suggestion += chunk;
          },
        }
      );

      const categoryMap = {
        groceries: 'cat-groceries',
        dining: 'cat-dining',
        coffee: 'cat-coffee',
        gas: 'cat-gas',
        shopping: 'cat-shopping',
        utilities: 'cat-utilities',
        healthcare: 'cat-healthcare',
        entertainment: 'cat-entertainment',
        transport: 'cat-transport',
        other: 'cat-other',
      };

      const lower = suggestion.toLowerCase().trim();
      for (const [key, catId] of Object.entries(categoryMap)) {
        if (lower.includes(key)) {
          basic.category = catId;
          break;
        }
      }
    } catch (_) {
      // Fall back to built-in suggestion.
    }

    return basic;
  },
};
