export interface CategoryResponse {
    status: number;
    message: string;
    categories: Category[]
}
export interface Category {
    category_id: number;
    name: string;
    created_at: string
    updated_at: string
}

export interface CategoryResponseById {
    status: number;
    message: string;
    category: Category;
}

export interface categorySortingResponse {
    category: Category[];
    currentPage: number;
    totalPages: number;
    totalRecords: number
}

export interface searchCategoryResponse {
    status: number;
    message: string;
    searchCategoryResponse: Category[];
}

