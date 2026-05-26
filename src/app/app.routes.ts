import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';
import { ProductDetails } from './components/product-details/product-details';
import { Order } from './components/order/order';
import { MainLayout } from './components/main-layout/main-layout';
import { AllProducts } from './components/all-products/all-products';
import { Login } from './components/login/login';
import { authGuard } from './shared/guards/auth-guard';
import { ContactUs } from './components/contact-us/contact-us';
import { Policy } from './components/policy/policy';
import { SearchResults } from './components/search-results/search-results/search-results';

export const routes: Routes = [
  {
    // Pages with Header and Footer
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/home/home').then((m) => m.Home),
        title: 'Home',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./components/home/home').then((m) => m.Home),
        title: 'Home',
      },
      {
        path: 'allProducts',
        loadComponent: () =>
          import('./components/all-products/all-products').then(
            (m) => m.AllProducts,
          ),
        title: 'All Products',
      },
      {
        path: 'discount-products',
        loadComponent: () =>
          import('./components/discount-Products/discount-Products').then(
            (m) => m.DiscountProductsComponent,
          ),
        title: 'Discount Products',
      },
      {
        path: 'new-arrival-products',
        loadComponent: () =>
          import('./components/new-arrival-products/new-arrival-products').then(
            (m) => m.NewArrivalProductsComponent,
          ),
        title: 'New Arrival Products',
      },
      {
        path: 'product-details/:id',
        loadComponent: () =>
          import('./components/product-details/product-details').then(
            (m) => m.ProductDetails,
          ),
        title: 'Product Details',
      },
      {
        path: 'search-results',
        loadComponent: () =>
          import('./components/search-results/search-results/search-results').then(
            (m) => m.SearchResults,
          ),
        title: 'Search Results',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/profile/profile').then(
            (m) => m.ProfileComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'previous-orders',
        loadComponent: () =>
          import('./components/previous-orders/previous-orders').then(
            (m) => m.PreviousOrders,
          ),
        canActivate: [authGuard],
        title: 'Previous Orders',
      },
      {
        path: 'order',
        loadComponent: () =>
          import('./components/order/order').then((m) => m.Order),
        title: 'Checkout',
      },
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./components/contact-us/contact-us').then((m) => m.ContactUs),
        title: 'Contact-us',
      },
      {
        path: 'policy',
        loadComponent: () =>
          import('./components/policy/policy').then((m) => m.Policy),
        title: 'Policy',
      },
    ],
  },

  // Pages without Header and Footer
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.Login),
    title: 'Login',
  },

  // Notfound
  {
    path: 'order-confirmation',
    loadComponent: () =>
      import('./components/not-found/not-found').then((m) => m.NotFound),
  },
];
