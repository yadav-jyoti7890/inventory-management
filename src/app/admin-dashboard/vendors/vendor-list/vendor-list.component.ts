import { Component, OnInit } from '@angular/core';
import { VendorsService } from '../../../services/vendors.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetVendorsResponseByID, vendors, vendorsResponse } from '../../../interfaces/vendors-response';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { vendorForm } from '../../../interfaces/vendorForm';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog/confirm-dialog.component';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-vendor-list',
  imports: [CommonModule, MatPaginatorModule, ReactiveFormsModule],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.css'
})
export class VendorListComponent implements OnInit {
  public vendors: vendors[] = [];
  public vendorForm = new FormGroup<vendorForm>({
    name: new FormControl('', Validators.required),
    contact: new FormControl(null, Validators.required),
    address: new FormControl('', Validators.required),
  })
  public vendorCreateForm: boolean = false;
  public vendorUpdateForm: boolean = false;
  public vendorId: number = 0;
  public searchInput = new FormControl('');
  public totalVendors = 0;
  public limit = 5;
  public pageIndex = 0;
  public sortBy: string = 'name';
  public sortDir: string = 'asc';

  constructor(private vendorService: VendorsService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getAllVendors()
    this.searchInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      this.searchVendors(value)
    })
  }

  private getAllVendors() {
    const params = {
      searchValue: this.searchInput.value || '',
      pageIndex: this.pageIndex + 1,
      limit: this.limit,
      sortBy: this.sortBy,
      direction: this.sortDir
    }
    console.log(params);
    
    this.vendorService.getAllVendors(params).subscribe({
      next: (response) => {
        console.log(response); 
        this.vendors = response.vendors;
        this.totalVendors = response.totalRecords;
        console.log(this.vendors, this.totalVendors);
        
      }
    })
    // error: (error) => {
    //   console.log(error);
    // }

  }

  public closeVendorCreateForm() {
    this.vendorCreateForm = false;
  }

  public vendorCreatePopUp() {
    this.vendorCreateForm = !this.vendorCreateForm;
  }

  public createVendor() {
    if (this.vendorForm.valid) {
      this.vendorService.createVendor(this.vendorForm.value as vendors).subscribe({
        next: (response) => {
          this.snackBar.open('vendors create successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          this.closeVendorCreateForm();
          this.vendorForm.reset();
          this.getAllVendors()
        },
        error: (error) => {

        }
      })
    }
  }

  public showVendor(id: number) {
    if (id) {
      this.vendorUpdateForm = !this.vendorUpdateForm;
      this.vendorId = id;
      this.vendorService.getVendorsById(this.vendorId).subscribe({
        next: (response: GetVendorsResponseByID) => {
          this.vendorForm.setValue({
            name: response.vendor.name,
            contact: response.vendor.contact,
            address: response.vendor.address
          })
        }
      })
    }
  }

  public deleteVendor(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vendorService.deleteVendor(id).subscribe({
          next: (response) => {
            this.getAllVendors()
            this.snackBar.open('vendor deleted successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          },
          error: (error) => {
            this.snackBar.open(error.error.message, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
          }
        })
      }
    });
  }

  public updateVendor() {
    console.log(this.vendorForm.value);
    if (this.vendorForm.valid) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { message: 'Are you sure you want to update this vendor?' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.vendorService.updateVendor(this.vendorId, this.vendorForm.value as vendors).subscribe({
            next: () => {
              this.vendorForm.reset()
              this.vendorUpdateForm = false;
              this.snackBar.open('vendor updated successfully!', 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
              this.getAllVendors();
            },
            error: (error) => {
              console.log(error);
              this.vendorUpdateForm = false;
              this.snackBar.open(error.error.message, 'Close', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
            }
          });
        } else {
          this.vendorUpdateForm = false;
        }
      });
    }

  }

  public closeVendorUpdateForm() {
    this.vendorUpdateForm = false;
  }

  public onPageChange(event: PageEvent) {
    console.log(event);
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
    this.getAllVendors();
  }

  private searchVendors(value: string | null) {
    if (!value || value.trim() === '') {
      this.getAllVendors();
      return;
    } else {
      this.getAllVendors();
    }
  }

  public sorting(column: string, direction: string) {
    this.sortBy = column;
    this.sortDir = direction;
    console.log(this.sortBy, this.sortDir);
    
    this.getAllVendors();
  }

}
