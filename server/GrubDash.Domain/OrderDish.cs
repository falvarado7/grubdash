namespace GrubDash.Domain;

public class OrderDish
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string Image_Url { get; set; } = default!;
    public int Price { get; set; }
    public int Quantity { get; set; }
}