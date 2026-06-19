import { CheerioCrawler, createCheerioRouter } from '@crawlee/cheerio';
import { Actor } from 'apify';
import { buildURL } from './utils.js';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ request, $, log, addRequests }) => {
    $('.inzeraty.inzeratyflex').each((_, element) => {
        const title = $(element).find('.inzeratynadpis a').text();
        const listingUrl = $(element).find('.inzeratynadpis a').attr('href');
        const price = $(element).find('.inzeratycena span').text().trim();
        const parsedPrice = parseFloat(price.replace('Kč', '').replace(/\s/g, ''));
        const location = $(element).find('.inzeratylok').text();
        const description = $(element).find('.popis').text();

        Actor.pushData({ url: request.loadedUrl, title, parsedPrice, price, location, description, listingUrl });
    });
    const itemCount = $('.inzeraty.inzeratyflex').length;
    const { keyword, location, pageIndex, maxPages } = request.userData;
    if (itemCount === 20 && pageIndex + 1 < maxPages) {
        const nextPageIndex = pageIndex + 1;
        await addRequests([
            {
                url: buildURL(keyword, nextPageIndex, location),
                userData: { keyword, location, pageIndex: nextPageIndex, maxPages },
            },
        ]);
    }
    log.info(`scraped ${itemCount} items from this page.`);
});
