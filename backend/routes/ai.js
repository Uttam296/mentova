const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * POST /api/ai/chat
 * Proxies requests to Groq API so the API key stays server-side.
 * Requires auth token.
 *
 * Free tier: https://console.groq.com/keys (no credit card required)
 * Groq uses an OpenAI-compatible chat completions format.
 */
router.post('/chat', auth, async (req, res) => {
  try {
    const { messages, system } = req.body;

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(500).json({
        message: 'GROQ_API_KEY not configured in server .env file. Get a free key at https://console.groq.com/keys'
      });
    }

    // Groq follows the OpenAI chat format: roles are "system"/"user"/"assistant"
    // and the system prompt goes as the first message in the array (not a
    // separate field like Gemini).
    const chatMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...(messages || []).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        message: error.error?.message || 'Groq API error'
      });
    }

    const data = await response.json();

    const text = data.choices?.[0]?.message?.content || '';

    // Normalize to a consistent shape so the frontend's response-parsing
    // code (data.content[].text) doesn't need to change.
    res.json({
      content: [{ type: 'text', text }]
    });
  } catch (err) {
    console.error('AI proxy error:', err);
    res.status(500).json({ message: 'Internal server error in AI proxy.' });
  }
});

module.exports = router;
