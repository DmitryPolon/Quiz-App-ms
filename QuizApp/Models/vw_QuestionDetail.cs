using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class vw_QuestionDetail
{
    public int QuestionID { get; set; }

    public string QuestionText { get; set; } = null!;

    public int? QuizID { get; set; }

    public string? Difficulty { get; set; }

    public string CorrectAnswer { get; set; } = null!;
}
