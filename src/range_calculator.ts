import { Actor } from 'apify';
import { Listing } from './types.js';

export async function findPriceRange(listings: Listing[]) {
    if (listings.length === 0) {
        throw new Error('No listings to analyze :( Are you sure the item youre looking for exists? :D');
    }
    const validListings = listings.filter((l) => !isNaN(l.parsedPrice) && l.parsedPrice > 0);
    const sorted: Listing[] = validListings.sort((a, b) => a.parsedPrice - b.parsedPrice);
    const priceDataset = await Actor.openDataset({ alias: 'priceAnalysis' });
    await priceDataset.pushData({
        summary: {
            minPrice: sorted[0].parsedPrice,
            maxPrice: sorted[sorted.length - 1].parsedPrice,
            suggestedLow: sorted[Math.floor(sorted.length * 0.25)].parsedPrice,
            suggestedHigh: sorted[Math.floor(sorted.length * 0.75)].parsedPrice,
            median: sorted[Math.floor(sorted.length / 2)].parsedPrice,
        },
        listings: {
            min: sorted[0],
            max: sorted[sorted.length - 1],
            median: sorted[Math.floor(sorted.length / 2)],
            p25: sorted[Math.floor(sorted.length * 0.25)],
            p75: sorted[Math.floor(sorted.length * 0.75)],
        },
    });
}
