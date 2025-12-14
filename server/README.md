# EV Charging Minimal API (ASP.NET Core 9)

A lightweight EV charging backend that serves seeded customer and charging session data from JSON files. The project targets **.NET 9 minimal APIs** and keeps dependencies minimal for quick local testing.

## Endpoints
- `GET /charges` – All charging sessions (location, CHF cost, duration in minutes, delivered kWh, estimated range gained, start time UTC).
- `GET /customers` – All customers with their vehicles.
- `GET /customers/{id}/charges` – Charges for a specific customer. Returns `404` when the customer or their charges are missing.

Swagger is enabled by default and served at the application root so the API boots directly into the documentation UI.

## Data seeding
Seed data is stored in `seed/customers.json` and `seed/charges.json` and is copied to the output on build. Update these files to adjust sample customers, vehicles, or charging sessions.

## Run locally
1. Install the .NET 9 SDK (preview if required for your platform).
2. From the `server` folder run:
   ```bash
   dotnet restore
   dotnet run
   ```
3. Open `http://localhost:5000/` (or the port shown in the console) to try the endpoints; you will land on the Swagger UI by default.

CORS is open by default to simplify local frontend integration.
