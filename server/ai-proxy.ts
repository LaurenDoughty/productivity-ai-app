/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';

interface GenerateRequest {
  prompt: string;
  model?: string;
}

/**
 * Groq AI proxy endpoint
 * Uses Groq's fast inference API with Llama models
 */
export async function handleGenerateRequest(req: Request, res: Response): Promise<void> {
  try {
    const { prompt, model = 'llama-3.3-70b-versatile' } = req.body as GenerateRequest;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Invalid prompt' });
      return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY not set in server environment');
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    // Call Groq API (OpenAI-compatible)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      res.status(response.status).json({
        error: 'Failed to generate response',
        message: errorText,
      });
      return;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'No response generated';

    console.log(`Groq AI response generated successfully`);
    res.json({ text });
  } catch (error) {
    console.error('AI generation error:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      apiKeySet: !!process.env.GROQ_API_KEY,
    });
    res.status(500).json({
      error: 'Failed to generate response',
      message: (error as Error).message,
    });
  }
}
