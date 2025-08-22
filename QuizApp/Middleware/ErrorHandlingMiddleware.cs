using QuizApp.Models;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred.");
            await LogErrorToDatabaseAsync(ex, context);
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\":\"An unexpected error occurred.\"}");
        }
    }

    private static async Task LogErrorToDatabaseAsync(Exception ex, HttpContext context)
    {
       
        using (var scope = context.RequestServices.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MyDbContext>();
            db.ErrorLogs.Add(new ErrorLog
            {
                Message = ex.Message,
                StackTrace = ex.StackTrace,
                Path = context.Request.Path,
                Timestamp = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }
    }
}