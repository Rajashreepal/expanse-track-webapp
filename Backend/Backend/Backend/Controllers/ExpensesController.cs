using Backend.Models.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Backend.Attributes.Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    /// <summary>
    /// Submit a new expense
    /// </summary>
    [HttpPost]
    public ActionResult<object> SubmitExpense([FromBody] SubmitExpenseRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, error = "Invalid token" });

            var expense = _expenseService.SubmitExpense(userId, request);
            return Ok(new
            {
                success = true,
                message = "Expense submitted successfully",
                data = expense
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// Get user's expenses
    /// </summary>
    [HttpGet("my-expenses")]
    public ActionResult<object> GetMyExpenses(
        [FromQuery] string? status = null,
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, error = "Invalid token" });

        var expenses = _expenseService.GetUserExpenses(userId, status, category, search);
        return Ok(new
        {
            success = true,
            data = expenses
        });
    }

    /// <summary>
    /// Get single expense by ID
    /// </summary>
    [HttpGet("{id}")]
    public ActionResult<object> GetExpenseById(string id)
    {
        var expense = _expenseService.GetExpenseById(id);
        
        if (expense == null)
            return NotFound(new { success = false, error = "Expense not found" });

        return Ok(new
        {
            success = true,
            data = expense
        });
    }
}
