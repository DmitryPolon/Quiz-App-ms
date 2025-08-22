namespace QuizApp.Repositories
{
    public class CreateQuizDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public int? TimeLimitMinutes { get; set; }
    }

    public class UpdateQuizDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int? TimeLimitMinutes { get; set; }
        // Optionally, you may want to allow updating CreatedBy, but usually this is not changed.
    }

    public class CreateQuestionDto
    {
        public string QuestionText { get; set; }
        public int QuizId { get; set; }
        public int? DifficultyID { get; set; }
        public int? TimeLimitSeconds { get; set; }
    }

    public class CreateAnswerDto
    {
        public string AnswerText { get; set; }
        public bool IsCorrect { get; set; }

    }

    public class UpdateAnswerDto
    {
        public string AnswerText { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; }
    }

    public class CreateConditionalLogicDto
    {
        public int BaseQuestionID { get; set; }
        public int TriggerAnswerID { get; set; }
        public int FollowUpQuestionID { get; set; }
    }

    public class DeleteConditionalPathDto
    {
        public int BaseQuestionID { get; set; }
        public int TriggerAnswerID { get; set; }
        public int FollowUpQuestionID { get; set; }
    }

    public class UpdateConditionalPathDto
    {
        public int BaseQuestionID { get; set; }
        public int OldTriggerAnswerID { get; set; }
        public int OldFollowUpQuestionID { get; set; }
        public int NewTriggerAnswerID { get; set; }
        public int NewFollowUpQuestionID { get; set; }
    }

    public class QuizDto
    {
        public int QuizID { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public List<QuestionDto> Questions { get; set; }
    }

    public class QuestionDto
    {
        public int QuestionID { get; set; }
        public string QuestionText { get; set; }
        // Do NOT include a Quiz property here!
    }

    public class QuestionSequenceCreateDto
    {
        public int SequenceNum { get; set; }
        public int QuizID { get; set; }
        public int QuestionID { get; set; }
    }

    public class QuestionWithAnswersDto
    {
        public int? QuestionID { get; set; }
        public int? SequenceId { get; set; }
        public int? SequenceNum { get; set; }
        public int QuizID { get; set; }
        public string QuestionText { get; set; }
        public int DifficultyID { get; set; }
        public string Difficulty { get; set; } = null;
        public int TimeLimitSeconds { get; set; }
        public List<AnswerDto> Answers { get; set; }
    }

    public class AnswerDto
    {
        public int? AnswerID { get; set; } // Nullable AnswerID
        public string AnswerText { get; set; }
        public bool IsCorrect { get; set; }
    }
    public class QuizDetailsDto
    {
        public int QuizID { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int? TimeLimitMinutes { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? Categories { get; set; }
        public List<QuestionWithAnswersDto> Questions { get; set; } = new();
    }

    public class QuizHeaderDto
    {
        public int QuizID { get; set; }
        public string QuizName { get; set; }
        public string Description { get; set; }
        public int? TimeLimitMinutes { get; set; }
        public int TotalQuestions { get; set; }
    }

    public class SubmitAnswerDto
    {
        public int UserID { get; set; }
        public int QuizID { get; set; }
        public int QuestionID { get; set; }
        public int? AnswerID { get; set; }
        public int? ResponseTimeSeconds { get; set; }
        public bool AnswerTimedOut { get; set; }
        public int? ResultID { get; set; }
    }


    public class SubmitQuizDto
    {
        public int UserID { get; set; }
        public int QuizID { get; set; }
    }

    public class ScoreSummaryDto
    {
        public DateTime? TakenAt { get; set; }
        public int Score { get; set; }
        public int NumberOfQuestions { get; set; }
        public int NumberOfCorrectAnswers { get; set; }
    }

    public class ScoreDetailDto
    {
        public string QuestionText { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class AssignQuizDto
    {
        public int UserID { get; set; }
        public int QuizID { get; set; }
    }

    public class QuizHeaderByUserDto
    {
        public int ResultID { get; set; } 
        public int QuizID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? AssignedOn { get; set; }
        public DateTime? TakenAt { get; set; }
        public int? Score { get; set; }
    }

    public class UserResponseDto
    {
        public int UserResponseID { get; set; }
        public int ResultID { get; set; }
        public int QuestionID { get; set; }
        public int? AnswerID { get; set; }
        public DateTime? RespondedAt { get; set; }
        public bool? IsCorrect { get; set; }
        public string QuestionText { get; set; }
        public string AnswerText { get; set; }
        public int? TimeTakenSeconds { get; set; }
        public bool AnswerTimedOut { get; set; }
        public int? DifficultyID { get; set; }      
        public string LevelName { get; set; }
    }


    //public class QuestionWithAnswersDto
    //{
    //    public int SequenceId { get; set; }
    //    public int QuestionID { get; set; }
    //    public string QuestionText { get; set; }
    //    public int DifficultyID { get; set; }
    //    public int TimeLimitSeconds { get; set; }
    //    public List<AnswerDto> Answers { get; set; } = new();
    //}

    //public class AnswerDto
    //{
    //    public int AnswerID { get; set; }
    //    public string AnswerText { get; set; }
    //    public bool IsCorrect { get; set; }
    //}
}
