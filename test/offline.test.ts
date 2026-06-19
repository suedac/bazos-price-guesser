import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { AddressInfo } from 'node:net';

import { CheerioCrawler, purgeDefaultStorages } from '@crawlee/cheerio';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { router } from '../src/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureHtml = readFileSync(join(__dirname, 'fixtures', 'bazos-listing.html'), 'utf-8');

describe('CheerioCrawler (offline fixture)', () => {
    let server: Server;
    let baseUrl: string;

    beforeAll(async () => {
        await purgeDefaultStorages();

        server = createServer((_req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fixtureHtml);
        });

        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
        const { port } = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${port}/`;
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    });

    it('should parse listings from a saved bazos HTML fixture', async () => {
        const crawler = new CheerioCrawler({
            maxRequestsPerCrawl: 10,
            requestHandler: router,
        });

        await crawler.run([
            {
                url: baseUrl,
                userData: { keyword: 'iphone', location: '', pageIndex: 0, maxPages: 1 },
            },
        ]);

        expect(crawler.stats.state.requestsFinished).toBe(1);

        const { items } = await crawler.getData();
        // The fixture has three listings; the router extracts all of them.
        expect(items.length).toBe(3);

        const first = items[0];
        expect(first.title).toBe('Apple iPhone 13 128GB');
        expect(first.price).toBe('8 500 Kč');
        expect(first.parsedPrice).toBe(8500);
        expect(first.location).toContain('Praha');
        expect(first.description).toContain('iPhone 13');
        expect(first.listingUrl).toBe('/inzerat/111111/apple-iphone-13-128gb.php');
    }, 30_000);
});
