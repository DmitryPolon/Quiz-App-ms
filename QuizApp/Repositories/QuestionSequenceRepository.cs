using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QuizApp.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public class QuestionSequenceRepository
{
    private readonly MyDbContext _context;
    public QuestionSequenceRepository(MyDbContext context) => _context = context;

    public async Task<int?> CreateSequenceAsync(int sequenceNum, int quizId, int questionId)
    {
        var sequenceNumParam = new SqlParameter("@SequenceNum", sequenceNum);
        var quizIdParam = new SqlParameter("@QuizID", quizId);
        var questionIdParam = new SqlParameter("@QuestionID", questionId);

        var result = await _context.QuestionSequences
            .FromSqlRaw("EXEC [dbo].[sp_InsertQuestionSequence] @SequenceNum, @QuizID, @QuestionID",
                sequenceNumParam, quizIdParam, questionIdParam)
            .ToListAsync();

        return result.Count > 0 ? result[0].SequenceId : null;
    }

    public async Task<int> UpdateSequenceAsync(int sequenceId, int sequenceNum)
    {
        var sequenceIdParam = new SqlParameter("@SequenceId", sequenceId);
        var sequenceNumParam = new SqlParameter("@SequenceNum", sequenceNum);

        return await _context.Database.ExecuteSqlRawAsync(
            "EXEC [dbo].[UpdateQuestionSequence] @SequenceId, @SequenceNum",
            sequenceIdParam, sequenceNumParam);
    }

    public async Task<int> DeleteAsync(int sequenceId)
    {
        var sequenceIdParam = new SqlParameter("@SequenceId", sequenceId);
        return await _context.Database.ExecuteSqlRawAsync(
            "EXEC [dbo].[DeleteQuestionSequence] @SequenceId", sequenceIdParam);
    }

    public async Task<List<QuestionSequence>> GetSequenceByQuizIdAsync(int quizId)
    {
        var quizIdParam = new SqlParameter("@QuizID", quizId);
        return await _context.QuestionSequences
            .FromSqlRaw("EXEC [dbo].[sp_GetQuestionSequenceByQuizId] @QuizID", quizIdParam)
            .ToListAsync();
    }

    public async Task<List<QuestionSequence>> GetSequenceAllAsync()
    {
        return await _context.QuestionSequences
            .FromSqlRaw("EXEC [dbo].[sp_GetAllQuestionSequences]")
            .ToListAsync();
    }

    public async Task<int> DeleteSequenceByQuizIdAsync(int quizId)
    {
        var quizIdParam = new SqlParameter("@QuizID", quizId);
        return await _context.Database.ExecuteSqlRawAsync(
            "EXEC [dbo].[sp_DeleteQuestionSequenceByQuizId] @QuizID", quizIdParam);
    }
}