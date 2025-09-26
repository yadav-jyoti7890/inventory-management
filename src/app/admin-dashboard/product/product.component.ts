import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { product, productForm } from '../../interfaces/products';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { Category, categoryResponse, Product, productResponse, productResponseById, productSortingResponse, searchProductResponse } from '../../interfaces/product-response';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';


@Component({
  selector: 'app-product',
  imports: [CommonModule, ReactiveFormsModule, MatPaginatorModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {


  public productForm = new FormGroup<productForm>({
    name: new FormControl('', Validators.required),
    quantity: new FormControl(null, Validators.required),
    price: new FormControl(null, Validators.required),
    description: new FormControl('', Validators.required),
    category_id: new FormControl(null, Validators.required),
    image: new FormControl('', Validators.required),
    photos: new FormControl([], Validators.required),
  })
  public category: Category[] = []
  public products: Product[] = []
  public updateProductPopUp: boolean = false;
  public previewImages: string[] = [];
  public productImages: string[] = [];
  public pageIndex: number = 0;
  public pageSize: number = 5;
  public totalProducts: number = 0;
  public sortBy: string = 'name'
  public sortDir: 'asc' | 'desc' = 'asc';
  public searchInput = new FormControl('');


  constructor(private ProductService: ProductService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getallProducts()
    this.searchInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      this.searchProducts(value)
    })
  }

  public getallProducts() {
    const params = {
      searchValue: this.searchInput.value || '',
      page: this.pageIndex + 1,
      limit: this.pageSize,
      sortBy: this.sortBy || undefined,
      sortDir: this.sortDir
    };
    console.log(params);
    
    this.ProductService.getAllProducts(params).subscribe({
      next: (res: productSortingResponse) => {
        this.products = res.product;
        this.totalProducts = res.totalRecords;
      },
      error: (err) => console.error(err)
    });
  }

  public deleteProduct(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this Product?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ProductService.deleteProduct(id).subscribe({
          next: (response) => {
            this.snackBar.open('Category deleted successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
            this.getallProducts()
          },
          error: (error) => {
            //console.log(error);
            this.snackBar.open(error.error.message, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          }
        })

      }
    });
  }

  public onSortChange(column: string, direction: 'asc' | 'desc') {
    this.sortBy = column;
    this.sortDir = direction;
    this.getallProducts();
  }

  public onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getallProducts();
  }

  public searchProducts(value: string | null) {
    if (!value || value.trim() === '') {
      this.getallProducts();  
      return;
    }else{
      this.getallProducts()
    }
  
    // this.ProductService.searchData(value).subscribe({
    //   next: (response: searchProductResponse) => {
    //     this.products = response.searchProductResponse;
    //     console.log(response);
        
    //   },
    //   error: (error) => {
    //     console.log(error);
    //   }
    // });
  }



}