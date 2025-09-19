import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProductService } from '../../services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, CategoryResponse } from '../../interfaces/category';
import { productResponse, productResponseById } from '../../interfaces/product-response';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatPaginatorModule],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css'
})
export class UpdateProductComponent implements OnInit {
  public productForm = new FormGroup({
    name: new FormControl<string | null>(null, Validators.required),
    quantity: new FormControl<number | null>(null, Validators.required),
    price: new FormControl<number | null>(null, Validators.required),
    description: new FormControl<string | null>(null, Validators.required),
    category_id: new FormControl<number | null>(null, Validators.required),
  });
  public category: Category[] = [];
  public id!: number;
  public singleImage: File | null = null;
  public singleImagePreview: string | null = null;
  public existingSingleImage: string | null = null;
  public productImages: File[] = [];
  public productImagesPreview: string[] = [];
  public existingImages: string[] = [];

  constructor(
    private ProductService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.params['id'];
    this.getProductById();
    this.getallCategory();
  }

  public getProductById() {
    this.ProductService.getProductById(this.id).subscribe((response: productResponseById) => {
      this.productForm.setValue({
        name: response.product[0].name,
        quantity: response.product[0].quantity,
        price: response.product[0].price,
        description: response.product[0].description,
        category_id: response.product[0].category_id,
      });


      this.existingSingleImage = response.product[0].image
        ? `http://localhost:3000/upload/${response.product[0].image}`
        : null;


      this.existingImages = response.images
        ? response.images.map((img: any) => `http://localhost:3000/upload/${img.image}`)
        : [];
    });
  }

  public onSingleImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.singleImage = file;

      const reader = new FileReader();
      reader.onload = (e: any) => (this.singleImagePreview = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  public onMultipleImageSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        this.productImages.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.productImagesPreview.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  public removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  public removeNewImage(index: number) {
    this.productImages.splice(index, 1);
    this.productImagesPreview.splice(index, 1);
  }

  public updateProduct() {
    const formData = new FormData();
    Object.keys(this.productForm.controls).forEach(key => {
      const value = this.productForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (this.singleImage) {
      formData.append("image", this.singleImage);
    } else if (this.existingSingleImage) {
      const filename = this.existingSingleImage.split("/").pop();
      if (filename) {
        formData.append("existingImage", filename);
      }
    }

    // --- Multiple new images ---
    this.productImages.forEach(file => {
      formData.append("photos", file); // new multiple images
    });

    // --- Multiple existing images ---
    this.existingImages.forEach(img => {
      const filename = img.split("/").pop(); // only filename, not full URL
      if (filename) {
        formData.append("existingImages", filename); // old multiple images
      }
    });

    console.log([...formData]); // debug

    this.ProductService.updateProduct(this.id, formData).subscribe({
      next: res => {
        this.snackBar.open("Product updated successfully!", "Close",{ duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
        this.router.navigate(['./product']);
      },
      error: err => {
        console.error(err);
        this.snackBar.open("Failed to update product!", "Close", { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
      }
    });
  }

  public getallCategory() {
    this.ProductService.getAllCategory().subscribe({
      next: (response: CategoryResponse) => {
        this.category = response.categories;
        console.log(this.category);

      },
      error: error => {
        console.log(error);
      }
    });
  }
}
