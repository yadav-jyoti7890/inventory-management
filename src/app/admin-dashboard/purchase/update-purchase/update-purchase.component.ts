import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PurchaseService } from '../../../services/purchase.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createPurchase, getProducts, getVendors, product, purchase, purchaseDataById,  vendor } from '../../../interfaces/purchase';
import { purchaseForm, purchaseProduct } from '../../../interfaces/purchaseForm';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-update-purchase',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-purchase.component.html',
  styleUrl: './update-purchase.component.css'
})
export class UpdatePurchaseComponent implements OnInit {

  public vendors: vendor[] = [];
  public products: product[] = [];
  public purchaseId: number = 0;
  public purchaseData: purchase[] = [];
  public invoiceNumber: string = ''
  public readonly: boolean = true
  public grandTotal: number = 0;
  public purchaseForm = new FormGroup<purchaseForm>({
    vendors: new FormControl(0),
    purchaseDate: new FormControl(null),
    productsRow: new FormArray<FormGroup<purchaseProduct>>([this.createProductRow()])
  })

  constructor(private purchaseService: PurchaseService, private dialog: MatDialog, private snackBar: MatSnackBar,
    private router: ActivatedRoute
  ) { }
  ngOnInit(): void {
    this.getVendors()
    this.getProducts()
    this.purchaseId = this.router.snapshot.params['id']
    this.getProductsById()
  }

  private createProductRow(): FormGroup {
    const productGroup = new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity: new FormControl(null, Validators.required),
      price: new FormControl(null, Validators.required),
      totalAmount: new FormControl(null, Validators.required)
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

  public getProductsById() {
    console.log(this.purchaseId);
    this.purchaseService.getProductsById(this.purchaseId).subscribe({
      next: (response: purchaseDataById) => {
        console.log(response);
        this.purchaseData = response.purchaseDataById
        this.purchaseForm.patchValue({
          vendors: this.purchaseData[0].vendors_id,
          purchaseDate: this.purchaseData[0].purchase_date.substring(0, 10),
        })
        this.invoiceNumber = this.purchaseData[0].invoice_number
        this.grandTotal = this.purchaseData[0].total_amount

        const productsArray = this.purchaseForm.controls.productsRow as FormArray;
        productsArray.clear(); 

        this.purchaseData.forEach(item => {
          productsArray.push(
            new FormGroup({
              product: new FormControl(item.product_id, Validators.required),
              quantity: new FormControl(item.quantity, Validators.required),
              price: new FormControl(item.price, Validators.required),
              totalAmount: new FormControl(item.total, Validators.required)
            })
          );
        });

      }
    })
  }

  public updateProduct(){
    console.log(this.purchaseForm.value);
    const purchaseData = {
      vendors: this.purchaseForm.value.vendors,
      purchaseDate: this.purchaseForm.value.purchaseDate,
      purchaseProduct: this.purchaseForm.value.productsRow
    }
    this.purchaseService.updateProduct(this.purchaseId, purchaseData).subscribe({})

  }
}
