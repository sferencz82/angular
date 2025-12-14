import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  vehicles: Vehicle[];
}

export interface ChargeSession {
  id: number;
  customerId: number;
  location: string;
  costChf: number;
  durationMinutes: number;
  deliveredKwh: number;
  estimatedRangeKm: number;
  startTimeUtc: string;
}

@Injectable({ providedIn: 'root' })
export class EvChargeApiService {
  private readonly baseUrl = 'http://localhost:5000';

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

  async getAllCharges(): Promise<ChargeSession[]> {
    return firstValueFrom(
      this.http.get<ChargeSession[]>(`${this.baseUrl}/charges`, { headers: this.buildHeaders() })
    );
  }

  async getChargesForCustomer(customerId: number): Promise<ChargeSession[]> {
    return firstValueFrom(
      this.http.get<ChargeSession[]>(`${this.baseUrl}/customers/${customerId}/charges`, {
        headers: this.buildHeaders()
      })
    );
  }
}
