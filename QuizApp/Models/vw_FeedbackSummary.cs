using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class vw_FeedbackSummary
{
    public int QuizID { get; set; }

    public string Title { get; set; } = null!;

    public int? TotalFeedbacks { get; set; }

    public int? AverageRating { get; set; }
}
