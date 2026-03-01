using Backend.Models;
using Backend.Models.DTOs;
using Backend.Data;
using System.Globalization;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ExpenseService : IExpenseService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthService _authService;

    private static readonly Dictionary<string, string> CategoryColors = new()
    {
        { "Travel", "#38bdf8" },
        { "Food & Dining", "#6ee7b7" },
        { "Accommodation", "#f59e0b" },
        { "Office Supplies", "#f87171" },
        { "Software/Tools", "#a78bfa" },
        { "Training", "#fb923c" },
        { "Client Entertainment", "#34d399" },
        { "Other", "#94a3b8" }
    };

    public ExpenseService(ApplicationDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    public ExpenseDto SubmitExpense(string userId, SubmitExpenseRequest request)
    {
        var user = _authService.GetCurrentUser(userId);
        if (user == null) throw new Exception("User not found");

        var expense = new Expense
        {
            Id = "e_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            UserId = userId,
            UserName = $"{user.Fname} {user.Lname}",
            UserDept = user.Department,
            Title = request.Title,
            Category = ParseCategory(request.Category),
            Amount = request.Amount,
            Date = DateTime.Parse(request.Date),
            Description = request.Description,
            Status = ExpenseStatus.Pending,
            ReceiptName = request.ReceiptName,
            ReceiptData = request.ReceiptData,
            SubmittedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        _context.SaveChanges();

        return MapToDto(expense);
    }

    public List<ExpenseDto> GetUserExpenses(string userId, string? status = null, string? category = null, string? search = null)
    {
        var query = _context.Expenses.Where(e => e.UserId == userId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(e => e.Status.ToString() == status);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(e => FormatCategory(e.Category) == category);

        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(e => 
                e.Title.ToLower().Contains(search) || 
                FormatCategory(e.Category).ToLower().Contains(search));
        }

        return query.OrderByDescending(e => e.SubmittedAt).Select(e => MapToDto(e)).ToList();
    }

    public ExpenseDto? GetExpenseById(string id)
    {
        var expense = _context.Expenses.FirstOrDefault(e => e.Id == id);
        return expense != null ? MapToDto(expense) : null;
    }

    public List<ExpenseDto> GetAllExpenses(string? status = null, string? category = null, string? search = null)
    {
        var query = _context.Expenses.AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(e => e.Status.ToString() == status);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(e => FormatCategory(e.Category) == category);

        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(e => 
                e.UserName.ToLower().Contains(search) ||
                e.Title.ToLower().Contains(search) || 
                FormatCategory(e.Category).ToLower().Contains(search));
        }

        return query.OrderByDescending(e => e.SubmittedAt).Select(e => MapToDto(e)).ToList();
    }

    public List<ExpenseDto> GetPendingExpenses()
    {
        return _context.Expenses
            .Where(e => e.Status == ExpenseStatus.Pending)
            .OrderByDescending(e => e.SubmittedAt)
            .Select(e => MapToDto(e))
            .ToList();
    }

    public void ReviewExpense(string id, ReviewExpenseRequest request)
    {
        var expense = _context.Expenses.FirstOrDefault(e => e.Id == id);
        if (expense == null) throw new Exception("Expense not found");

        expense.Status = request.Status == "Approved" ? ExpenseStatus.Approved : ExpenseStatus.Rejected;
        expense.ReviewNote = request.ReviewNote;
        expense.ReviewedAt = DateTime.UtcNow;

        _context.SaveChanges();
    }

    public EmployeeOverviewResponse GetEmployeeOverview(string userId)
    {
        var userExpenses = _context.Expenses.Where(e => e.UserId == userId).ToList();
        var now = DateTime.UtcNow;
        var thisMonth = userExpenses.Where(e => e.Date.Month == now.Month && e.Date.Year == now.Year).ToList();

        return new EmployeeOverviewResponse
        {
            ThisMonthCount = thisMonth.Count,
            PendingCount = userExpenses.Count(e => e.Status == ExpenseStatus.Pending),
            ApprovedCount = userExpenses.Count(e => e.Status == ExpenseStatus.Approved),
            RejectedCount = userExpenses.Count(e => e.Status == ExpenseStatus.Rejected),
            TotalApprovedAmount = userExpenses.Where(e => e.Status == ExpenseStatus.Approved).Sum(e => e.Amount),
            RecentExpenses = userExpenses.OrderByDescending(e => e.SubmittedAt).Take(5).Select(MapToDto).ToList(),
            CategoryBreakdown = CalculateCategoryBreakdown(userExpenses)
        };
    }

    public ManagerOverviewResponse GetManagerOverview()
    {
        var allExpenses = _context.Expenses.ToList();
        var now = DateTime.UtcNow;
        var thisMonth = allExpenses.Where(e => e.Date.Month == now.Month && e.Date.Year == now.Year).ToList();
        var reviewed = allExpenses.Where(e => e.Status != ExpenseStatus.Pending).ToList();
        var rejectionRate = reviewed.Any() 
            ? (int)Math.Round(reviewed.Count(e => e.Status == ExpenseStatus.Rejected) * 100.0 / reviewed.Count)
            : 0;

        return new ManagerOverviewResponse
        {
            Total = allExpenses.Count,
            PendingCount = allExpenses.Count(e => e.Status == ExpenseStatus.Pending),
            ApprovedThisMonth = thisMonth.Where(e => e.Status == ExpenseStatus.Approved).Sum(e => e.Amount),
            RejectionRate = rejectionRate,
            PendingExpenses = allExpenses.Where(e => e.Status == ExpenseStatus.Pending)
                .OrderByDescending(e => e.SubmittedAt)
                .Take(5)
                .Select(MapToDto)
                .ToList(),
            Categories = CalculateCategoryBreakdown(allExpenses)
        };
    }

    public List<MonthlySummary> GetMonthlySummaries(string? userId = null)
    {
        var expenses = userId != null 
            ? _context.Expenses.Where(e => e.UserId == userId).ToList()
            : _context.Expenses.ToList();

        var grouped = expenses
            .GroupBy(e => new { e.Date.Year, e.Date.Month })
            .Select(g => new MonthlySummary
            {
                Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy", CultureInfo.InvariantCulture),
                Year = g.Key.Year,
                MonthIndex = g.Key.Month - 1,
                Total = g.Sum(e => e.Amount),
                Approved = g.Where(e => e.Status == ExpenseStatus.Approved).Sum(e => e.Amount),
                Pending = g.Where(e => e.Status == ExpenseStatus.Pending).Sum(e => e.Amount),
                Rejected = g.Where(e => e.Status == ExpenseStatus.Rejected).Sum(e => e.Amount),
                Count = g.Count()
            })
            .OrderByDescending(m => m.Year)
            .ThenByDescending(m => m.MonthIndex)
            .ToList();

        return grouped;
    }

    public List<CategoryBreakdown> GetCategoryBreakdown(string? userId = null)
    {
        var expenses = userId != null 
            ? _context.Expenses.Where(e => e.UserId == userId).ToList()
            : _context.Expenses.ToList();

        return CalculateCategoryBreakdown(expenses);
    }

    private List<CategoryBreakdown> CalculateCategoryBreakdown(List<Expense> expenses)
    {
        if (!expenses.Any()) return new List<CategoryBreakdown>();

        var total = expenses.Sum(e => e.Amount);
        var grouped = expenses
            .GroupBy(e => e.Category)
            .Select(g =>
            {
                var categoryName = FormatCategory(g.Key);
                return new CategoryBreakdown
                {
                    Category = categoryName,
                    Amount = g.Sum(e => e.Amount),
                    Count = g.Count(),
                    Percent = total > 0 ? (int)Math.Round(g.Sum(e => e.Amount) / total * 100) : 0,
                    Color = CategoryColors.GetValueOrDefault(categoryName, "#94a3b8")
                };
            })
            .OrderByDescending(c => c.Amount)
            .ToList();

        return grouped;
    }

    private ExpenseDto MapToDto(Expense expense)
    {
        return new ExpenseDto
        {
            Id = expense.Id,
            UserId = expense.UserId,
            UserName = expense.UserName,
            UserDept = expense.UserDept,
            Title = expense.Title,
            Category = FormatCategory(expense.Category),
            Amount = expense.Amount,
            Date = expense.Date.ToString("yyyy-MM-dd"),
            Description = expense.Description,
            Status = expense.Status.ToString(),
            ReceiptName = expense.ReceiptName,
            ReceiptData = expense.ReceiptData,
            SubmittedAt = expense.SubmittedAt.ToString("o"),
            ReviewedAt = expense.ReviewedAt?.ToString("o"),
            ReviewNote = expense.ReviewNote
        };
    }

    private ExpenseCategory ParseCategory(string category)
    {
        return category switch
        {
            "Travel" => ExpenseCategory.Travel,
            "Food & Dining" => ExpenseCategory.FoodAndDining,
            "Accommodation" => ExpenseCategory.Accommodation,
            "Office Supplies" => ExpenseCategory.OfficeSupplies,
            "Software/Tools" => ExpenseCategory.SoftwareTools,
            "Training" => ExpenseCategory.Training,
            "Client Entertainment" => ExpenseCategory.ClientEntertainment,
            _ => ExpenseCategory.Other
        };
    }

    private string FormatCategory(ExpenseCategory category)
    {
        return category switch
        {
            ExpenseCategory.FoodAndDining => "Food & Dining",
            ExpenseCategory.OfficeSupplies => "Office Supplies",
            ExpenseCategory.SoftwareTools => "Software/Tools",
            ExpenseCategory.ClientEntertainment => "Client Entertainment",
            _ => category.ToString()
        };
    }
}
