import { FormArray, FormControl, FormGroup } from "@angular/forms";

export interface ordersForm {
    customerId: FormControl<string | null>;
    orderDate: FormControl<string | null>;
    CustomerOrder: FormArray<FormGroup<orderDetails>>
    paymentMethod: FormControl<string | null>
    notes: FormControl<string | null>
}

export interface orderDetails {
    productId: FormControl<string | null>;
    quantity: FormControl<number | null>;
    price: FormControl<number | null>;
    totalAmount: FormControl<number | null>
}