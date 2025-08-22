using Microsoft.AspNetCore.Mvc;
using QuizApp.Models;
using QuizApp.Repositories;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace QuizApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ServiceFilter(typeof(ApiLoggingFilter))]
    public class QuizAdminController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly QuizAdminRepository _quizRepository;

        public QuizAdminController(MyDbContext context, QuizAdminRepository quizRepository)
        {
            _context = context;
            _quizRepository = quizRepository;
        }

        [HttpPost("CreateQuiz")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDto dto)
        {
            try
            {
                int quizId = await _quizRepository.CreateQuizAsync(dto);
                return Ok(new { QuizID = quizId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("GetQuizById/{quizId}")]
        public async Task<IActionResult> GetQuizById(int quizId)
        {
            var quiz = await _quizRepository.GetQuizByIdAsync(quizId);
            if (quiz == null)
                return NotFound();
            return Ok(quiz);
        }

        [HttpPut("UpdateQuiz/{quizId}")]
        public async Task<IActionResult> UpdateQuiz(int quizId, [FromBody] UpdateQuizDto dto)
        {
            await _quizRepository.UpdateQuizAsync(quizId, dto);
            return Ok();
        }

        [HttpDelete("DeleteQuiz/{quizId}")]
        public async Task<IActionResult> DeleteQuiz(int quizId)
        {
            await _quizRepository.DeleteQuizAsync(quizId);
            return Ok();
        }

        // --- QUESTION ENDPOINTS ---

        [HttpPost("CreateQuestion/{quizId}/questions")]
        public async Task<IActionResult> CreateQuestion(int quizId, [FromBody] CreateQuestionDto dto)
        {
            await _quizRepository.CreateQuestionAsync(quizId, dto);
            return Ok();
        }

        [HttpPut("UpdateQuestion/{questionId}")]
        public async Task<IActionResult> UpdateQuestion(int questionId, [FromBody] CreateQuestionDto dto)
        {
            await _quizRepository.UpdateQuestionAsync(questionId, dto);
            return Ok();
        }

        [HttpDelete("DeleteQuestion/{questionId}")]
        public async Task<IActionResult> DeleteQuestion(int questionId)
        {
            await _quizRepository.DeleteQuestionAsync(questionId);
            return Ok();
        }

        // --- ANSWER ENDPOINTS ---

        [HttpPost("CreateAnswer/{questionId}/answers")]
        public async Task<IActionResult> CreateAnswer(int questionId, [FromBody] CreateAnswerDto dto)
        {
            await _quizRepository.CreateAnswerAsync(questionId, dto);
            return Ok();
        }

        [HttpGet("GetAnswersByQuestion/{questionId}/answers")]
        public async Task<IActionResult> GetAnswersByQuestion(int questionId)
        {
            var answers = await _quizRepository.GetAnswersByQuestionAsync(questionId);
            return Ok(answers);
        }

        [HttpPut("UpdateAnswer/{answerId}")]
        public async Task<IActionResult> UpdateAnswer(int answerId, [FromBody] UpdateAnswerDto dto)
        {
            await _quizRepository.UpdateAnswerAsync(answerId, dto);
            return Ok();
        }

        [HttpDelete("DeleteAnswer/{answerId}")]
        public async Task<IActionResult> DeleteAnswer(int answerId)
        {
            await _quizRepository.DeleteAnswerAsync(answerId);
            return Ok();
        }

        // --- CATEGORY ENDPOINTS ---

        [HttpPost("CreateCategory")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            await _quizRepository.CreateCategoryAsync(dto);
            return Ok();
        }

        [HttpGet("GetCategories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _quizRepository.GetCategoriesAsync();
            return Ok(categories);
        }

        [HttpPost("TagQuizWithCategory/{quizId}/categories/{categoryId}")]
        public async Task<IActionResult> TagQuizWithCategory(int quizId, int categoryId)
        {
            await _quizRepository.TagQuizWithCategoryAsync(quizId, categoryId);
            return Ok();
        }

        // --- CONDITIONAL LOGIC ENDPOINTS ---

        [HttpPost("CreateConditionalLogic")]
        public async Task<IActionResult> CreateConditionalLogic([FromBody] CreateConditionalLogicDto dto)
        {
            var result = await _quizRepository.CreateConditionalLogicAsync(dto);
            if (!result.Success)
                return BadRequest(new { error = result.ErrorMessage });
            return Ok();
        }

        [HttpGet("CreateConditionalLogic/{baseQuestionId}")]
        public async Task<IActionResult> GetConditionalPathsByQuestion(int baseQuestionId)
        {
            var paths = await _quizRepository.GetConditionalPathsByQuestionAsync(baseQuestionId);
            return Ok(paths);
        }

        [HttpDelete("DeleteConditionalPath")]
        public async Task<IActionResult> DeleteConditionalPath([FromBody] DeleteConditionalPathDto dto)
        {
            await _quizRepository.DeleteConditionalPathAsync(dto);
            return Ok();
        }

        [HttpPut("UpdateConditionalPath")]
        public async Task<IActionResult> UpdateConditionalPath([FromBody] UpdateConditionalPathDto dto)
        {
            await _quizRepository.UpdateConditionalPathAsync(dto);
            return Ok();
        }

        [HttpGet("QuizOverview")]
        public async Task<IActionResult> GetQuizOverview(
            int page = 1,
            int pageSize = 10,
            string? title = null,
            string? createdBy = null,
            string? category = null,
            string sortBy = "createdAt",
            string sortOrder = "desc")
        {
            var query = _context.vw_QuizOverview.AsQueryable();

            if (!string.IsNullOrEmpty(title))
                query = query.Where(q => q.Title.Contains(title));
            if (!string.IsNullOrEmpty(createdBy))
                query = query.Where(q => q.CreatedBy.Contains(createdBy));
            if (!string.IsNullOrEmpty(category))
                query = query.Where(q => q.Categories != null && q.Categories.Contains(category));

            // Sorting
            query = (sortBy.ToLower(), sortOrder.ToLower()) switch
            {
                ("title", "asc") => query.OrderBy(q => q.Title),
                ("title", "desc") => query.OrderByDescending(q => q.Title),
                ("createdby", "asc") => query.OrderBy(q => q.CreatedBy),
                ("createdby", "desc") => query.OrderByDescending(q => q.CreatedBy),
                ("createdat", "asc") => query.OrderBy(q => q.CreatedAt),
                ("createdat", "desc") => query.OrderByDescending(q => q.CreatedAt),
                _ => query.OrderByDescending(q => q.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { totalCount, items });
        }

        [HttpPost("SaveQuestionWithAnswers")]
        public async Task<IActionResult> SaveQuestionWithAnswers([FromBody] QuestionWithAnswersDto dto)
        {
            var questionId = await _quizRepository.SaveQuestionWithAnswersAsync(dto);
            return Ok(new { QuestionID = questionId });
        }
    }
}