import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PurchaseService } from '../../../services/purchase.service';
import { getProducts, product } from '../../../interfaces/purchase';
import { OrdersService } from '../../../services/orders.service';
import { customer, getCustomers } from '../../../interfaces/orders';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route, Router, RouterLink } from '@angular/router';
import { orderDetails, ordersForm } from '../../../interfaces/ordersForm';
import { ValidationDirective } from '../../../shared/validation.directive';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-create-orders',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, ValidationDirective],
  templateUrl: './create-orders.component.html',
  styleUrl: './create-orders.component.css'
})
export class CreateOrdersComponent implements OnInit {
  @ViewChild('stepTop', { static: false }) stepTop?: ElementRef<HTMLDivElement>;
  public currentStep: number = 1;
  public products: product[] = [];
  public customers: customer[] = [];
  public termsAccepted: boolean = false;
  public orderForm = new FormGroup<ordersForm>({
    customerId: new FormControl(null, Validators.required),
    orderDate: new FormControl(null, Validators.required),
    CustomerOrder: new FormArray<FormGroup<orderDetails>>([this.createProductRow()]),
    paymentMethod: new FormControl(null, Validators.required),
    notes: new FormControl(null, Validators.required)
  })
  public grandTotal: number = 0;
  public isSaving:boolean  = false;
  public isSuccess: boolean = false;
  // public isDisabled: boolean = true;

  constructor(private purchaseService: PurchaseService, private orderService: OrdersService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getCustomers()
    this.getProducts()
  }

  public goto(value: number) {
    if (this.orderForm.controls.customerId.value == null || this.orderForm.controls.orderDate.value == null) {
      this.orderForm.controls.customerId.markAsTouched();
      this.orderForm.controls.orderDate.markAsTouched();
      this.currentStep = 1;
    }
    else if ((this.orderForm.get('CustomerOrder') as FormArray).controls.some(orderGroup =>
      orderGroup.get('productId')?.value == null ||
      orderGroup.get('quantity')?.value == null || orderGroup.get('quantity')?.value <= 0 ||
      orderGroup.get('price')?.value == null || orderGroup.get('price')?.value <= 0
    )) {
      (this.orderForm.get('CustomerOrder') as FormArray).controls.forEach(orderGroup => {
        orderGroup.get('productId')?.markAsTouched();
        orderGroup.get('quantity')?.markAsTouched();
        orderGroup.get('price')?.markAsTouched();
      });
      this.currentStep = 2;
    }
    else {
      this.currentStep = value;
    }
  }

  private getCustomers() {
    this.orderService.getCustomers().subscribe({
      next: (response: getCustomers) => {
        console.log(response);
        this.customers = response.customers
      }
    })
  }

  private getProducts() {
    this.purchaseService.getProducts().subscribe({
      next: (response: getProducts) => {
        console.log(response);
        this.products = response.products;
      }
    })
  }

  private createProductRow(): FormGroup {
    console.log("createProductRow");

    const productGroup = new FormGroup({
      productId: new FormControl(null, Validators.required),
      quantity: new FormControl(1, Validators.required,),
      price: new FormControl(null, Validators.required),
      totalAmount: new FormControl(null, Validators.required)
    });
    console.log(productGroup);

    return productGroup
  }

  public addProductRow() {
    console.log("addProductRow");
    const addProductRow = this.orderForm.controls.CustomerOrder as FormArray;
    addProductRow.push(this.createProductRow())
  }

  public calculateTotalAmount(i: number) {
    const ProductRow = this.orderForm.controls.CustomerOrder.controls.at(i)
    const price = ProductRow?.controls.price.value ?? null
    const quantity = ProductRow?.controls.quantity.value ?? 1

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
  }

  public grandTotalAmount() {
    let total = 0;
    const ProductArray = this.orderForm.controls.CustomerOrder;
    ProductArray.controls.forEach((element , index:number)=> {
      const ProductRow = this.orderForm.controls.CustomerOrder.controls.at(index)
      const quantity = element.controls.quantity.value ?? 1;
      const price = element.controls.price.value ?? 0;
      const rowTotal = quantity * price;
      ProductRow?.controls.totalAmount.setValue(rowTotal)
      total += rowTotal;
      
    });
    this.grandTotal = total;
  }

  public removeProductRow() {
    const removeProduct = this.orderForm.controls.CustomerOrder as FormArray;
    removeProduct.removeAt(removeProduct.length - 1)
    this.grandTotalAmount()
  }

  public saveOrders() {
    console.log(this.orderForm.value);
    if (this.orderForm.controls.paymentMethod.value === null || this.orderForm.controls.notes.value === null) {
      this.orderForm.controls.paymentMethod.markAsTouched()
      this.orderForm.controls.notes.markAsTouched()
    }
    if (this.orderForm.valid) {
      
      this.isSaving = true;
      this.isSuccess = false;
      const orders = {
        customerId: this.orderForm.controls.customerId.value,
        orderDate: this.orderForm.controls.orderDate.value,
        paymentMethod: this.orderForm.controls.paymentMethod.value,
        notes: this.orderForm.controls.notes.value,
        orderDetails: this.orderForm.controls.CustomerOrder.value
      }
      
      console.log(this.orderForm.value, this.orderForm.valid);
      this.orderService.saveOrders(orders).subscribe({
        next: (response) => {
          console.log(response)
          this.isSaving = false;
          this.isSuccess = true;

          setTimeout(() => {
            this.isSuccess = false;
            this.router.navigate(['/order-list'])
          }, 3000);

        },
        error: (error) => {
          console.log(error);  
          this.snackBar.open(error.error.message, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          this.isSaving = false;
        }
      })

    } else {
      this.orderForm.markAllAsTouched()
    }

  }

  public selectProduct(i: number, event: any) {
    const parts = event.target.value.split(":");
    const value = parts[1].trim()
    this.products.map((x) => {
      if (x.id == value) {
        const product = this.orderForm.controls.CustomerOrder.controls.at(i)
        const price = product?.controls.price
        product?.patchValue({ price: x.price })
        // price?.disable()
        this.grandTotalAmount()
      }
    })
  }





}
