using System.Text.Json.Serialization;
using GrubDash.Data;
using GrubDash.Domain;
using GrubDash.Api;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = null;
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------- Database ----------
var cs =
    builder.Configuration["DATABASE_URL"] ??
    builder.Configuration.GetConnectionString("Default") ??
    "Host=localhost;Port=5433;Database=grubdash;Username=postgres;Password=postgres";

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(cs, npg => npg.EnableRetryOnFailure(5)));

// ---------- CORS ----------
// Set FRONTEND_ORIGIN to your deployed site (e.g. https://your-frontend.vercel.app)
// You can also give multiple, comma-separated origins.
var originsEnv = builder.Configuration["FRONTEND_ORIGIN"];
string[] allowedOrigins =
    string.IsNullOrWhiteSpace(originsEnv)
        ? new[] { "http://localhost:5173" }  // dev default
        : originsEnv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(allowedOrigins)
     .AllowAnyHeader()
     .AllowAnyMethod()
));

// ---------- Build ----------
var app = builder.Build();

app.UseCors();

// Swagger: keep in dev; optional in prod
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Optional: apply migrations automatically (safe on Neon)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.MapGet("/health", () => Results.Ok(new { ok = true }));

// =====================================================================
//                         Validation
// =====================================================================
(bool ok, string? message) ValidateDish(Dish d)
{
    if (string.IsNullOrWhiteSpace(d.Name)) return (false, "Dish must include a name.");
    if (string.IsNullOrWhiteSpace(d.Description)) return (false, "Dish must include a description.");
    if (string.IsNullOrWhiteSpace(d.Image_Url)) return (false, "Dish must include a image_url.");
    if (d.Price <= 0) return (false, "Dish must have a price that is an integer greater than 0.");
    return (true, null);
}

var validStatuses = new HashSet<string> { "pending", "preparing", "out-for-delivery", "delivered" };

(bool ok, string? message) ValidateOrder(Order o, bool isUpdate = false)
{
    if (string.IsNullOrWhiteSpace(o.DeliverTo)) return (false, "Order must include a deliverTo.");
    if (string.IsNullOrWhiteSpace(o.MobileNumber)) return (false, "Order must include a mobileNumber.");
    if (o.Dishes is null || o.Dishes.Count == 0) return (false, "Order must include at least one dish.");
    for (var i = 0; i < o.Dishes.Count; i++)
        if (o.Dishes[i].Quantity <= 0)
            return (false, $"Dish {i} must have a quantity that is an integer greater than 0.");

    if (isUpdate)
    {
        if (string.IsNullOrWhiteSpace(o.Status)) return (false, "Order must have a status.");
        if (!validStatuses.Contains(o.Status))
            return (false, "Order must have a status of pending, preparing, out-for-delivery, delivered.");
    }
    return (true, null);
}

// =====================================================================
//                                Dishes
// =====================================================================

app.MapGet("/dishes", async (AppDbContext db) =>
{
    var list = await db.Dishes.AsNoTracking().ToListAsync();
    return Results.Ok(new { data = list });
});

app.MapGet("/dishes/{dishId}", async (AppDbContext db, int dishId) =>
{
    var dish = await db.Dishes.FindAsync(dishId);
    return dish is null ? Results.NotFound() : Results.Ok(new { data = dish });
});

// CREATE dish
app.MapPost("/dishes", async (AppDbContext db, DishInput input) =>
{
    var d = new Dish
    {
        Name = input.Name,
        Description = input.Description,
        Image_Url = input.Image_Url,
        Price = input.Price
    };

    var (ok, msg) = ValidateDish(d);
    if (!ok) return Results.BadRequest(new { error = msg });

    db.Dishes.Add(d);
    await db.SaveChangesAsync();
    return Results.Created($"/dishes/{d.Id}", new { data = d });
});

// UPDATE dish by route id
app.MapPut("/dishes/{dishId}", async (AppDbContext db, int dishId, DishInput input) =>
{
    var d = await db.Dishes.FindAsync(dishId);
    if (d is null) return Results.NotFound();

    d.Name = input.Name;
    d.Description = input.Description;
    d.Image_Url = input.Image_Url;
    d.Price = input.Price;

    var (ok, msg) = ValidateDish(d);
    if (!ok) return Results.BadRequest(new { error = msg });

    await db.SaveChangesAsync();
    return Results.Ok(new { data = d });
});

