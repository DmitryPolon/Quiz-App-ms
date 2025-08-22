using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class VwConditionalPath
{
    public int? BaseQuestionId { get; set; }

    public string BaseQuestion { get; set; } = null!;

    public int? TriggerAnswerId { get; set; }

    public string TriggerAnswer { get; set; } = null!;

    public int? FollowUpQuestionId { get; set; }

    public string FollowUpQuestion { get; set; } = null!;
}
