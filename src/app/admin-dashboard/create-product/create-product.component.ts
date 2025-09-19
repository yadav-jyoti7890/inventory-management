import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { productForm } from '../../interfaces/products';
import { Category } from '../../interfaces/category';
import { categoryResponse, Product } from '../../interfaces/product-response';
import { ProductService } from '../../services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-create-product',
  imports: [ReactiveFormsModule, CommonModule, MatPaginatorModule],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.css'
})
export class CreateProductComponent implements OnInit{
  public productPopUp: boolean = false;
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
 

  constructor(private ProductService: ProductService, private dialog: MatDialog, private snackBar: MatSnackBar) { }
  ngOnInit(): void {
   this.getCategory()
  }

  public addProduct() {
    if (this.productForm.valid) {
      const formData = new FormData();
      formData.append('name', this.productForm.value.name ?? '');
      formData.append('quantity', String(this.productForm.value.quantity ?? 0));
      formData.append('price', String(this.productForm.value.price ?? 0));
      formData.append('description', this.productForm.value.description ?? '');
      formData.append('category_id', String(this.productForm.value.category_id ?? 0));
      if (this.productForm.value.image) {
        formData.append('image', this.productForm.value.image);
      }

      const photos: File[] = this.productForm.get('photos')?.value || [];
      photos.forEach((file: File) => {
        formData.append('photos', file);
      });
      console.log([...formData]);
      

      this.ProductService.createProduct(formData).subscribe({
        next: (response) => {
          this.productForm.reset();
          this.previewImages = [];
          this.productPopUp = false;
          this.snackBar.open('product create successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });

        },
        error: (error) => {
          alert("Error creating product");
        }
      });
    }
  }

  public onMultipleImageSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files) as File[];

      const existingFiles = this.productForm.get('photos')?.value || [];

      const updatedFiles = [...existingFiles, ...newFiles];

      this.productForm.get('photos')?.setValue(updatedFiles);

      this.previewImages = [];
      updatedFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
      console.log(this.productForm.controls.photos.value);

    }
  }

  private getCategory() {
    this.ProductService.getAllCategory().subscribe({
      next: (response: categoryResponse) => {
       this.category = response.categories as Category[]
      },
      error: (error) => {
      }
    })
  }

}
