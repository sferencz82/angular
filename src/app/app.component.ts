import { Component, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { TitleService } from './title.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  title = 'getting-started';
  private sub?: Subscription;

  constructor(private titleService: TitleService) {
    this.sub = this.titleService.getTitle().subscribe((t) => (this.title = t));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
