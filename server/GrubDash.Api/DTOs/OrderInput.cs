using System.Text.Json.Serialization;
using GrubDash.Domain;

namespace GrubDash.Api;

public record OrderInput(
    [property: JsonPropertyName("deliverTo")] string DeliverTo,
    [property: JsonPropertyName("mobileNumber")] string MobileNumber,
    string Status,
    List<OrderDish> Dishes
);