import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PurchaseService } from '../../../services/purchase.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createPurchase, getProducts, getVendors, product, purchase, purchaseDataById, vendor } from '../../../interfaces/purchase';
import { purchaseForm, purchaseProduct } from '../../../interfaces/purchaseForm';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog/confirm-dialog.component';
import { ValidationDirective } from '../../../shared/validation.directive';


@Component({
  selector: 'app-update-purchase',
  imports: [CommonModule, ReactiveFormsModule, ValidationDirective],
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
  public isDisabled: boolean = true;

  constructor(private purchaseService: PurchaseService, private dialog: MatDialog, private snackBar: MatSnackBar,
    private router: ActivatedRoute, private navigateRouter: Router
  ) { }
  ngOnInit(): void {
    this.getVendors()
    this.getProducts()
    this.purchaseId = this.router.snapshot.params['id']
    this.getProductsById()
    this.purchaseForm.controls['vendors'].disable();
    this.purchaseForm.controls['purchaseDate'].disable();
    // this.invoiceNumber.
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

  public updateProduct() {
     if(this.purchaseForm.valid){
       const purchaseData = {
      vendors: this.purchaseForm.value.vendors,
      purchaseDate: this.purchaseForm.value.purchaseDate,
      purchaseProduct: this.purchaseForm.value.productsRow,
      oldProducts: this.purchaseData
    }
 
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to update purchase data?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.purchaseService.updateProduct(this.purchaseId, purchaseData).subscribe({
          next: (response) => {
            this.snackBar.open('purchase create successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
            this.navigateRouter.navigate(['./purchase-list'])
          },
          error: (error) => {
            console.log(error)
            this.snackBar.open(error.message, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          }
        })
      }
    });

     }else{
       this.purchaseForm.markAllAsTouched()
     }

    // this.purchaseService.updateProduct(this.purchaseId, purchaseData).subscribe({
    //   next: (response)=>{
    //     console.log(response)
    //   }
    // })

  }

  public filterProductArray(currentIndex: number): product[] {
    let selectedValue = this.purchaseForm.controls.productsRow.controls
      .map((x, index: number) => index !== currentIndex ? +x.get('product')?.value! : null)
      .filter((id): id is number => !!id);
    return this.products.filter(p => !selectedValue.includes(p.id));
  }

  // public deleteCategory(id: number) {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     data: { message: 'Are you sure you want to delete this purchase?' }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.categoryService.deleteCategory(id).subscribe({
  //         next: () => {
  //           this.snackBar.open('Category deleted successfully!', 'Close', { duration: 3000 });
  //           this.getAllCategory();
  //         },
  //         error: (error) => {
  //           console.log(error);
  //           this.snackBar.open(error.error.message, 'Close', { duration: 3000 });
  //         }
  //       });
  //     }
  //   });
  // }
}
