using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QuizApp.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Threading.Tasks;
using QuizApp.Repositories;

public class QuizAdminRepository
{
    private readonly MyDbContext _context;
    public QuizAdminRepository(MyDbContext context) => _context = context;

    // --- QUIZ METHODS ---

    public async Task<int> CreateQuizAsync(CreateQuizDto dto)
    {
        var quizIdParam = new SqlParameter
        {
            ParameterName = "@QuizID",
            SqlDbType = System.Data.SqlDbType.Int,
            Direction = System.Data.ParameterDirection.Output
        };

        var titleParam = new SqlParameter("@Title", dto.Title ?? (object)DBNull.Value);
        var descriptionParam = new SqlParameter("@Description", dto.Description ?? (object)DBNull.Value);
        var createdByParam = new SqlParameter("@CreatedBy", dto.CreatedBy);
        var timeLimitParam = new SqlParameter("@TimeLimitMinutes", dto.TimeLimitMinutes ?? (object)DBNull.Value);

        await _context.Database.ExecuteSqlRawAsync(
            "EXEC [dbo].[CreateQuiz] @Title, @Description, @CreatedBy, @TimeLimitMinutes, @QuizID OUTPUT",
            titleParam, descriptionParam, createdByParam, timeLimitParam, quizIdParam
        );

        return (int)quizIdParam.Value;
    }

