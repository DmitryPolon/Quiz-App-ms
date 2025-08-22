using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QuizApp.Models;
using QuizApp.Repositories;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

public class QuizRepository
{
    private readonly MyDbContext _context;
    public QuizRepository(MyDbContext context) => _context = context;

    /// <summary>
    /// Gets the next question (with answers) in a quiz by sequence ID using the stored procedure.
    /// </summary>
    //public async Task<QuestionWithAnswersDto?> GetNextQuestionSequenceByIdAsync(int quizId, int sequenceId)
    //{
    //    QuestionWithAnswersDto? question = null;

    //    using var connection = _context.Database.GetDbConnection();
    //    await connection.OpenAsync();

    //    using var command = connection.CreateCommand();
    //    command.CommandText = "GetNextQuestionSequenceById";
    //    command.CommandType = System.Data.CommandType.StoredProcedure;
    //    command.Parameters.Add(new SqlParameter("@QuizID", quizId));
    //    command.Parameters.Add(new SqlParameter("@SequenceId", sequenceId));

    //    using var reader = await command.ExecuteReaderAsync();

    //    while (await reader.ReadAsync())
    //    {
    //        if (question == null)
    //        {
    //            question = new QuestionWithAnswersDto
    //            {
    //                SequenceId = reader.GetInt32(reader.GetOrdinal("SequenceId")),
    //                QuestionID = reader.GetInt32(reader.GetOrdinal("QuestionID")),
    //                QuestionText = reader["QuestionText"] as string,
    //                DifficultyID = reader["DifficultyID"] as int? ?? 0,
    //                TimeLimitSeconds = reader["TimeLimitSeconds"] as int? ?? 0,
    //                Answers = new List<AnswerDto>()
    //            };
    //        }

    //        if (!reader.IsDBNull(reader.GetOrdinal("AnswerID")))
    //        {
    //            question.Answers.Add(new AnswerDto
    //            {
    //                AnswerID = reader.GetInt32(reader.GetOrdinal("AnswerID")),
    //                AnswerText = reader["AnswerText"] as string,
    //                IsCorrect = reader.GetBoolean(reader.GetOrdinal("IsCorrect"))
    //            });
    //        }
    //    }

    //    return question;
    //}

    public async Task<QuestionWithAnswersDto?> GetNextQuestionSequenceByNumAsync(int quizId, int sequenceNum)
    {
        QuestionWithAnswersDto? question = null;

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();

        using var command = connection.CreateCommand();
        command.CommandText = "GetNextQuestionSequenceByNum";
        command.CommandType = System.Data.CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@QuizID", quizId));
        command.Parameters.Add(new SqlParameter("@SequenceNum", sequenceNum));

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            if (question == null)
            {
                question = new QuestionWithAnswersDto
                {
                    SequenceNum = reader.GetInt32(reader.GetOrdinal("SequenceNum")),
                    SequenceId = reader.GetInt32(reader.GetOrdinal("SequenceId")),
                    QuestionID = reader.GetInt32(reader.GetOrdinal("QuestionID")),
                    QuizID = quizId,
                    QuestionText = reader["QuestionText"] as string,
                    DifficultyID = reader["DifficultyID"] as int? ?? 0,
                    //Difficulty = reader["Difficulty"] as string,
                    TimeLimitSeconds = reader["TimeLimitSeconds"] as int? ?? 0,
                    Answers = new List<AnswerDto>()
                };
            }

            if (!reader.IsDBNull(reader.GetOrdinal("AnswerID")))
            {
                question.Answers.Add(new AnswerDto
                {
                    AnswerID = reader.GetInt32(reader.GetOrdinal("AnswerID")),
                    AnswerText = reader["AnswerText"] as string
                    
                    //IsCorrect = reader.GetBoolean(reader.GetOrdinal("IsCorrect"))
                });
            }
        }

