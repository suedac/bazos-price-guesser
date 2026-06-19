export interface Input {
    keyword: string;
    location: string;
    maxPages: number;
}
export interface Listing {
    title: string;
    price: string;
    parsedPrice: number;
    location: string;
    description: string;
    listingUrl: string | undefined;
}
