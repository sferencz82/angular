import { Component, OnInit } from '@angular/core';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  title = 'Welcome to the Home Page';

  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
  }
}
