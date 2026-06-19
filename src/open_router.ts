import { OpenRouter } from '@openrouter/sdk';
import { Listing } from './types.js';

const client = new OpenRouter({
    serverURL: 'https://openrouter.apify.actor/api/v1',
    apiKey: process.env.APIFY_TOKEN,
});

export async function filterListings(listings: Listing[], keyword: string): Promise<Listing[]> {
    const minimalListings = listings.map((item, index) => ({ index, title: item.title }));

    const result = await client.chat.send({
        chatRequest: {
            model: 'google/gemini-2.5-flash',
            maxTokens: 1000,
            messages: [
                {
                    role: 'user',
                    content: `The user searched for: ${keyword}. Here are listings from a Czech marketplace: ${JSON.stringify(minimalListings)}. Return ONLY the listings that are actually ${keyword} for sale — filter out accessories, cases, spare parts, and unrelated items. Return ONLY a JSON array of numbers representing the indices of relevant listings. No explanation, no markdown, just the raw JSON array. Example: [0, 2, 5]`,
                },
            ],
        },
    });
    console.log('OpenRouter raw response:', result.choices[0].message.content);
    const raw = result.choices[0].message
        .content!.replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    const indices = JSON.parse(raw);
    return indices.map((i: number) => listings[i]);
}
