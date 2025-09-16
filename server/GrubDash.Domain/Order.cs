namespace GrubDash.Domain;

public class Order
{
    public int Id { get; set; }
    public string DeliverTo { get; set; } = default!;
    public string MobileNumber { get; set; } = default!;
    public string Status { get; set; } = "pending";
    public List<OrderDish> Dishes { get; set; } = new();
}