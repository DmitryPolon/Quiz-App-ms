using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class VwUserResult
{
    public int ResultId { get; set; }

    public string Username { get; set; } = null!;

    public string QuizTitle { get; set; } = null!;

    public int Score { get; set; }

    public int? TimeTakenSeconds { get; set; }

    public DateTime? TakenAt { get; set; }
}
