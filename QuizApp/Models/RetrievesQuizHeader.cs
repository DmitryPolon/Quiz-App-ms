using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class RetrievesQuizHeader
{
    public int QuizId { get; set; }

    public string QuizName { get; set; } = null!;

    public string? Description { get; set; }

    public int? TimeLimitMinutes { get; set; }

    public int? TotalQuestions { get; set; }
}
