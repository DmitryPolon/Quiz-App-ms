using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using QuizApp.Models;
using Microsoft.EntityFrameworkCore;


public class ApiLoggingFilter : IAsyncActionFilter
{
    private readonly MyDbContext _dbContext;

    public ApiLoggingFilter(string connectionString)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MyDbContext>();
        optionsBuilder.UseSqlServer(connectionString);
        _dbContext = new MyDbContext(optionsBuilder.Options);
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var requestUserId = context.ActionArguments.ContainsKey("userId") ? context.ActionArguments["userId"]?.ToString() : null;
        var userId = requestUserId ?? context.HttpContext.User?.Identity?.Name ?? "Anonymous";
        var path = context.HttpContext.Request.Path;
        var method = context.HttpContext.Request.Method;
        var inputParams = System.Text.Json.JsonSerializer.Serialize(context.ActionArguments);

        var resultContext = await next();

        string output = null;
        var result = resultContext.Result;
        if (result is ObjectResult objectResult)
            output = System.Text.Json.JsonSerializer.Serialize(objectResult.Value);
        else if (result is JsonResult jsonResult)
            output = System.Text.Json.JsonSerializer.Serialize(jsonResult.Value);
        else if (result is ContentResult contentResult)
            output = contentResult.Content;
        else if (result is StatusCodeResult statusCodeResult)
            output = $"StatusCode: {statusCodeResult.StatusCode}";
        else if (result is NoContentResult)
            output = "NoContentResult";
        else if (result is EmptyResult)
            output = "EmptyResult";
        else if (result != null)
            output = $"Unhandled result type: {result.GetType().Name}";
        Console.WriteLine($"Result type: {result?.GetType().FullName}");

       try
        {
            if (_dbContext != null)
            {
                _dbContext.ApiLogs.Add(new ApiLog
                {
                    UserId = userId,
                    Path = path,
                    HttpMethod = method,
                    InputParameters = inputParams,
                    Output = output,
                    Timestamp = DateTime.UtcNow,
                    IsBefore = false
                });
                Console.WriteLine("Attempting to save log entry...");
                await _dbContext.SaveChangesAsync();
                Console.WriteLine("Log entry saved.");
            }
            else
            {
                Console.WriteLine("DbContext is null. Cannot log API call.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"API log failed: {ex}");
            throw; 
        }
    }
}