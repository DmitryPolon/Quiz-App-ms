using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public int? RoleId { get; set; }

    public bool? IsEmailVerified { get; set; }

    public string? EmailVerificationCode { get; set; }

    public DateTime? VerificationSentAt { get; set; }

    public string? PasswordResetToken { get; set; }

    public DateTime? TokenGeneratedAt { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();

    public virtual ICollection<Result> Results { get; set; } = new List<Result>();

    public virtual Role? Role { get; set; }

    public virtual ICollection<UserResponse> UserResponses { get; set; } = new List<UserResponse>();
}