    public async Task<QuizDetailsDto?> GetQuizByIdAsync(int quizId)
    {
        // Commented out: LINQ-based code
        /*
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(qn => qn.Answers)
            .Include(q => q.Categories)
            .FirstOrDefaultAsync(q => q.QuizID == quizId);

        return quiz;
        */

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();

        using var command = connection.CreateCommand();
        command.CommandText = "GetQuizById";
        command.CommandType = System.Data.CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@QuizID", quizId));

        using var reader = await command.ExecuteReaderAsync();

        QuizDetailsDto? quiz = null;

        
        if (await reader.ReadAsync())
        {
            quiz = new QuizDetailsDto
            {
                QuizID = reader.GetInt32(reader.GetOrdinal("QuizID")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                Description = reader["Description"] as string,
                TimeLimitMinutes = reader["TimeLimitMinutes"] as int?,
                CreatedBy = reader.GetInt32(reader.GetOrdinal("CreatedBy")),
                CreatedAt = reader["CreatedAt"] as DateTime?,
                Categories = reader["Categories"] as string,
                Questions = new List<QuestionWithAnswersDto>()
            };
        }

        
        if (quiz != null && await reader.NextResultAsync())
        {
            var questions = new Dictionary<int, QuestionWithAnswersDto>();

            while (await reader.ReadAsync())
            {
                int questionId = reader.GetInt32(reader.GetOrdinal("QuestionID"));
                if (!questions.TryGetValue(questionId, out var question))
                {
                    int? difficultyId = reader["DifficultyID"] as int?;

                    question = new QuestionWithAnswersDto
                    {
                        QuestionID = questionId,
                        SequenceNum = reader["SequenceNum"] as int?,
                        SequenceId = reader["SequenceId"] as int?,
                        QuestionText = reader["QuestionText"] as string,
                        DifficultyID = difficultyId ?? 0, 
                        Difficulty = reader["Difficulty"] as string,
                        TimeLimitSeconds = reader["TimeLimitSeconds"] as int? ?? 0,
                        Answers = new List<AnswerDto>()
                    };
                    questions[questionId] = question;
                }

                if (!reader.IsDBNull(reader.GetOrdinal("AnswerID")))
                {
                    question.Answers.Add(new AnswerDto
                    {
                        AnswerID = reader.GetInt32(reader.GetOrdinal("AnswerID")),
                        AnswerText = reader["AnswerText"] as string,
                        IsCorrect = reader.GetBoolean(reader.GetOrdinal("IsCorrect"))
                    });
                }
            }

            quiz.Questions = questions.Values.ToList();
        }

        return quiz;
    }

    public async Task UpdateQuizAsync(int quizId, UpdateQuizDto dto)
    {
        var quiz = await _context.Quizzes.FindAsync(quizId);
        if (quiz != null)
        {
            quiz.Title = dto.Title;
            quiz.Description = dto.Description;
            quiz.TimeLimitMinutes = dto.TimeLimitMinutes;
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteQuizAsync(int quizId)
    {
        var quizIdParam = new SqlParameter("@QuizID", quizId);
        await _context.Database.ExecuteSqlRawAsync("EXEC [dbo].[DeleteQuiz] @QuizID", quizIdParam);
    }

    // --- QUESTION METHODS ---

    public async Task<int> CreateQuestionAsync(int quizId, CreateQuestionDto dto)
    {
        var question = new Question
        {
            QuizId = quizId,
            QuestionText = dto.QuestionText,
            DifficultyId = dto.DifficultyID,
            TimeLimitSeconds = dto.TimeLimitSeconds
            
        };

        _context.Questions.Add(question);
        await _context.SaveChangesAsync();

        return question.QuestionId;
    }

    public async Task UpdateQuestionAsync(int questionId, CreateQuestionDto dto)
    {
        var question = await _context.Questions.FindAsync(questionId);
        if (question != null)
        {
            question.QuestionText = dto.QuestionText;
            
            // question.DifficultyID = dto.DifficultyID;
            // question.TimeLimitSeconds = dto.TimeLimitSeconds;
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteQuestionAsync(int questionId)
    {
        var questionIdParam = new SqlParameter("@QuestionID", questionId);
        await _context.Database.ExecuteSqlRawAsync("EXEC [dbo].[DeleteQuestion] @QuestionID", questionIdParam);
    }

    

    public async Task<int> CreateAnswerAsync(int questionId, CreateAnswerDto dto)
    {
        var answer = new Answer
        {
            QuestionId = questionId,
            AnswerText = dto.AnswerText,
            IsCorrect = dto.IsCorrect
            
        };

        _context.Answers.Add(answer);
        await _context.SaveChangesAsync();

        return answer.AnswerId;
    }

    public async Task<List<Answer>> GetAnswersByQuestionAsync(int questionId)
    {
        return await _context.Answers
            .Where(a => a.QuestionId == questionId)
            .ToListAsync();
    }

    public async Task DeleteAnswerAsync(int answerId)
    {
        var answer = await _context.Answers.FindAsync(answerId);
        if (answer != null)
        {
            _context.Answers.Remove(answer);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateAnswerAsync(int answerId, UpdateAnswerDto dto)
    {
        var answer = await _context.Answers.FindAsync(answerId);
        if (answer != null)
        {
            answer.AnswerText = dto.AnswerText;
            answer.IsCorrect = dto.IsCorrect;
            
            await _context.SaveChangesAsync();
        }
    }

    // --- CATEGORY METHODS ---

    public async Task CreateCategoryAsync(CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name
        };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
    }

    public async Task TagQuizWithCategoryAsync(int quizId, int categoryId)
    {
        var quizIdParam = new SqlParameter("@QuizID", quizId);
        var categoryIdParam = new SqlParameter("@CategoryID", categoryId);
                                                                                             
        await _context.Database.ExecuteSqlRawAsync(
            "EXEC [dbo].[TagQuizWithCategory] @QuizID, @CategoryID",
            quizIdParam, categoryIdParam
        );
    }

    public async Task<List<vw_Category>> GetCategoriesAsync()
    {
        return await _context.vw_Category.ToListAsync();
    }

    

    public async Task<List<QuestionSequence>> GetSequencesByQuizIdAsync(int quizId)
    {
        return await _context.QuestionSequences
            .Where(qs => qs.QuizId == quizId)
            .OrderBy(qs => qs.SequenceNum)
            .ToListAsync();
    }

    public async Task<int> CreateSequenceAsync(int quizId, int questionId, int order)
    {
        var sequence = new QuestionSequence
        {
            QuizId = quizId,
            QuestionId = questionId,
            SequenceNum = order
        };

        _context.QuestionSequences.Add(sequence);
        await _context.SaveChangesAsync();

        return sequence.SequenceId;
    }

    public async Task UpdateSequenceOrderAsync(int sequenceId, int newOrder)
    {
        var sequence = await _context.QuestionSequences.FindAsync(sequenceId);
        if (sequence != null)
        {
            sequence.SequenceNum = newOrder;
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteSequenceAsync(int sequenceId)
    {
        var sequence = await _context.QuestionSequences.FindAsync(sequenceId);
        if (sequence != null)
        {
            _context.QuestionSequences.Remove(sequence);
            await _context.SaveChangesAsync();
        }
    }

    // --- CONDITIONAL LOGIC METHODS ---

    public async Task<(bool Success, string? ErrorMessage)> CreateConditionalLogicAsync(CreateConditionalLogicDto dto)
    {
        // Optionally validate referenced entities exist
        var exists = await _context.Questions.AnyAsync(q => q.QuestionId == dto.FollowUpQuestionID);
        if (!exists)
            return (false, $"FollowUpQuestionID {dto.FollowUpQuestionID} does not exist.");

        var logic = new ConditionalLogic
        {
            BaseQuestionId = dto.BaseQuestionID,
            TriggerAnswerId = dto.TriggerAnswerID,
            FollowUpQuestionId = dto.FollowUpQuestionID 
        };
        _context.ConditionalLogic.Add(logic);
        await _context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<List<ConditionalLogic>> GetConditionalPathsByQuestionAsync(int baseQuestionId)
    {
        return await _context.ConditionalLogic
            .Where(cl => cl.BaseQuestionId == baseQuestionId)
            .ToListAsync();
    }

    public async Task DeleteConditionalPathAsync(DeleteConditionalPathDto dto)
    {
        var logic = await _context.ConditionalLogic.FirstOrDefaultAsync(cl =>
            cl.BaseQuestionId == dto.BaseQuestionID &&
            cl.TriggerAnswerId == dto.TriggerAnswerID &&
            cl.FollowUpQuestionId == dto.FollowUpQuestionID);

        if (logic != null)
        {
            _context.ConditionalLogic.Remove(logic);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateConditionalPathAsync(UpdateConditionalPathDto dto)
    {
        var logic = await _context.ConditionalLogic.FirstOrDefaultAsync(cl =>
            cl.BaseQuestionId == dto.BaseQuestionID &&
            cl.TriggerAnswerId == dto.OldTriggerAnswerID &&
            cl.FollowUpQuestionId == dto.OldFollowUpQuestionID);

        if (logic != null)
        {
            logic.TriggerAnswerId = dto.NewTriggerAnswerID;
            logic.FollowUpQuestionId = dto.NewFollowUpQuestionID;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> SaveQuestionWithAnswersAsync(QuestionWithAnswersDto dto, int? insert = null)
    {
        
        var questionIdParam = new SqlParameter("@QuestionID",
            (!dto.QuestionID.HasValue || dto.QuestionID.Value == 0) ? (object)DBNull.Value : dto.QuestionID.Value);
        var quizIdParam = new SqlParameter("@QuizID", dto.QuizID);
        var questionTextParam = new SqlParameter("@QuestionText", dto.QuestionText ?? (object)DBNull.Value);
        var difficultyIdParam = new SqlParameter("@DifficultyID", dto.DifficultyID);
        var timeLimitSecondsParam = new SqlParameter("@TimeLimitSeconds", dto.TimeLimitSeconds);

        int questionId;
        
        using (var command = _context.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "AddOrUpdateQuestion";
            command.CommandType = System.Data.CommandType.StoredProcedure;
            command.Parameters.AddRange(new[] {
                questionIdParam, quizIdParam, questionTextParam, difficultyIdParam, timeLimitSecondsParam
            });

            if (command.Connection.State != System.Data.ConnectionState.Open)
                await command.Connection.OpenAsync();

            using (var reader = await command.ExecuteReaderAsync())
            {
                await reader.ReadAsync();
                questionId = reader.GetInt32(0);
            }
        }

        
        if (questionId > 0 && dto.Answers != null)
        {
            foreach (var answer in dto.Answers)
            {
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = "AddOrUpdateAnswer";
                    command.CommandType = System.Data.CommandType.StoredProcedure;
                    command.Parameters.AddRange(new[] {
                        new SqlParameter("@AnswerID", answer.AnswerID == 0 ? (object)DBNull.Value : (object)answer.AnswerID),
                        new SqlParameter("@QuestionID", questionId),
                        new SqlParameter("@AnswerText", answer.AnswerText ?? (object)DBNull.Value),
                        new SqlParameter("@IsCorrect", answer.IsCorrect)
                    });

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                        await command.Connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        return questionId;
    }
}

