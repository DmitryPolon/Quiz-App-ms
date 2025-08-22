using System;

namespace QuizApp.Models;

public partial class RetrievesQuizHeaders
{
    public int QuizID { get; set; }
    public string QuizName { get; set; } = null!;
    public string? Description { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public int? TotalQuestions { get; set; }
}