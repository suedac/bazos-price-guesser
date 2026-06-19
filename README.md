# Bazos Price Guesser

Scrapes [Bazos.cz](https://www.bazos.cz/) for a given search term and location, filters results using an LLM to remove accessories and unrelated listings, then outputs a suggested price range based on current market listings.

## How it works

1. **Crawl** — searches Bazos.cz for the given keyword and location, paginating up to `maxPages` pages (20 listings/page)
2. **Strict filter** — keeps only listings where every word in the keyword appears in the title (case- and diacritic-insensitive, so `kralove` matches `Králové`)
3. **AI filter** — sends titles to Gemini 2.5 Flash (via OpenRouter) to remove accessories, cases, spare parts, and other irrelevant items
4. **Price analysis** — sorts the remaining listings and computes min, max, median, and a suggested range (25th–75th percentile)

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | ✅ | Search term (e.g. `iPhone 13`) |
| `location` | string | ✅ | City or region to search in (e.g. `Praha`) |
| `maxPages` | integer | ❌ | Max pages to scrape, default `5` (100 listings) |

## Output

The Actor writes to two datasets:

### Default dataset
All raw scraped listings matching the search:

```json
{
  "title": "iPhone 13 128GB černý",
  "price": "8 500 Kč",
  "parsedPrice": 8500,
  "location": "Praha",
  "description": "Prodám iPhone 13...",
  "listingUrl": "https://www.bazos.cz/inzerat/...",
  "url": "https://www.bazos.cz/search.php?..."
}
```

### `priceAnalysis` dataset
A single record with price statistics computed from the AI-filtered listings — a numeric `summary` plus the actual `listings` behind each statistic:

```json
{
  "summary": {
    "minPrice": 7000,
    "maxPrice": 12000,
    "suggestedLow": 8000,
    "suggestedHigh": 10500,
    "median": 9500
  },
  "listings": {
    "min": { "title": "...", "parsedPrice": 7000, ... },
    "max": { "title": "...", "parsedPrice": 12000, ... },
    "median": { "title": "...", "parsedPrice": 9500, ... },
    "p25": { "title": "...", "parsedPrice": 8000, ... },
    "p75": { "title": "...", "parsedPrice": 10500, ... }
  }
}
```

`suggestedLow`/`suggestedHigh` correspond to the `p25`/`p75` listings (the 25th–75th percentile range).

## Usage example

**Input:**
```json
{
  "keyword": "iPhone 13",
  "location": "Praha",
  "maxPages": 3
}
```

This will scrape up to 60 listings for "iPhone 13" in Prague, filter out cases and chargers, and tell you what price range to expect.

## Local development

```bash
npm install
apify run
```

To deploy to Apify:

```bash
apify login
apify push
```

## Requirements

- Apify proxy access (used for crawling)
- `APIFY_TOKEN` env variable (used to authenticate with the OpenRouter proxy at `openrouter.apify.actor`)
