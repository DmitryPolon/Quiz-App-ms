using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class ConditionalLogic
{
    [Key]
    public int LogicId { get; set; }

    public int? BaseQuestionId { get; set; }

    public int? TriggerAnswerId { get; set; }

    public int? FollowUpQuestionId { get; set; }

    public virtual Question? BaseQuestion { get; set; }

    public virtual Question? FollowUpQuestion { get; set; }

    public virtual Answer? TriggerAnswer { get; set; }
}
