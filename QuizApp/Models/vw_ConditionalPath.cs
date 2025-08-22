using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class vw_ConditionalPath
{
    public int? BaseQuestionID { get; set; }

    public string BaseQuestion { get; set; } = null!;

    public int? TriggerAnswerID { get; set; }

    public string TriggerAnswer { get; set; } = null!;

    public int? FollowUpQuestionID { get; set; }

    public string FollowUpQuestion { get; set; } = null!;
}
