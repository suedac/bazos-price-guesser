import { Listing } from './types.js';

export function buildURL(keyword: string, pageIndex: number, location: string): string {
    //TODO might want to parse the location string when it has space in it like hradec kralove
    const offset: number = pageIndex * 20;
    const parsedKeyword: string = keyword.replace(/\s/g, '+');
    const url = `https://www.bazos.cz/search.php?hledat=${parsedKeyword}&hlokalita=${location}&humkreis=25&cenaod=&cenado=&order=&crz=${offset}`;
    return url;
}
//normalizing the characters so czech/english character search doesn't matter
function normalize(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
//doing strict search filtering before send the data to openrouter
export function strictSearch(keyword: string, listings: Listing[]): Listing[] {
    const words = keyword.split(' ');
    return listings.filter((listing) => {
        return words.every((word) => normalize(listing.title).toLowerCase().includes(normalize(word).toLowerCase()));
    });
}
