using System.Text.Json.Serialization;

namespace GrubDash.Api;

public record DishInput(
    string Name,
    string Description,
    [property: JsonPropertyName("image_url")] string Image_Url,
    int Price
);