using GrubDash.Domain;
using Microsoft.EntityFrameworkCore;

namespace GrubDash.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Dish> Dishes => Set<Dish>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDish> OrderDishes => Set<OrderDish>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Dish
        modelBuilder.Entity<Dish>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedOnAdd();
            e.Property(x => x.Name).IsRequired();
            e.Property(x => x.Description).IsRequired();
            e.Property(x => x.Image_Url).IsRequired();
            e.Property(x => x.Price).IsRequired();
        });

        // Order
        modelBuilder.Entity<Order>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedOnAdd();
            e.Property(x => x.DeliverTo).IsRequired();
            e.Property(x => x.MobileNumber).IsRequired();
            e.Property(x => x.Status).IsRequired();

            e.HasMany(x => x.Dishes)
             .WithOne()
             .HasForeignKey("OrderId")
             .OnDelete(DeleteBehavior.Cascade);
        });

        // OrderDish
        modelBuilder.Entity<OrderDish>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedOnAdd();
            e.Property(x => x.Name).IsRequired();
            e.Property(x => x.Description).IsRequired();
            e.Property(x => x.Image_Url).IsRequired();
            e.Property(x => x.Price).IsRequired();
            e.Property(x => x.Quantity).IsRequired();
        });

        base.OnModelCreating(modelBuilder);
    }
}