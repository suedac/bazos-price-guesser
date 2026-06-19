import { CheerioCrawler } from '@crawlee/cheerio';
import { Actor } from 'apify';
import { buildURL, strictSearch } from './utils.js';
import { router } from './routes.js';
import { Input, Listing } from './types.js';
import { filterListings } from './open_router.js';
import { findPriceRange } from './range_calculator.js';
await Actor.init();

const proxyConfiguration = await Actor.createProxyConfiguration({ checkAccess: true });

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl: 100,
    requestHandler: router,
});
const input = await Actor.getInput<Input>();
const { keyword, location, maxPages } = input!;
await crawler.run([
    {
        url: buildURL(keyword, 0, location),
        userData: { keyword, location, pageIndex: 0, maxPages },
    },
]);
const dataset = await Actor.openDataset();
const { items } = await dataset.getData();
const listings = items as Listing[];
const strictFiltered: Listing[] = strictSearch(keyword, listings);
console.log(`Strict search count: ${strictFiltered.length}`);
strictFiltered.forEach((listing) => console.log(listing.title));
const filteredListings: Listing[] = await filterListings(strictFiltered, keyword);
console.log(JSON.stringify(filteredListings));
await findPriceRange(filteredListings);
await Actor.exit();
