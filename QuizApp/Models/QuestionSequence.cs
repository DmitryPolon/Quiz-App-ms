using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace QuizApp.Models;

public partial class QuestionSequence
{
    [Key]
    public int SequenceId { get; set; }

    public int SequenceNum { get; set; }

    public int QuizId { get; set; }

    public int QuestionId { get; set; }
}
