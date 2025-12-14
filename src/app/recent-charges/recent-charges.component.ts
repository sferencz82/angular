import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvChargeApiService, ChargeSession } from '../evcharge-api.service';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-recent-charges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-charges.component.html',
  styleUrl: './recent-charges.component.css'
})
export class RecentChargesComponent implements OnInit {
  charges: ChargeSession[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private readonly api: EvChargeApiService, private readonly titleService: TitleService) {}

  async ngOnInit(): Promise<void> {
    this.titleService.setTitle('Recent Charges');
    await this.loadCharges();
  }

  async loadCharges(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.charges = await this.api.getAllCharges();
    } catch (error) {
      console.error('Unable to load charges', error);
      this.errorMessage = 'Unable to load recent charges at the moment. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }
}
