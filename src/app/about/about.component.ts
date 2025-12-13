import { Component, OnInit } from '@angular/core';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {
  title = 'About Us';

  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
  }
}
