using EVCharging.Api.Models;

namespace EVCharging.Api.Repositories;

public interface IChargeRepository
{
    IReadOnlyList<ChargeSession> GetAll();
    IReadOnlyList<ChargeSession> GetByCustomerId(Guid customerId);
}
