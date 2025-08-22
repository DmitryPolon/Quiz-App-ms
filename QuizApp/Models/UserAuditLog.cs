using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class UserAuditLog
{
    public int LogId { get; set; }

    public int? UserId { get; set; }

    public string? Action { get; set; }

    public int? PerformedBy { get; set; }

    public DateTime? Timestamp { get; set; }

    public string? Details { get; set; }
}
