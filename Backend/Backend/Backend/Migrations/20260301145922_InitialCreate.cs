using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UserDept = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ReceiptName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ReceiptData = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Fname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Lname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Expenses",
                columns: new[] { "Id", "Amount", "Category", "Date", "Description", "ReceiptData", "ReceiptName", "ReviewNote", "ReviewedAt", "Status", "SubmittedAt", "Title", "UserDept", "UserId", "UserName" },
                values: new object[,]
                {
                    { "se1", 18500m, 0, new DateTime(2026, 1, 30, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "Annual AWS conference in Las Vegas. Covers flight, hotel, and registration.", null, "aws_receipt.pdf", "Approved – great conference.", new DateTime(2026, 2, 1, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), 1, new DateTime(2026, 1, 30, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "AWS re:Invent Conference", "Engineering", "demo_emp", "Alex Lee" },
                    { "se2", 2400m, 1, new DateTime(2026, 2, 14, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "Team lunch for sprint retrospective.", null, null, "", new DateTime(2026, 2, 15, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), 1, new DateTime(2026, 2, 14, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "Team Lunch", "Engineering", "demo_emp", "Alex Lee" },
                    { "se3", 1200m, 4, new DateTime(2026, 2, 24, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "Monthly GitHub Copilot Business license.", null, null, "", null, 0, new DateTime(2026, 2, 24, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "GitHub Copilot Subscription", "Engineering", "demo_emp", "Alex Lee" },
                    { "se4", 12999m, 3, new DateTime(2026, 2, 9, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "Herman Miller Aeron for home office setup.", null, "chair_invoice.jpg", "Exceeds ₹10,000 policy limit without prior CFO approval. Please resubmit with approval form.", new DateTime(2026, 2, 11, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), 2, new DateTime(2026, 2, 9, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "Ergonomic Office Chair", "Engineering", "demo_emp", "Alex Lee" },
                    { "se5", 5800m, 6, new DateTime(2026, 2, 26, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "Business dinner with Infosys team leads.", null, "dinner_receipt.png", "", null, 0, new DateTime(2026, 2, 26, 14, 59, 19, 531, DateTimeKind.Utc).AddTicks(3518), "Client Dinner – Infosys", "Engineering", "demo_emp", "Alex Lee" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Department", "Email", "Fname", "Lname", "Password", "Role" },
                values: new object[,]
                {
                    { "demo_emp", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Engineering", "employee@demo.com", "Alex", "Lee", "jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=", 0 },
                    { "demo_mgr", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Engineering", "manager@demo.com", "Morgan", "Grant", "jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=", 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_Date",
                table: "Expenses",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_Status",
                table: "Expenses",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_UserId",
                table: "Expenses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Expenses");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
