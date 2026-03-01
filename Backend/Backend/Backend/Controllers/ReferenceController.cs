using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class ReferenceController : ControllerBase
{
    /// <summary>
    /// Get all expense categories
    /// </summary>
    [HttpGet("categories")]
    public ActionResult<object> GetCategories()
    {
        var categories = new[]
        {
            "Travel",
            "Food & Dining",
            "Accommodation",
            "Office Supplies",
            "Software/Tools",
            "Training",
            "Client Entertainment",
            "Other"
        };

        return Ok(new
        {
            success = true,
            data = categories
        });
    }

    /// <summary>
    /// Get all departments
    /// </summary>
    [HttpGet("departments")]
    public ActionResult<object> GetDepartments()
    {
        var departments = new[]
        {
            "Engineering",
            "Marketing",
            "Sales",
            "Operations",
            "Finance",
            "HR",
            "Product"
        };

        return Ok(new
        {
            success = true,
            data = departments
        });
    }
}
