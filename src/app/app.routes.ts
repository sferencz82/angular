import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ChristmasTreeComponent } from './christmas-tree/christmas-tree.component';
import { ChristmaTreeClaudeComponent } from './christma-tree-claude/christma-tree-claude.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'about', component: AboutComponent},
    { path: 'christmas', component: ChristmasTreeComponent },
    { path: 'christmas-claude', component: ChristmaTreeClaudeComponent }
];
