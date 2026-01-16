export interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    reviews: number;
    location: string;
    image: string;
    host: {
        name: string;
        image: string;
    };
    amenities: string[];
    images: string[]; // For potential future carousel
}
