using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class VwQuestionDetail
{
    public int QuestionId { get; set; }

    public string QuestionText { get; set; } = null!;

    public int? QuizId { get; set; }

    public int? TimeLimitSeconds { get; set; }

    public string? Difficulty { get; set; }

    public string CorrectAnswer { get; set; } = null!;
}
