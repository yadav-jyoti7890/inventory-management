import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { productResponseById } from '../../interfaces/product-response';
import { Product } from '../../interfaces/product-response';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-product',
  imports: [CommonModule],
  templateUrl: './show-product.component.html',
  styleUrl: './show-product.component.css'
})
export class ShowProductComponent implements OnInit{
 public productId!:number;
 public product:any;

  constructor(private activateRoute:ActivatedRoute, private productService:ProductService){}

  ngOnInit(): void {
    this.productId = this.activateRoute.snapshot.params['id']
    this.getProductsById(this.productId)
  }

  public getProductsById(id:number){
    this.productService.getProductById(id).subscribe({
      next:(response:any)=>{
      this.product = response.product
      console.log(this.product);
      },
      error:(error)=>{
        console.log(error);
        
      }
    })
  }


}
