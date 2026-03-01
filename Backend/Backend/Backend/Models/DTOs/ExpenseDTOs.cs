namespace Backend.Models.DTOs;

public class SubmitExpenseRequest
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ReceiptName { get; set; }
    public string? ReceiptData { get; set; }
}

public class ExpenseDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserDept { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ReceiptName { get; set; }
    public string? ReceiptData { get; set; }
    public string SubmittedAt { get; set; } = string.Empty;
    public string? ReviewedAt { get; set; }
    public string ReviewNote { get; set; } = string.Empty;
}

public class ReviewExpenseRequest
{
    public string Status { get; set; } = string.Empty;
    public string ReviewNote { get; set; } = string.Empty;
}

public class MonthlySummary
{
    public string Month { get; set; } = string.Empty;
    public int Year { get; set; }
    public int MonthIndex { get; set; }
    public decimal Total { get; set; }
    public decimal Approved { get; set; }
    public decimal Pending { get; set; }
    public decimal Rejected { get; set; }
    public int Count { get; set; }
}

public class CategoryBreakdown
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int Count { get; set; }
    public int Percent { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class EmployeeOverviewResponse
{
    public int ThisMonthCount { get; set; }
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
    public decimal TotalApprovedAmount { get; set; }
    public List<ExpenseDto> RecentExpenses { get; set; } = new();
    public List<CategoryBreakdown> CategoryBreakdown { get; set; } = new();
}

public class ManagerOverviewResponse
{
    public int Total { get; set; }
    public int PendingCount { get; set; }
    public decimal ApprovedThisMonth { get; set; }
    public int RejectionRate { get; set; }
    public List<ExpenseDto> PendingExpenses { get; set; } = new();
    public List<CategoryBreakdown> Categories { get; set; } = new();
}
