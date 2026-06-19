import { CheerioCrawler, purgeDefaultStorages } from '@crawlee/cheerio';
import { beforeAll, describe, expect, it } from 'vitest';

import { router } from '../src/routes.js';
import { buildURL } from '../src/utils.js';

// Live test hits the real bazos.cz and is network-dependent. Skip by default;
// opt in with RUN_LIVE_TESTS=1 (e.g. `RUN_LIVE_TESTS=1 npm run test`).
const describeLive = process.env.RUN_LIVE_TESTS === '1' ? describe : describe.skip;

describeLive('CheerioCrawler (live)', () => {
    beforeAll(async () => {
        await purgeDefaultStorages();
    });

    it('should crawl a bazos search page and extract listings to dataset', async () => {
        const keyword = 'iphone';
        const location = '';
        const maxPages = 1;

        const crawler = new CheerioCrawler({
            maxRequestsPerCrawl: 10,
            requestHandler: router,
        });

        await crawler.run([
            {
                url: buildURL(keyword, 0, location),
                userData: { keyword, location, pageIndex: 0, maxPages },
            },
        ]);

        expect(crawler.stats.state.requestsFinished).toBeGreaterThanOrEqual(1);

        const { items } = await crawler.getData();
        expect(items.length).toBeGreaterThan(0);

        const [first] = items;
        expect(first.url).toContain('bazos.cz');
        expect(typeof first.title).toBe('string');
        expect(first.title.length).toBeGreaterThan(0);
        expect(typeof first.parsedPrice).toBe('number');
    }, 30_000);
});
