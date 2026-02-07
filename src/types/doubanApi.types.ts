export interface DoubanImage {
    large: string;
}

export interface DoubanRating {
    value: string;
}

export interface DoubanSubjectPayload {
    id: string;
    title: string;
    card_subtitle: string;
    rating: DoubanRating;
    url: string;
    pic: DoubanImage;
    pubdate?: string[];
    year: string;
}

export interface DoubanInterestPayload {
    create_time: string | Date;
    status: string;
    subject: DoubanSubjectPayload;
}

export interface DoubanInterestsResponse {
    interests: DoubanInterestPayload[];
}
