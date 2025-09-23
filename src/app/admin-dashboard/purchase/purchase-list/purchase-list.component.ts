import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PurchaseService } from '../../../services/purchase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { getPurchaseDetails, purchase } from '../../../interfaces/purchase';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, pipe } from 'rxjs';


@Component({
  selector: 'app-purchase-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatPaginatorModule],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.css'
})
export class PurchaseListComponent implements OnInit{

  public purchaseData:purchase[]=[]
  public totalPurchase = 0;
  public limit = 5;
  public pageIndex = 0;
  public sortBy:string = 'asc';
  public sortDir:string = 'id'
  public searchInput = new FormControl;

  constructor(private purchaseService: PurchaseService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getPurchaseData()
      this.searchInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      this.searchPurchaseData(value);
    });

  }

  public getPurchaseData(){
    console.log("call");
    
    let params = {
      searchValue: this.searchInput.value || '',
      page: this.pageIndex + 1,
      limit: this.limit,
      sortBy: this.sortBy || undefined,
      sortDir: this.sortDir || undefined
    };
    this.purchaseService.getPurchaseData(params).subscribe({
      next: (response:getPurchaseDetails)=>{
        console.log(response);
        
       this.purchaseData = response.purchases  
       this.totalPurchase = response.totalRecords
       console.log(this.purchaseData);
        
      }
    })
  }

  public onPageChange(event:PageEvent){
   this.pageIndex = event.pageIndex;
   this.limit = event.pageSize;
   this.getPurchaseData();
  }

  public searchPurchaseData(value: string | null) {
    if (!value || value.trim() === '') {
      this.getPurchaseData();
      return;
    }
    this.getPurchaseData();
  }

 public sortData(column: string, direction: 'asc' | 'desc') {
    this.sortBy = column;
    this.sortDir = direction;
    this.getPurchaseData();
  }

  
 
}
