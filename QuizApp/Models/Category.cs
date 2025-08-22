using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class Category
{
    [Key]
    public int CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
