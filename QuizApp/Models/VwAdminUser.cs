using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class VwAdminUser
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string RoleName { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }
}
