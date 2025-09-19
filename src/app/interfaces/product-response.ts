

export interface categoryResponse {
    status: number;
    message: string;
    categories: Category[]
}
export interface Category {
    name: string;
    category_id: number;
}

export interface productResponse {
    status: number;
    message: string;
    products: Product[];
}

export interface Product {
    id: number;
    name: string;
    quantity: number;
    price: number;
    description: string;
    category_id: number;
    image: string;
    created_at: string;
    updated_at: string;
}

export interface productResponseById {
    status: number;
    images: string[];
    message: string;
    product: productResponse[]
}

export interface productResponse {
    id: number;
    name: string;
    quantity: number;
    price: number;
    description: string;
    category_id: number;
    image: string;
    created_at: string;
    updated_at: string;
}

export interface productSortingResponse {
    currentPage:number;
    product:productResponse[];
    totalPages:number;
    totalRecords:number
}

export interface searchProductResponse {
    status: number;
    message: string;
    searchProductResponse: Product[];
}