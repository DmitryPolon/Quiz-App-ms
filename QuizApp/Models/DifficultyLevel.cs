using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace QuizApp.Models;

public partial class DifficultyLevel
{
    [Key]
    public int DifficultyId { get; set; }

    public string LevelName { get; set; } = null!;

    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
}
