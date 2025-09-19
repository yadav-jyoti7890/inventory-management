import { Component, OnInit } from '@angular/core';
import { PurchaseService } from '../../../services/purchase.service';
import { createPurchase, getProducts, getVendors, product, vendor } from '../../../interfaces/purchase';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { purchaseForm, purchaseProduct } from '../../../interfaces/purchaseForm';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-create-purchase',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-purchase.component.html',
  styleUrl: './create-purchase.component.css'
})
export class CreatePurchaseComponent {
  public vendors: vendor[] = [];
  public products: product[] = [];
  public purchaseForm = new FormGroup<purchaseForm>({
    vendors: new FormControl(0),
    purchaseDate: new FormControl(null),
    productsRow: new FormArray<FormGroup<purchaseProduct>>([this.createProductRow()])
  })
  // public totalAmount!: number;
  public grandTotal: number = 0;
  public readonly: boolean = false
  constructor(private purchaseService: PurchaseService, private dialog: MatDialog, private snackBar: MatSnackBar) { }
  ngOnInit(): void {
    // this.getPurchaseData()
    this.getVendors()
    this.getProducts()
  }

  private createProductRow(): FormGroup {
    const productGroup = new FormGroup({
      product: new FormControl(null),
      quantity: new FormControl(null),
      price: new FormControl(null),
      totalAmount: new FormControl(null)
    });
    return productGroup
  }

  public addProductRow(i: string) {
    const addProductRow = this.purchaseForm.controls.productsRow as FormArray;
    addProductRow.push(this.createProductRow())
  }

  public removeProductRow(i: string) {
    const removeProduct = this.purchaseForm.controls.productsRow as FormArray;
    removeProduct.removeAt(removeProduct.length - 1)
  }

  public calculateTotalAmount(i: number) {
    const ProductRow = this.purchaseForm.controls.productsRow.controls.at(i)
    const price = ProductRow?.controls.price.value || 0;
    const quantity = ProductRow?.controls.quantity.value || 0
    const totalAmount = quantity * price
    ProductRow?.controls.totalAmount.setValue(totalAmount)
    // this.grandTotalAmount()
  }

  public grandTotalAmount() {
    let total = 0
    const ProductArray = this.purchaseForm.controls.productsRow
    ProductArray.controls.forEach(element => {
      const price = element.controls.price.value || 0
      const quantity = element.controls.quantity.value || 0
      total = (quantity * price)
    });
  }

  public createPurchase() {
    console.log(this.purchaseForm.value);
    this.purchaseService.createPurchase(this.purchaseForm.value as createPurchase).subscribe({
      next: (response) => {
        this.snackBar.open('purchase create successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
      },
      error: (error) => {
        this.snackBar.open(error.error, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });

      }
    })
  }

  private getVendors() {
    this.purchaseService.getVendors().subscribe({
      next: (response: getVendors) => {
        console.log(response);

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

}