// DELETE a dish
app.MapDelete("/dishes/{dishId}", async (AppDbContext db, int dishId) =>
{
    var d = await db.Dishes.FindAsync(dishId);
    if (d is null) return Results.NotFound();
    db.Dishes.Remove(d);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// =====================================================================
//                                Orders
// =====================================================================

// LIST ORDERS
app.MapGet("/orders", async (AppDbContext db) =>
{
    var list = await db.Orders
        .AsNoTracking()
        .Include(o => o.Dishes)
        .Select(o => new
        {
            id = o.Id,
            deliverTo = o.DeliverTo,
            mobileNumber = o.MobileNumber,
            status = o.Status,
            dishes = o.Dishes.Select(d => new
            {
                id = d.Id,
                name = d.Name,
                price = d.Price,
                quantity = d.Quantity
            }).ToList()
        })
        .ToListAsync();

    return Results.Ok(new { data = list });
});

// GET ORDER BY ID
app.MapGet("/orders/{orderId}", async (AppDbContext db, int orderId) =>
{
    var o = await db.Orders
        .AsNoTracking()
        .Include(x => x.Dishes)
        .Where(x => x.Id == orderId)
        .Select(x => new
        {
            id = x.Id,
            deliverTo = x.DeliverTo,
            mobileNumber = x.MobileNumber,
            status = x.Status,
            dishes = x.Dishes.Select(d => new
            {
                id = d.Id,
                name = d.Name,
                price = d.Price,
                quantity = d.Quantity
            }).ToList()
        })
        .FirstOrDefaultAsync();

    return o is null ? Results.NotFound() : Results.Ok(new { data = o });
});

// CREATE order
app.MapPost("/orders", async (AppDbContext db, OrderInput input) =>
{
    var o = new Order
    {
        DeliverTo = input.DeliverTo,
        MobileNumber = input.MobileNumber,
        Status = string.IsNullOrWhiteSpace(input.Status) ? "pending" : input.Status,
        Dishes = new List<OrderDish>()
    };

    foreach (var d in (input.Dishes ?? new List<OrderDish>()))
    {
        o.Dishes.Add(new OrderDish
        {
            Name        = string.IsNullOrWhiteSpace(d.Name) ? "Item" : d.Name!,
            Description = d.Description ?? string.Empty,
            Image_Url   = d.Image_Url   ?? string.Empty,
            Price       = d.Price,
            Quantity    = Math.Max(1, d.Quantity),
        });
    }

    var (ok, msg) = ValidateOrder(o, isUpdate: false);
    if (!ok) return Results.BadRequest(new { error = msg });

    db.Orders.Add(o);
    await db.SaveChangesAsync();
    return Results.Created($"/orders/{o.Id}", new
    {
        data = new
        {
            id = o.Id,
            deliverTo = o.DeliverTo,
            mobileNumber = o.MobileNumber,
            status = o.Status,
            dishes = o.Dishes.Select(x => new { id = x.Id, name = x.Name, price = x.Price, quantity = x.Quantity })
        }
    });
});

// UPDATE order by route id (upsert owned dishes to avoid tracking conflicts)
app.MapPut("/orders/{orderId}", async (AppDbContext db, int orderId, OrderInput input) =>
{
    var o = await db.Orders
        .Include(x => x.Dishes)
        .FirstOrDefaultAsync(x => x.Id == orderId);

    if (o is null) return Results.NotFound();

    // scalars
    o.DeliverTo    = input.DeliverTo;
    o.MobileNumber = input.MobileNumber;
    o.Status       = input.Status;

    o.Dishes.Clear();

    foreach (var d in (input.Dishes ?? new List<OrderDish>()))
    {
        var name = string.IsNullOrWhiteSpace(d.Name) ? "Item" : d.Name!;
        var desc = string.IsNullOrWhiteSpace(d.Description) ? name : d.Description!;
        var img  = string.IsNullOrWhiteSpace(d.Image_Url) ? "" : d.Image_Url!;

        o.Dishes.Add(new OrderDish
        {
            Name        = name,
            Description = desc,
            Image_Url   = img,
            Price       = d.Price,
            Quantity    = Math.Max(1, d.Quantity)
        });
    }

    // validate after normalization
    var (ok, msg) = ValidateOrder(o, isUpdate: true);
    if (!ok) return Results.BadRequest(new { error = msg });

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        data = new
        {
            id = o.Id,
            deliverTo = o.DeliverTo,
            mobileNumber = o.MobileNumber,
            status = o.Status,
            dishes = o.Dishes.Select(x => new
            {
                id = x.Id,
                name = x.Name,
                price = x.Price,
                quantity = x.Quantity
            })
        }
    });
});

// DELETE order
app.MapDelete("/orders/{orderId}", async (AppDbContext db, int orderId) =>
{
    var o = await db.Orders.FindAsync(orderId);
    if (o is null) return Results.NotFound();

    db.Remove(o);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();