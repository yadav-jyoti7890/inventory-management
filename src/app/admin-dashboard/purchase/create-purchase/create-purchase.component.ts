import { Component, OnInit } from '@angular/core';
import { PurchaseService } from '../../../services/purchase.service';
import { createPurchase, getProducts, getVendors, product, vendor } from '../../../interfaces/purchase';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { purchaseForm, purchaseProduct } from '../../../interfaces/purchaseForm';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { ValidationDirective } from '../../../shared/validation.directive';


@Component({
  selector: 'app-create-purchase',
  imports: [CommonModule, ReactiveFormsModule, ValidationDirective],
  templateUrl: './create-purchase.component.html',
  styleUrl: './create-purchase.component.css'
})
export class CreatePurchaseComponent {
  public vendors: vendor[] = [];
  public products: product[] = [];
  public checkProductId: number[] = [];
  public purchaseForm = new FormGroup<purchaseForm>({
    vendors: new FormControl(0, [Validators.required]),
    purchaseDate: new FormControl(null, [Validators.required]),
    productsRow: new FormArray<FormGroup<purchaseProduct>>([this.createProductRow()])
  })

  // public totalAmount!: number;
  public grandTotal: number = 0;
  public readonly: boolean = false
  constructor(private purchaseService: PurchaseService, private dialog: MatDialog, private snackBar: MatSnackBar, private router: Router) { }
  ngOnInit(): void {
    // this.getPurchaseData()
    this.getVendors()
    this.getProducts()
  }

  private createProductRow(): FormGroup {
    const productGroup = new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity: new FormControl(null, Validators.required,),
      price: new FormControl(null, Validators.required),
      totalAmount: new FormControl(null, Validators.required)
    });
    return productGroup
  }

  public addProductRow() {
    const addProductRow = this.purchaseForm.controls.productsRow as FormArray;
    addProductRow.push(this.createProductRow())
  }

  public removeProductRow() {
    const removeProduct = this.purchaseForm.controls.productsRow as FormArray;
    removeProduct.removeAt(removeProduct.length - 1)
    this.grandTotalAmount()
  }

  public calculateTotalAmount(i: number) {
    const ProductRow = this.purchaseForm.controls.productsRow.controls.at(i)
    const price = ProductRow?.controls.price.value ?? null
    const quantity = ProductRow?.controls.quantity.value ?? null

    if (price === null) {
      ProductRow?.controls.price.setErrors({ 'required': true })
    } else if (price < 1) {
      ProductRow?.controls.price.setErrors({ 'priceInvalid': true })
    } else {
      ProductRow?.controls.price.setErrors(null)
    }

    if (quantity === null) {
      ProductRow?.controls.quantity.setErrors({ 'required': true })
    } else if (quantity < 1) {
      ProductRow?.controls.quantity.setErrors({ 'quantityInvalid': true })
    } else {
      ProductRow?.controls.quantity.setErrors(null)
    }

    if (price != null && quantity != null) {
      const totalAmount = price * quantity;
      ProductRow?.controls.totalAmount.setValue(totalAmount)
      ProductRow?.controls.totalAmount.disable
      this.grandTotalAmount()
    }

    // ProductRow?.controls.totalAmount.setValue(totalAmount)

  }

  public grandTotalAmount() {

    let total = 0;
    const ProductArray = this.purchaseForm.controls.productsRow;
    ProductArray.controls.forEach(element => {
      const quantity = element.controls.quantity.value ?? 0;
      const price = element.controls.price.value ?? 0;
      const rowTotal = quantity * price;
      total += rowTotal;
    });
    this.grandTotal = total;
    //console.log(this.grandTotal);

  }


  public createPurchase() {
    // console.log(this.purchaseForm.value, this.purchaseForm.valid);
    if (this.purchaseForm.valid) {
      this.purchaseService.createPurchase(this.purchaseForm.value as createPurchase).subscribe({
        next: (response) => {
          this.snackBar.open('purchase create successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          this.router.navigate(['./purchase-list'])
        },
        error: (error) => {
          console.log((error));
          this.snackBar.open(error.error.message.message, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
        }
      })
    } else {
      console.log('Form Valid:', this.purchaseForm.valid);

      for (const controlName in this.purchaseForm.controls) {
        const control = this.purchaseForm.get(controlName);
        if (control?.invalid) {
          console.log('Invalid Control:', controlName, control.errors);
        }
      }

      this.purchaseForm.markAllAsTouched()
    }

  }

  private getVendors() {
    this.purchaseService.getVendors().subscribe({
      next: (response: getVendors) => {
        //console.log(response);
        this.vendors = response.vendors;
      }
    })
  }

  private getProducts() {
    this.purchaseService.getProducts().subscribe({
      next: (response: getProducts) => {
        this.products = response.products;
      }
    })
  }


  public filterProductArray(currentIndex: number): product[] {
    let selectedValue = this.purchaseForm.controls.productsRow.controls
      .map((x, index: number) => index !== currentIndex ? +x.get('product')?.value! : null)
      .filter((id): id is number => !!id);
    return this.products.filter(p => !selectedValue.includes(p.id));
  }


}

