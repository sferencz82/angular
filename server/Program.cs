using EVCharging.Api.Models;
using EVCharging.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<ICustomerRepository, JsonCustomerRepository>();
builder.Services.AddSingleton<IChargeRepository, JsonChargeRepository>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "EV Charging API v1");
    options.RoutePrefix = string.Empty;
});

app.MapGet("/charges", (IChargeRepository repository) => Results.Ok(repository.GetAll()))
   .WithName("GetCharges")
   .WithOpenApi();

app.MapGet("/customers", (ICustomerRepository repository) => Results.Ok(repository.GetAll()))
   .WithName("GetCustomers")
   .WithOpenApi();

app.MapGet("/customers/{id:guid}/charges", (Guid id, ICustomerRepository customers, IChargeRepository charges) =>
{
    var customer = customers.GetById(id);
    if (customer is null)
    {
        return Results.NotFound(new { Message = $"Customer {id} was not found." });
    }

    var customerCharges = charges.GetByCustomerId(id);
    if (customerCharges.Count == 0)
    {
        return Results.NotFound(new { Message = $"No charges found for customer {id}." });
    }

    return Results.Ok(customerCharges);
})
.WithName("GetChargesForCustomer")
.WithOpenApi();

app.Run();
