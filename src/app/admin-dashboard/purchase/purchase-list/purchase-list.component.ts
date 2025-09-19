import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PurchaseService } from '../../../services/purchase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { getPurchaseDetails, purchase } from '../../../interfaces/purchase';


@Component({
  selector: 'app-purchase-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.css'
})
export class PurchaseListComponent implements OnInit{

  public purchaseData:purchase[]=[]

  constructor(private purchaseService: PurchaseService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getPurchaseData()
  }

  public getPurchaseData(){
    this.purchaseService.getPurchaseData().subscribe({
      next: (response:getPurchaseDetails)=>{
       this.purchaseData = response.purchase   
      }
    })
  }
 
}
