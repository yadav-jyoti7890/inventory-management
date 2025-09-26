import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, RouterLink, MatPaginatorModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit{
public totalRecords:number = 0;
public limit:number = 5;
public pageIndex: number = 0;
public sortBy: string = 'asc';
public sortDir: string = 'id'
public searchInput = new FormControl

constructor(private orderService: OrdersService, private dialog: MatDialog, private snackBar: MatSnackBar){}

ngOnInit(): void {
  this.getOrderData()
  this.searchInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
    this.searchOrderData(value);
  });
}

public getOrderData(){
  const params = {
    searchValue: this.searchInput.value || '',
    page: this.pageIndex + 1,
    limit: this.limit,
    sortBy: this.sortBy || 'asc',
    sortDir: this.sortDir || 'id'
  }
  this.orderService.getOrders(params).subscribe({
    next: (response)=>{
      console.log(response);
    
    }
  })
}

public onPageChange(event: PageEvent){
  this.pageIndex = event.pageIndex;
  this.limit = event.pageSize;
  this.getOrderData()
}

public searchOrderData(value:string){
if(!value || value.trim() === ''){
  this.pageIndex = 0
  this.getOrderData();
  return;
}
this.pageIndex = 0
this.getOrderData();
}

}