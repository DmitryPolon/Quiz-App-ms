using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class VwFeedbackSummary
{
    public int QuizId { get; set; }

    public string Title { get; set; } = null!;

    public int? TotalFeedbacks { get; set; }

    public int? AverageRating { get; set; }
}
