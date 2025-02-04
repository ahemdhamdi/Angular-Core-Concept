import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo:"auth",pathMatch:"full"},
    { path: 'auth',loadComponent: () => import('./Shared/components/layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),},
    { path: 'profile/:name',loadComponent: () => import('./Components/profile/profile.component').then(m => m.ProfileComponent),},
    { path: '**', redirectTo: '' }, //Or route for 404 handling
];
