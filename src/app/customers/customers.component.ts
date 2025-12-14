import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EvChargeApiService, Customer } from '../evcharge-api.service';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private readonly api: EvChargeApiService, private readonly titleService: TitleService) {}

  async ngOnInit(): Promise<void> {
    this.titleService.setTitle('Customers');
    await this.loadCustomers();
  }

  async loadCustomers(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.customers = await this.api.getCustomers();
    } catch (error) {
      console.error('Unable to load customers', error);
      this.errorMessage = 'Unable to load customers at the moment. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }
}
