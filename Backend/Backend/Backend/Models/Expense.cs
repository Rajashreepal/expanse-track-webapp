namespace Backend.Models;

public class Expense
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserDept { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Pending;
    public string? ReceiptName { get; set; }
    public string? ReceiptData { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public string ReviewNote { get; set; } = string.Empty;
}

public enum ExpenseStatus
{
    Pending,
    Approved,
    Rejected
}

public enum ExpenseCategory
{
    Travel,
    FoodAndDining,
    Accommodation,
    OfficeSupplies,
    SoftwareTools,
    Training,
    ClientEntertainment,
    Other
}
