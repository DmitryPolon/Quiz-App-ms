using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class vw_QuizOverview
{
    public int QuizID { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string CreatedBy { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public string? Categories { get; set; }

    public int? TimeLimitMinutes { get; set; }
    
}
