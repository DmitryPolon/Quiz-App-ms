using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public int? UserId { get; set; }

    public int? QuizId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public virtual Quiz? Quiz { get; set; }

    public virtual User? User { get; set; }
}
