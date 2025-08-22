using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class UserResponse
{
    [Key]
    public int ResponseId { get; set; }

    public int UserId { get; set; }

    public int QuizId { get; set; }

    public int QuestionId { get; set; }

    public string QuestionText { get; set; } = null!;

    public int? SelectedAnswerId { get; set; }

    public string? AnswerText { get; set; }

    public bool? IsCorrect { get; set; }

    public int? TimeTakenSeconds { get; set; }

    public DateTime ResponseDateTime { get; set; }

    public bool AnswerTimedOut { get; set; }

    public int? ResultId { get; set; }

    public virtual Question Question { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
