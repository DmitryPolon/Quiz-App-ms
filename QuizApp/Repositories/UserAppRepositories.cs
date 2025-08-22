using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QuizApp.Models;
using System.ComponentModel.DataAnnotations;

namespace QuizApp.UserAppRepositories
{
    public class CreateUserDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public bool IsAdmin { get; set; }
    }

    public class VerifyEmailDto
    {
        public int UserID { get; set; }
        public string Code { get; set; }
    }

    public class LoginUserDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    [Keyless]
    public class LoginUserResult
    {

        public int? UserID { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public int? RoleID { get; set; }
        public string? RoleName { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
    public class UserFilterDto
    {
        public int? UserID { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public int? RoleID { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    // Result DTO
    public class UserListItemDto
    {
        public int UserID { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; }
        public int RoleID { get; set; }
        public string RoleDescription { get; set; }

    }

    public class UserDto
    {
        public int UserID { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string RoleName { get; set; } = null!;

    }
    //public class LoginUserResult
    //{
    //    public int? UserID { get; set; }
    //    public string? Username { get; set; }
    //    public string? Email { get; set; }
    //    public int? RoleID { get; set; }
    //    public string? RoleName { get; set; }
    //    public DateTime? CreatedAt { get; set; }
    //}
}
