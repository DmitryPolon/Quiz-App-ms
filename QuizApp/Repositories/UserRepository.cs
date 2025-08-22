using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QuizApp.Models;
using QuizApp.UserAppRepositories;
using System.Threading.Tasks;

public class UserRepository
{
    private readonly MyDbContext _context;
    public UserRepository(MyDbContext context) => _context = context;

    public async Task<LoginUserResult?> LoginUserAsync(string username, string password)
    {
        var usernameParam = new SqlParameter("@Username", username ?? (object)DBNull.Value);
        var passwordParam = new SqlParameter("@Password", password ?? (object)DBNull.Value);

        var result = await _context.Set<LoginUserResult>()
            .FromSqlRaw("EXEC LoginUser @Username, @Password", usernameParam, passwordParam)
            .ToListAsync();

        var user = result.FirstOrDefault();

        // If RoleName is "login failed", treat as no user found
        if (user != null && user.RoleName == "login failed")
            return null;

        return user;
    }

    public async Task CreateUserAsync(CreateUserDto dto)
    {
        var usernameParam = new SqlParameter("@Username", dto.Username);
        var emailParam = new SqlParameter("@Email", dto.Email);
        var passwordHashParam = new SqlParameter("@PasswordHash", dto.Password);
        var roleNameParam = new SqlParameter("@RoleName", dto.IsAdmin ? "Admin" : "User");

        await _context.Database.ExecuteSqlRawAsync(
            "EXEC CreateUserWithRole @Username, @Email, @PasswordHash, @RoleName",
            usernameParam, emailParam, passwordHashParam, roleNameParam
        );
    }

    public async Task<int> VerifyEmailAsync(int userId, string code)
    {
        var userIdParam = new SqlParameter("@UserID", userId);
        var codeParam = new SqlParameter("@Code", code);

        return await _context.Database.ExecuteSqlRawAsync(
            "EXEC VerifyEmail @UserID, @Code",
            userIdParam, codeParam
        );
    }

    public async Task<List<UserDto>> GetAllUsersAsync(UserFilterDto filter)
    {
        var query = _context.Users
            .Join(_context.Roles,
                  user => user.RoleId,
                  role => role.RoleId,
                  (user, role) => new { user.UserId, user.Username, user.Email, RoleName = role.RoleName });

        if (filter.UserID.HasValue)
            query = query.Where(x => x.UserId == filter.UserID.Value);
        if (!string.IsNullOrEmpty(filter.Username))
            query = query.Where(x => x.Username.Contains(filter.Username));
        if (!string.IsNullOrEmpty(filter.Email))
            query = query.Where(x => x.Email != null && x.Email.Contains(filter.Email));

        var result = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(x => new UserDto
            {
                UserID = x.UserId,
                Username = x.Username,
                Email = x.Email,
                RoleName = x.RoleName
            })
            .ToListAsync();

        return result;
    }

    public async Task PromoteUserToAdminAsync(int userId)
    {
        var userIdParam = new SqlParameter("@UserID", userId);
        await _context.Database.ExecuteSqlRawAsync("EXEC PromoteUserToAdmin @UserID", userIdParam);
    }

    public async Task AssignQuizToUserAsync(int userId, int quizId)
    {
        var userIdParam = new SqlParameter("@UserID", userId);
        var quizIdParam = new SqlParameter("@QuizID", quizId);
        await _context.Database.ExecuteSqlRawAsync("EXEC AssignQuizToUser @UserID, @QuizID", userIdParam, quizIdParam);
    }
}

