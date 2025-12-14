import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ChristmasTreeComponent } from './christmas-tree/christmas-tree.component';
import { ChristmaTreeClaudeComponent } from './christma-tree-claude/christma-tree-claude.component';
import { CustomersComponent } from './customers/customers.component';
import { RecentChargesComponent } from './recent-charges/recent-charges.component';
import { CustomerChargesComponent } from './customers/customer-charges.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'about', component: AboutComponent},
    { path: 'customers', component: CustomersComponent },
    { path: 'customers/:customerId/charges', component: CustomerChargesComponent },
    { path: 'charges', component: RecentChargesComponent },
    { path: 'christmas', component: ChristmasTreeComponent },
    { path: 'christmas-claude', component: ChristmaTreeClaudeComponent }
];
