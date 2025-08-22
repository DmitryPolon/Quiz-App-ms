using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class Question
{
    [Key]
    public int QuestionId { get; set; }

    public int? QuizId { get; set; }

    public string QuestionText { get; set; } = null!;

    public int? DifficultyId { get; set; }

    public int? TimeLimitSeconds { get; set; }

    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

    public virtual ICollection<ConditionalLogic> ConditionalLogicBaseQuestions { get; set; } = new List<ConditionalLogic>();

    public virtual ICollection<ConditionalLogic> ConditionalLogicFollowUpQuestions { get; set; } = new List<ConditionalLogic>();

    public virtual DifficultyLevel? Difficulty { get; set; }

    public virtual Quiz? Quiz { get; set; }

    public virtual ICollection<UserResponse> UserResponses { get; set; } = new List<UserResponse>();
}
