using Backend.Models.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Backend.Attributes.Authorize("Manager")]
public class ApprovalsController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ApprovalsController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    /// <summary>
    /// Get pending expenses for manager approval
    /// </summary>
    [HttpGet("pending")]
    public ActionResult<object> GetPendingApprovals()
    {
        var expenses = _expenseService.GetPendingExpenses();
        return Ok(new
        {
            success = true,
            data = expenses
        });
    }

    /// <summary>
    /// Get all expenses (manager view)
    /// </summary>
    [HttpGet("all")]
    public ActionResult<object> GetAllExpenses(
        [FromQuery] string? status = null,
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        var expenses = _expenseService.GetAllExpenses(status, category, search);
        return Ok(new
        {
            success = true,
            data = expenses
        });
    }

    /// <summary>
    /// Review an expense (approve/reject)
    /// </summary>
    [HttpPatch("{id}/review")]
    public ActionResult<object> ReviewExpense(string id, [FromBody] ReviewExpenseRequest request)
    {
        try
        {
            _expenseService.ReviewExpense(id, request);
            return Ok(new
            {
                success = true,
                message = $"Expense {request.Status.ToLower()} successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }
}
