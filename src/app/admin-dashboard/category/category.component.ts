import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category, CategoryResponseById, categorySortingResponse } from '../../interfaces/category';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog/confirm-dialog.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';




import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,MatSortModule,MatIconModule,MatFormFieldModule,MatInputModule,MatPaginatorModule
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  // Form Controls
  public categoryName = new FormControl('', Validators.required);
  public searchInput = new FormControl('');

  // Flags
  public categoryForm = false;
  public updateCategoryPopUp = false;

  // Category Data
  public categoryResponse: Category[] = [];
  public dataSource = new MatTableDataSource<Category>();
  public displayedColumns: string[] = ['sn', 'name', 'created_at', 'updated_at', 'action'];

  // Pagination & Sorting
  public totalCategory = 0;
  public limit = 5;
  public pageIndex = 0;
  public sortBy: string = 'name';
  public sortDir: string = 'asc';

  // Update category id
  public updateId!: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getAllCategory();

    // Debounce search
    this.searchInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      this.searchCategory(value);
    });
  }

  // ✅ Fetch All Category
  public getAllCategory() {
    const params = {
      searchValue: this.searchInput.value || '',
      page: this.pageIndex + 1,
      limit: this.limit,
      sortBy: this.sortBy || undefined,
      sortDir: this.sortDir || undefined
    };

    this.categoryService.getAllCategory(params).subscribe({
      next: (response: categorySortingResponse) => {
        this.categoryResponse = response.category;
        this.totalCategory = response.totalRecords;

        // this.dataSource = new MatTableDataSource(this.categoryResponse);
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // ✅ Add Category
  public addCategory() {
    if (this.categoryName.valid) {
      const name = this.categoryName.value ?? '';
      this.categoryService.createCategory(name).subscribe({
        next: () => {
          this.categoryForm = false;
          this.snackBar.open('Category added successfully!', 'Close', { duration: 3000 });
          this.getAllCategory();
        },
        error: (error) => console.log(error)
      });
    }
  }

  // ✅ Delete Category
  public deleteCategory(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this category?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.deleteCategory(id).subscribe({
          next: () => {
            this.snackBar.open('Category deleted successfully!', 'Close', { duration: 3000 });
            this.getAllCategory();
          },
          error: (error) => {
            console.log(error);
            this.snackBar.open(error.error.message, 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  // ✅ Edit Category
  public editCategory(id: number) {
    this.updateCategoryPopUp = true;
    this.updateId = id;

    this.categoryService.getCategoryById(id).subscribe({
      next: (response: CategoryResponseById) => {
        this.categoryName.patchValue(response.category.name);
      },
      error: (error) => console.log(error)
    });
  }

  // ✅ Update Category
  public updateCategory() {
    if (this.categoryName.valid) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { message: 'Are you sure you want to update this category?' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.categoryService.updateCategory(this.categoryName.value, this.updateId).subscribe({
            next: () => {
              this.updateCategoryPopUp = false;
              this.snackBar.open('Category updated successfully!', 'Close', { duration: 3000 });
              this.getAllCategory();
            },
            error: (error) => {
              console.log(error);
              this.updateCategoryPopUp = false;
              this.snackBar.open(error.error.message, 'Close', { duration: 3000 });
            }
          });
        } else {
          this.updateCategoryPopUp = false;
        }
      });
    }
  }

  // ✅ Sort
  public onSortChange(column: string, direction: 'asc' | 'desc') {
    this.sortBy = column;
    this.sortDir = direction;
    this.getAllCategory();
  }

  // ✅ Pagination
  public onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
    this.getAllCategory();
  }

  // ✅ Search
  public searchCategory(value: string | null) {
    if (!value || value.trim() === '') {
      this.getAllCategory();
      return;
    }
    this.getAllCategory();
  }

  // ✅ Utility Methods
  public showPopUp() {
    this.categoryForm = true;
  }

  public closeCategoryForm() {
    this.categoryForm = false;
    this.categoryName.reset();
  }

  public closeUpdateCategoryForm() {
    this.updateCategoryPopUp = false;
    this.categoryName.reset();
  }
}
