import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Car {
  id: string;
  make: string;
  model: string;
  type: string;
  batteryKWh: number;
  plate: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  cars: Car[];
}

export interface ChargeSession {
  id: string;
  customerId: string;
  carId: string;
  location: string;
  priceChf: number;
  durationMinutes: number;
  energyKWh: number;
  estimatedRangeKm: number;
  startTimeUtc: string;
}

@Injectable({ providedIn: 'root' })
export class EvChargeApiService {
  private readonly baseUrl = 'https://localhost:50739';

  constructor(private readonly http: HttpClient) {}

  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // When JWT authentication is available, uncomment the following lines and
    // populate `token` with the signed JWT issued by the backend.
    // const token = '';
    // if (token) {
    //   headers = headers.set('Authorization', `Bearer ${token}`);
    // }

    return headers;
  }

  async getCustomers(): Promise<Customer[]> {
    return firstValueFrom(
      this.http.get<Customer[]>(`${this.baseUrl}/customers`, { headers: this.buildHeaders() })
    );
  }

  async getCustomer(customerId: string): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    return customers.find((customer) => customer.id === customerId);
  }

  async getAllCharges(): Promise<ChargeSession[]> {
    return firstValueFrom(
      this.http.get<ChargeSession[]>(`${this.baseUrl}/charges`, { headers: this.buildHeaders() })
    );
  }

  async getChargesForCustomer(customerId: string): Promise<ChargeSession[]> {
    return firstValueFrom(
      this.http.get<ChargeSession[]>(`${this.baseUrl}/customers/${customerId}/charges`, {
        headers: this.buildHeaders()
      })
    );
  }
}
