import { FormControl } from "@angular/forms";

export interface vendorForm{
  name : FormControl<string | null>;
  contact: FormControl<number | null>;
  address: FormControl<string | null>;
}