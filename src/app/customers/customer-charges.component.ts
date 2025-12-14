import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EvChargeApiService, ChargeSession, Customer } from '../evcharge-api.service';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-customer-charges',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-charges.component.html',
  styleUrl: './customer-charges.component.css'
})
export class CustomerChargesComponent implements OnInit {
  customer?: Customer;
  charges: ChargeSession[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: EvChargeApiService,
    private readonly titleService: TitleService
  ) {}

  async ngOnInit(): Promise<void> {
    const customerId = this.route.snapshot.paramMap.get('customerId');

    if (!customerId) {
      this.errorMessage = 'No customer selected.';
      return;
    }

    await this.loadCustomerAndCharges(customerId);
  }

  async loadCustomerAndCharges(customerId: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.customer = await this.api.getCustomer(customerId);

      if (!this.customer) {
        this.errorMessage = 'Customer not found.';
        return;
      }

      this.titleService.setTitle(`Charges • ${this.customer.name}`);

      const charges = await this.api.getChargesForCustomer(customerId);
      this.charges = [...charges].sort(
        (left, right) => new Date(right.startTimeUtc).getTime() - new Date(left.startTimeUtc).getTime()
      );
    } catch (error) {
      console.error('Unable to load customer charges', error);
      this.errorMessage = 'Unable to load charges for this customer. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  carLabelFor(charge: ChargeSession): string {
    const car = this.customer?.cars?.find((c) => c.id === charge.carId);
    if (!car) {
      return 'Unknown vehicle';
    }

    return `${car.make} ${car.model} (${car.plate})`;
  }
}
