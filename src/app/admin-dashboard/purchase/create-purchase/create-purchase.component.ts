import { Component, OnInit } from '@angular/core';
import { PurchaseService } from '../../../services/purchase.service';
import { createPurchase, getProducts, getVendors, product, vendor } from '../../../interfaces/purchase';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { purchaseForm, purchaseProduct } from '../../../interfaces/purchaseForm';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-create-purchase',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-purchase.component.html',
  styleUrl: './create-purchase.component.css'
})
export class CreatePurchaseComponent {
  public vendors: vendor[] = [];
  public products: product[] = [];
  public checkProductId: number[] = [];
  public purchaseForm = new FormGroup<purchaseForm>({
    vendors: new FormControl(0),
    purchaseDate: new FormControl(null),
    productsRow: new FormArray<FormGroup<purchaseProduct>>([this.createProductRow()])
  })
  public rowOptions: { [key: number]: { id: number; name: string }[] } = {};

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
    const rowIndex = addProductRow.length
    this.rowOptions[rowIndex] = [...this.products];
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
    this.grandTotalAmount()
  }

  public grandTotalAmount() {
    console.log("grandTotalAmount");

    let total = 0;
    const ProductArray = this.purchaseForm.controls.productsRow;
    ProductArray.controls.forEach(element => {
      const quantity = element.controls.quantity.value ?? 0;
      const price = element.controls.price.value ?? 0;
      const rowTotal = quantity * price;
      total += rowTotal;
    });
    this.grandTotal = total;
    console.log(this.grandTotal);

  }


  public createPurchase() {
    console.log(this.purchaseForm.value);
    this.purchaseService.createPurchase(this.purchaseForm.value as createPurchase).subscribe({
      next: (response) => {
        console.log(response);

        this.snackBar.open('purchase create successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
        this.router.navigate(['./purchase-list'])
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


  public filterProductArray(currentIndex: number): product[] {
    let selectedValue = this.purchaseForm.controls.productsRow.controls
      .map((x, index: number) => index !== currentIndex ? +x.get('product')?.value! : null)
      .filter((id): id is number => !!id);
    return this.products.filter(p => !selectedValue.includes(p.id));
  }


}

