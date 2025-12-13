using EVCharging.Api.Models;

namespace EVCharging.Api.Repositories;

public interface ICustomerRepository
{
    IReadOnlyList<Customer> GetAll();
    Customer? GetById(Guid id);
}
