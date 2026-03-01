using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Backend.Attributes.Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public AnalyticsController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    /// <summary>
    /// Get employee overview statistics
    /// </summary>
    [HttpGet("employee/overview")]
    [Backend.Attributes.Authorize("Employee")]
    public ActionResult<object> GetEmployeeOverview()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, error = "Invalid token" });

        var overview = _expenseService.GetEmployeeOverview(userId);
        return Ok(new
        {
            success = true,
            data = overview
        });
    }

    /// <summary>
    /// Get employee monthly summary
    /// </summary>
    [HttpGet("employee/monthly-summary")]
    [Backend.Attributes.Authorize("Employee")]
    public ActionResult<object> GetEmployeeMonthlySummary()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, error = "Invalid token" });

        var monthlySummaries = _expenseService.GetMonthlySummaries(userId);
        var categoryBreakdown = _expenseService.GetCategoryBreakdown(userId);
        var userExpenses = _expenseService.GetUserExpenses(userId);

        var totalAmount = userExpenses.Sum(e => e.Amount);
        var totalApproved = userExpenses.Where(e => e.Status == "Approved").Sum(e => e.Amount);
        var reviewed = userExpenses.Where(e => e.Status != "Pending").ToList();
        var approvalRate = reviewed.Any() 
            ? (int)Math.Round(reviewed.Count(e => e.Status == "Approved") * 100.0 / reviewed.Count)
            : 0;
        var avgExpense = userExpenses.Any() ? totalAmount / userExpenses.Count : 0;

        return Ok(new
        {
            success = true,
            data = new
            {
                monthlySummaries = monthlySummaries.Take(3),
                categoryBreakdown,
                allTimeStats = new
                {
                    totalSubmitted = userExpenses.Count,
                    totalAmount,
                    totalApproved,
                    approvalRate,
                    avgExpense
                }
            }
        });
    }

    /// <summary>
    /// Get manager overview statistics
    /// </summary>
    [HttpGet("manager/overview")]
    [Backend.Attributes.Authorize("Manager")]
    public ActionResult<object> GetManagerOverview()
    {
        var overview = _expenseService.GetManagerOverview();
        return Ok(new
        {
            success = true,
            data = overview
        });
    }

    /// <summary>
    /// Get team monthly reports
    /// </summary>
    [HttpGet("manager/monthly-reports")]
    [Backend.Attributes.Authorize("Manager")]
    public ActionResult<object> GetManagerMonthlyReports()
    {
        var monthlySummaries = _expenseService.GetMonthlySummaries();
        var categoryBreakdown = _expenseService.GetCategoryBreakdown();
        var allExpenses = _expenseService.GetAllExpenses();

        var totalValue = allExpenses.Sum(e => e.Amount);
        var totalApproved = allExpenses.Where(e => e.Status == "Approved").Sum(e => e.Amount);
        var reviewed = allExpenses.Where(e => e.Status != "Pending").ToList();
        var approvalRate = reviewed.Any() 
            ? (int)Math.Round(reviewed.Count(e => e.Status == "Approved") * 100.0 / reviewed.Count)
            : 0;
        var avgExpense = allExpenses.Any() ? totalValue / allExpenses.Count : 0;
        var pendingReview = allExpenses.Count(e => e.Status == "Pending");

        return Ok(new
        {
            success = true,
            data = new
            {
                monthlySummaries = monthlySummaries.Take(3),
                categoryBreakdown,
                teamStats = new
                {
                    totalSubmitted = allExpenses.Count,
                    totalValue,
                    totalApproved,
                    approvalRate,
                    avgExpense,
                    pendingReview
                }
            }
        });
    }
}
