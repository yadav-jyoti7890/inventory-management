import { FormControl } from "@angular/forms";

export interface productForm {
    name: FormControl<string | null>;
    quantity: FormControl<number | null>;
    price: FormControl<number | null>;
    description: FormControl<string | null>;
    category_id: FormControl<number | null>;
    image: FormControl<string | null>;
    photos: FormControl<File[] | null>; 
}

export interface product{
    name:string | null;
    quantity:number |  null;
    price:number | null;
    description:string | null;
    category_id:number | null;
    image:string | null;
    photos:File[] | null;
}