        return question;
    }

    public async Task<QuizHeaderDto?> GetQuizHeaderAsync(int quizId)
    {
        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();

        using var command = connection.CreateCommand();
        command.CommandText = "GetQuizHeader";
        command.CommandType = System.Data.CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@QuizID", quizId));

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new QuizHeaderDto
            {
                QuizID = reader.GetInt32(reader.GetOrdinal("QuizID")),
                QuizName = reader["QuizName"] as string,
                Description = reader["Description"] as string,
                TimeLimitMinutes = reader["TimeLimitMinutes"] as int?,
                TotalQuestions = reader.GetInt32(reader.GetOrdinal("TotalQuestions"))
            };
        }
        return null;
    }

    public async Task StartQuizAsync(int userId, int quizId)
    {
        var userIdParam = new SqlParameter("@UserID", userId);
        var quizIdParam = new SqlParameter("@QuizID", quizId);

        await _context.Database.ExecuteSqlRawAsync(
            "EXEC [dbo].[StartQuiz] @UserID, @QuizID",
            userIdParam, quizIdParam
        );
    }

    public async Task SubmitAnswerAsync(SubmitAnswerDto dto)
    {
        var userIdParam = new SqlParameter("@UserID", dto.UserID);
        var quizIdParam = new SqlParameter("@QuizID", dto.QuizID);
        var questionIdParam = new SqlParameter("@QuestionID", dto.QuestionID);
        var answerIdParam = new SqlParameter("@AnswerID", dto.AnswerID ?? (object)DBNull.Value);
        var responseTimeParam = new SqlParameter("@ResponseTimeSeconds", dto.ResponseTimeSeconds ?? (object)DBNull.Value);
        var answerTimedOutParam = new SqlParameter("@AnswerTimedOut", dto.AnswerTimedOut);
        var resultIdParam = new SqlParameter("@ResultID", dto.ResultID ?? (object)DBNull.Value); // Add this

        await _context.Database.ExecuteSqlRawAsync(
            "EXEC [dbo].[SubmitAnswer] @UserID, @QuizID, @QuestionID, @AnswerID, @ResponseTimeSeconds, @AnswerTimedOut, @ResultID",
            userIdParam, quizIdParam, questionIdParam, answerIdParam, responseTimeParam, answerTimedOutParam, resultIdParam
        );
    }

    public async Task SubmitQuizAsync(int resultId)
    {
        var resultIdParam = new SqlParameter("@ResultID", resultId);

        await _context.Database.ExecuteSqlRawAsync(
            "EXEC [dbo].[SubmitQuiz] @ResultID",
            resultIdParam
        );
    }

    public async Task<(object summary, List<object> details)> GetScoreResultAsync(int resultId, bool weightByDifficulty)
    {
        var conn = _context.Database.GetDbConnection();
        await conn.OpenAsync();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "ScoreResult";
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.Add(new SqlParameter("@ResultID", resultId));
        cmd.Parameters.Add(new SqlParameter("@WeightByDifficulty", weightByDifficulty));

        using var reader = await cmd.ExecuteReaderAsync();

        
        object summary = null;
        if (await reader.ReadAsync())
        {
            summary = new
            {
                TakenAt = reader["TakenAt"],
                Score = reader.IsDBNull(reader.GetOrdinal("Score")) 
    ? (double?)null 
    : reader.GetDouble(reader.GetOrdinal("Score")),
                NumberOfQuestions = reader["NumberOfQuestions"],
                NumberOfCorrectAnswers = reader["NumberOfCorrectAnswers"]
            };
        }

        
        var details = new List<object>();
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                details.Add(new
                {
                    QuestionText = reader["QuestionText"],
                    IsCorrect = reader["IsCorrect"]
                });
            }
        }

        return (summary, details);
    }

    public async Task UpdateQuizStartTimeAsync(int resultId)
    {
        var resultIdParam = new SqlParameter("@ResultID", resultId);
        await _context.Database.ExecuteSqlRawAsync("EXEC StartQuiz @ResultID", resultIdParam);
    }

    public async Task<List<RetrievesQuizHeaders>> GetQuizHeadersAsync(
        string? quizName,
        string? description,
        int page,
        int pageSize)
    {
        var query = _context.RetrievesQuizHeaders.AsQueryable();

        if (!string.IsNullOrEmpty(quizName))
            query = query.Where(q => q.QuizName.Contains(quizName));
        if (!string.IsNullOrEmpty(description))
            query = query.Where(q => q.Description != null && q.Description.Contains(description));

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<List<QuizHeaderByUserDto>> GetQuizHeadersByUserIdAsync(int userId)
    {
        var result = new List<QuizHeaderByUserDto>();

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();

        using var command = connection.CreateCommand();
        command.CommandText = "GetQuizHeaderByUserID";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@UserID", userId));

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            result.Add(new QuizHeaderByUserDto
            {
                ResultID = reader.GetInt32(reader.GetOrdinal("ResultID")), // Add this line
                QuizID = reader.GetInt32(reader.GetOrdinal("QuizID")),
                Title = reader["Title"] as string,
                Description = reader["Description"] as string,
                CreatedBy = reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                AssignedOn = reader["AssignedOn"] as DateTime?,
                TakenAt = reader["TakenAt"] as DateTime?,
                Score = reader.IsDBNull(reader.GetOrdinal("Score")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("Score"))
            });
        }

        return result;
    }

    public async Task<List<UserResponseDto>> GetUserResponsesByResultIdAsync(int resultId)
    {
        var responses = await _context.UserResponses
            .Include(ur => ur.Question)
            .ThenInclude(q => q.Difficulty) // Ensure DifficultyLevel is included
            .Where(ur => ur.ResultId == resultId)
            .Select(ur => new UserResponseDto
            {
                UserResponseID = ur.ResponseId,
                ResultID = resultId,
                QuestionID = ur.QuestionId,
                AnswerID = ur.SelectedAnswerId,
                RespondedAt = ur.ResponseDateTime,
                IsCorrect = ur.IsCorrect,
                QuestionText = ur.Question != null ? ur.Question.QuestionText : null,
                AnswerText = ur.AnswerText,
                TimeTakenSeconds = ur.TimeTakenSeconds,
                AnswerTimedOut = ur.AnswerTimedOut,
                DifficultyID = ur.Question != null ? ur.Question.DifficultyId : null,
                LevelName = ur.Question != null && ur.Question.Difficulty != null ? ur.Question.Difficulty.LevelName : null
            })
            .ToListAsync();

        return responses;
    }

    public async Task<List<object>> GetUserResponsesDetailsAsync()
    {
        var responses = await _context.Set<UserResponse>()
            .Include(ur => ur.Question)
            //  .Include(ur => ur.SelectedAnswer) 
            .Select(ur => new
            {
                QuestionText = ur.Question != null ? ur.Question.QuestionText : null,
                AnswerText = ur.AnswerText, 
                IsCorrect = ur.IsCorrect,   
                TimeTakenSeconds = ur.TimeTakenSeconds,
                //AnswerTimedOut = ur.AnswerTimedOut 
            })
            .ToListAsync();

        return responses.Cast<object>().ToList();
    }
}