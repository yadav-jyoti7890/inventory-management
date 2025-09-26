import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import { DashboardService } from '../../services/dashboard.service';
import { CategoryResponse, OrderResponse, ProductResponse, TodayOrderResponse, todayPurchaseResponse, totalPurchaseResponse, UserResponse, vendorsResponse } from '../../interfaces/dashboard';



@Component({
  selector: 'app-mainbar',
  imports: [RouterLink, HeaderComponent],
  templateUrl: './mainbar.component.html',
  styleUrl: './mainbar.component.css'
})
export class MainbarComponent implements OnInit {

  public totalUsers: number = 0;
  public totalCategories: number = 0;
  public totalProducts: number = 0;
  public totalOrders: number = 0;
  public totalTodayOrders: number = 0;
  public totalVendors: number = 0;
  public totalPurchase: number = 0;
  public totalTodayPurchase: number = 0;


  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.getTotalUsers()
    this.getTotalCategories()
    this.getTotalProducts()
    this.getTotalOrders()
    this.getTotalTodayOrders()
    this.getTotalVendors()
    this.getTotalPurchase()
    this.getTodayPurchase()

  }

  private getTotalUsers() {
    this.dashboardService.getTotalUsers().subscribe({
      next: (response: UserResponse) => {
        this.totalUsers = response.TotalUsers;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  private getTotalCategories() {
    this.dashboardService.getTotalCategories().subscribe({
      next: (response: CategoryResponse) => {
        this.totalCategories = response.totalCategories
      },
      error: (error) => {
        console.log(error);

      }
    })
  }

  private getTotalProducts() {
    this.dashboardService.getTotalProducts().subscribe({
      next: (response: ProductResponse) => {
        this.totalProducts = response.TotalProducts
      },
      error: (error) => {
        console.log(error);

      }
    })
  }

  private getTotalOrders() {
    this.dashboardService.getTotalOrders().subscribe({
      next: (response: OrderResponse) => {
        this.totalOrders = response.totalOrders
      },
      error: (error) => {
        console.log(error);

      }
    })
  }

  private getTotalTodayOrders() {
    this.dashboardService.getTotalTodayOrders().subscribe({
      next: (response: TodayOrderResponse) => {
        this.totalTodayOrders = response.totalTodayOrders
      },
      error: (error) => {
        console.log(error);

      }
    })
  }


  private getTotalVendors() {
    this.dashboardService.getTotalVendors().subscribe({
      next: (response: vendorsResponse) => {
        this.totalVendors = response.totalVendorsCount
      },
      error: (error) => {
        console.log(error);

      }
    })
  }

  private getTotalPurchase() {
    this.dashboardService.getTotalPurchase().subscribe({
      next: (response:totalPurchaseResponse) => {
        console.log(response, "getTotalPurchase");
        this.totalPurchase = response.totalPurchaseRecord
      },
      error: (error) => {
        console.log(error);

      }
    })
  }

  private getTodayPurchase() {
    this.dashboardService.getTodayPurchase().subscribe({
      next: (response:todayPurchaseResponse) => {
        console.log(response, "getTodayPurchase");
       this.totalTodayPurchase = response.todayPurchase
      },
      error: (error) => {
        console.log(error);

      }
    })
  }

}
