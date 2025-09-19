import { FormArray, FormControl, FormGroup } from "@angular/forms";

export interface purchaseForm{
    vendors: FormControl<number | null>;
    purchaseDate:FormControl<string | null>
    productsRow:FormArray<FormGroup<purchaseProduct>>
}

export interface purchaseProduct{
    product: FormControl<string | null>;
    quantity: FormControl<number | null>;
    price:FormControl<number | null>;
    totalAmount:FormControl<number | null>
}