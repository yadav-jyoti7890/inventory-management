export interface vendorsResponse {
    status: string;
    message: string;
    currentPage: number,
    totalPages:number,
    totalRecords:number
    vendors: vendors[];
}

export interface GetVendorsResponseByID {
    status: string;
    message: string;
    vendor: vendors;
}

export interface vendors {
    id: number;
    name: string;
    email: string;
    contact: number
    address: string;
}

