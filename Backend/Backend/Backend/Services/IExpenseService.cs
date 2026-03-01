using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Services;

public interface IExpenseService
{
    ExpenseDto SubmitExpense(string userId, SubmitExpenseRequest request);
    List<ExpenseDto> GetUserExpenses(string userId, string? status = null, string? category = null, string? search = null);
    ExpenseDto? GetExpenseById(string id);
    List<ExpenseDto> GetAllExpenses(string? status = null, string? category = null, string? search = null);
    List<ExpenseDto> GetPendingExpenses();
    void ReviewExpense(string id, ReviewExpenseRequest request);
    EmployeeOverviewResponse GetEmployeeOverview(string userId);
    ManagerOverviewResponse GetManagerOverview();
    List<MonthlySummary> GetMonthlySummaries(string? userId = null);
    List<CategoryBreakdown> GetCategoryBreakdown(string? userId = null);
}
