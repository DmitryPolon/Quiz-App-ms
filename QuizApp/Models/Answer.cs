using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class Answer
{
    [Key]
    public int AnswerId { get; set; }

    public int? QuestionId { get; set; }

    public string AnswerText { get; set; } = null!;

    public bool IsCorrect { get; set; }

    public virtual ICollection<ConditionalLogic> ConditionalLogics { get; set; } = new List<ConditionalLogic>();

    public virtual Question? Question { get; set; }
}
