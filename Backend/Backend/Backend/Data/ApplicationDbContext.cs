using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Expense> Expenses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50);
            entity.Property(e => e.Fname).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Lname).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Password).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Role).IsRequired();
            entity.Property(e => e.Department).HasMaxLength(100).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Expense configuration
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50);
            entity.Property(e => e.UserId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.UserName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.UserDept).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Category).IsRequired();
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.ReceiptName).HasMaxLength(255);
            entity.Property(e => e.ReceiptData).HasMaxLength(4000);
            entity.Property(e => e.SubmittedAt).IsRequired();
            entity.Property(e => e.ReviewedAt);
            entity.Property(e => e.ReviewNote).HasMaxLength(1000);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Date);
        });

        // Seed demo data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        var now = DateTime.UtcNow;

        // Seed Users
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = "demo_emp",
                Fname = "Alex",
                Lname = "Lee",
                Email = "employee@demo.com",
                Password = "jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=", // demo123 hashed
                Role = UserRole.Employee,
                Department = "Engineering",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = "demo_mgr",
                Fname = "Morgan",
                Lname = "Grant",
                Email = "manager@demo.com",
                Password = "jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=", // demo123 hashed
                Role = UserRole.Manager,
                Department = "Engineering",
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed Expenses
        modelBuilder.Entity<Expense>().HasData(
            new Expense
            {
                Id = "se1",
                UserId = "demo_emp",
                UserName = "Alex Lee",
                UserDept = "Engineering",
                Title = "AWS re:Invent Conference",
                Category = ExpenseCategory.Travel,
                Amount = 18500,
                Date = now.AddDays(-30),
                Description = "Annual AWS conference in Las Vegas. Covers flight, hotel, and registration.",
                Status = ExpenseStatus.Approved,
                ReceiptName = "aws_receipt.pdf",
                ReceiptData = null,
                SubmittedAt = now.AddDays(-30),
                ReviewedAt = now.AddDays(-28),
                ReviewNote = "Approved – great conference."
            },
            new Expense
            {
                Id = "se2",
                UserId = "demo_emp",
                UserName = "Alex Lee",
                UserDept = "Engineering",
                Title = "Team Lunch",
                Category = ExpenseCategory.FoodAndDining,
                Amount = 2400,
                Date = now.AddDays(-15),
                Description = "Team lunch for sprint retrospective.",
                Status = ExpenseStatus.Approved,
                ReceiptName = null,
                ReceiptData = null,
                SubmittedAt = now.AddDays(-15),
                ReviewedAt = now.AddDays(-14),
                ReviewNote = ""
            },
            new Expense
            {
                Id = "se3",
                UserId = "demo_emp",
                UserName = "Alex Lee",
                UserDept = "Engineering",
                Title = "GitHub Copilot Subscription",
                Category = ExpenseCategory.SoftwareTools,
                Amount = 1200,
                Date = now.AddDays(-5),
                Description = "Monthly GitHub Copilot Business license.",
                Status = ExpenseStatus.Pending,
                ReceiptName = null,
                ReceiptData = null,
                SubmittedAt = now.AddDays(-5),
                ReviewedAt = null,
                ReviewNote = ""
            },
            new Expense
            {
                Id = "se4",
                UserId = "demo_emp",
                UserName = "Alex Lee",
                UserDept = "Engineering",
                Title = "Ergonomic Office Chair",
                Category = ExpenseCategory.OfficeSupplies,
                Amount = 12999,
                Date = now.AddDays(-20),
                Description = "Herman Miller Aeron for home office setup.",
                Status = ExpenseStatus.Rejected,
                ReceiptName = "chair_invoice.jpg",
                ReceiptData = null,
                SubmittedAt = now.AddDays(-20),
                ReviewedAt = now.AddDays(-18),
                ReviewNote = "Exceeds ₹10,000 policy limit without prior CFO approval. Please resubmit with approval form."
            },
            new Expense
            {
                Id = "se5",
                UserId = "demo_emp",
                UserName = "Alex Lee",
                UserDept = "Engineering",
                Title = "Client Dinner – Infosys",
                Category = ExpenseCategory.ClientEntertainment,
                Amount = 5800,
                Date = now.AddDays(-3),
                Description = "Business dinner with Infosys team leads.",
                Status = ExpenseStatus.Pending,
                ReceiptName = "dinner_receipt.png",
                ReceiptData = null,
                SubmittedAt = now.AddDays(-3),
                ReviewedAt = null,
                ReviewNote = ""
            }
        );
    }
}
