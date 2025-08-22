using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class Result
{
    public int ResultId { get; set; }

    public int? UserId { get; set; }

    public int? QuizId { get; set; }

    public int? Score { get; set; }

    public DateTime? TakenAt { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public DateTime? AssignedOn { get; set; }

    public virtual Quiz? Quiz { get; set; }

    public virtual User? User { get; set; }
}
