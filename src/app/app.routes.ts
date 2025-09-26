import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-dashboard/admin-layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin-dashboard/mainbar/mainbar.component')
            .then(m => m.MainbarComponent)
      },
      {
        path: 'mainbar',
        loadComponent: () =>
          import('./admin-dashboard/mainbar/mainbar.component')
            .then(m => m.MainbarComponent)
      },
      {
        path: 'category',
        loadComponent: () =>
          import('./admin-dashboard/category/category.component')
            .then(m => m.CategoryComponent)
      },
      {
        path: 'product',
        loadComponent: () =>
          import('./admin-dashboard/product/product.component')
            .then(m => m.ProductComponent)
      },
      {
        path: 'update-product/:id',
        loadComponent: () =>
          import('./admin-dashboard/update-product/update-product.component')
            .then(m => m.UpdateProductComponent)
      },
      {
        path: 'create-product',
        loadComponent: () =>
          import('./admin-dashboard/create-product/create-product.component')
            .then(m => m.CreateProductComponent)
      },
      {
        path: 'show-product/:id',
        loadComponent: () =>
          import('./admin-dashboard/show-product/show-product.component')
            .then(m => m.ShowProductComponent)
      },
      {
        path: 'user-list',
        loadComponent: () =>
          import('./admin-dashboard/users/user-list/user-list.component')
            .then(m => m.UserListComponent)
      },
      {
        path: 'create-user',
        loadComponent: () =>
          import('./admin-dashboard/users/create-user/create-user.component')
            .then(m => m.CreateUserComponent)
      },
      {
        path: 'vendor-list',
        loadComponent: () =>
          import('./admin-dashboard/vendors/vendor-list/vendor-list.component')
            .then(m => m.VendorListComponent)
      },
      {
        path: 'purchase-list',
        loadComponent: () =>
          import('./admin-dashboard/purchase/purchase-list/purchase-list.component')
            .then(m => m.PurchaseListComponent)
      },
      {
        path: 'create-purchase',
        loadComponent: () =>
          import('./admin-dashboard/purchase/create-purchase/create-purchase.component')
            .then(m => m.CreatePurchaseComponent)
      },
      {
        path: 'update-purchase/:id',
        loadComponent: () =>
          import('./admin-dashboard/purchase/update-purchase/update-purchase.component')
            .then(m => m.UpdatePurchaseComponent)
      },
      {
        path: 'create-orders',
        loadComponent: () =>
          import('./admin-dashboard/orders/create-orders/create-orders.component')
            .then(m => m.CreateOrdersComponent)
      },
      {
        path: 'order-list',
        loadComponent: () =>
          import('./admin-dashboard/orders/order-list/order-list.component')
            .then(m => m.OrderListComponent)
      }
    ]
  }
];
