using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class VwQuizOverview
{
    public int QuizId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string CreatedBy { get; set; } = null!;

    public int? TimeLimitMinutes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? Categories { get; set; }
}
