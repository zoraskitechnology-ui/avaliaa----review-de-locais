export interface Review {
    id: string;
    place_id: string;
    user_id: string;
    accessibility: number;
    infrastructure: number;
    value: number;
    comment: string;
    photos?: Photo[];
    created_at: string;
    updated_at: string;
}

export interface Photo {
    id: string;
    review_id: string;
    url: string;
    created_at: string;
}

export interface Place {
    id: string;
    name: string;
    location: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    category?: string;
    created_by?: string;
    reviews?: Review[];
    aiSummary?: string;
    distance?: number;
    created_at: string;
    updated_at: string;
}

export interface Profile {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface PlaceSuggestion {
    name: string;
    location: string;
    address: string;
    latitude: number;
    longitude: number;
}
