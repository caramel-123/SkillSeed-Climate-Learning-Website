// AI Screening Utility for Quest Verification
// Uses Groq Vision (llama-3.2-11b-vision-preview) to analyze submissions

import type { Quest } from '../types/database';

export interface AIScreeningResult {
  confidence: number;
  recommendation: 'approve' | 'review' | 'reject';
  reasoning: string;
  photo_analysis?: string;
  reflection_analysis?: string;
}

/**
 * Runs AI pre-screening on a quest submission using Groq Vision API
 * 
 * @param photoUrl - Public URL of the uploaded photo
 * @param reflection - User's reflection text
 * @param quest - Quest object with title, description, and tier
 * @returns AIScreeningResult or null if screening fails
 */
export const runAiScreening = async (
  photoUrl: string,
  reflection: string,
  quest: Quest
): Promise<AIScreeningResult | null> => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey) {
      console.warn('VITE_GROQ_API_KEY not configured - skipping AI screening');
      return null;
    }

    // Verify URL is accessible first
    console.log('Testing photo URL accessibility:', photoUrl);
    try {
      const testResponse = await fetch(photoUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        console.error('Photo URL not accessible:', testResponse.status);
        return null; // fall back to manual review
      }
    } catch (fetchErr) {
      console.error('Could not verify photo URL accessibility:', fetchErr);
      // Continue anyway - Groq might still be able to access it
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { 
                  url: photoUrl,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: `You are verifying a quest submission for SkillSeed, a climate learning platform based in the Philippines.

Quest: "${quest.title}"
Quest description: "${quest.description || 'No description provided'}"
Quest tier: "${quest.tier}" (beginner = badge reward, advanced = certificate reward)

The user submitted this reflection:
"${reflection}"

Carefully analyse BOTH the photo and the reflection together.

Check the following:
1. Does the photo show clear visual evidence of the quest being completed?
2. Does the reflection demonstrate genuine effort, learning, and understanding?
3. Is there consistency between what the photo shows and what the reflection describes?
4. Are there any red flags? (irrelevant photo, very short reflection, copy-pasted text, no real effort shown)

Respond ONLY in this exact JSON format with no other text, no markdown, no backticks:
{
  "confidence": <number from 0 to 100>,
  "recommendation": "<approve or review or reject>",
  "reasoning": "<2-3 sentences explaining your overall assessment>",
  "photo_analysis": "<1-2 sentences on what you see in the photo and whether it matches the quest>",
  "reflection_analysis": "<1-2 sentences on the quality and genuineness of the reflection>"
}`
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq screening error:', errorText);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    console.log('Raw Groq response:', text);

    // Clean and parse JSON (remove any potential markdown formatting)
    const clean = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const result = JSON.parse(clean) as AIScreeningResult;
    
    // Validate the result structure
    if (
      typeof result.confidence !== 'number' ||
      !['approve', 'review', 'reject'].includes(result.recommendation) ||
      typeof result.reasoning !== 'string'
    ) {
      console.error('Invalid AI screening result structure:', result);
      return null;
    }

    console.log('AI Screening Result:', result);
    return result;

  } catch (err) {
    console.error('AI screening failed:', err);
    return null; // fail gracefully — submission still goes through
  }
};

export default runAiScreening;
