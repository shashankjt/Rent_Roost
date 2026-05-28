export interface CreateListingDTO {
    title: string;
    description: string;
    price: number;
    location: string;
    image: string;
    amenities?: string[];
    images?: string[];
}

export interface PaginatedListings {
    listings: any[];
    nextCursor: number | null;
}

export interface IListingService {
    getAll(limit?: number, cursor?: number): Promise<PaginatedListings>;
    getById(id: number): Promise<any | null>;
    create(data: CreateListingDTO, ownerId: string): Promise<any>;
    getByOwner(ownerId: string): Promise<any[]>;
}
