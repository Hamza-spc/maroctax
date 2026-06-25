import { Routes } from '@angular/router';
import { AboutPageComponent } from './pages/about-page.component';
import { OfferBuilderPageComponent } from './pages/offer-builder-page.component';
import { TeamPlannerPageComponent } from './pages/team-planner-page.component';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'offer' },
  { path: 'offer', component: OfferBuilderPageComponent },
  { path: 'planner', component: TeamPlannerPageComponent },
  { path: 'about', component: AboutPageComponent },
  { path: '**', redirectTo: 'offer' },
];

