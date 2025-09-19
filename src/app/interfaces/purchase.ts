export interface getVendors {
    status: "string";
    message: "string";
    vendors: vendor[];
}

export interface vendor {
    name: string;
    id: number;
}

export interface getProducts {
    status: "string";
    message: "string";
    products: product[];
}

export interface product {
    name: string;
    id: number;
}

export interface createPurchase {
    vendors: number,
    purchaseDate:string,
    purchaseProduct: purchaseProduct[]
}

export interface purchaseProduct {
    name: string;
    quantity: number;
    price: number;
    totalAmount: number
}

export interface getPurchaseDetails {
    status: string;
    message: number;
    purchase: purchase[]
}

export interface purchase {
    purchase_id: number
    vendor_name: string,
    product_name: string
    quantity: number,
    price: number,
    purchase_date: string
    total_amount: number,
    invoice_number:string,
    vendors_id:number,
    product_id:number,
    total:number,
}

export interface purchaseDataById {
    status: string;
    message: number;
    purchaseDataById: purchase[]
}


