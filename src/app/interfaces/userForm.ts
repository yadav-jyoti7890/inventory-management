import { FormControl } from "@angular/forms";

export interface userForm{
    name: FormControl<string | null>;
    email: FormControl<string | null>;
    contact: FormControl<number | null>;
    address: FormControl<string | null>;
}