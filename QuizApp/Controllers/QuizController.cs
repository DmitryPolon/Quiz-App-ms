using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using QuizApp.Models;
using QuizApp.Repositories;
using System.Threading.Tasks;
//using QuizApp.Services;

namespace QuizApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ServiceFilter(typeof(ApiLoggingFilter))]
    public class QuizController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly QuizRepository _quizRepository;
       

        public QuizController(MyDbContext context, QuizRepository quizRepository)
        {
            _context = context;
            _quizRepository = quizRepository;
            
        }

        [HttpGet("NextQuestionSequence")]
        public async Task<IActionResult> GetNextQuestionSequenceByNum([FromQuery] int quizId, [FromQuery] int sequenceNum)
        {
            var question = await _quizRepository.GetNextQuestionSequenceByNumAsync(quizId, sequenceNum);
            if (question == null)
                return NotFound();
            return Ok(question);
        }

        [HttpGet("{quizId}/header")]
        public async Task<ActionResult<QuizHeaderDto>> GetQuizHeader(int quizId)
        {
            var header = await _quizRepository.GetQuizHeaderAsync(quizId);
            if (header == null)
                return NotFound();
            return Ok(header);
        }

        [HttpPost("StartQuiz/{resultId}")]
        public async Task<IActionResult> StartQuiz(int resultId)
        {
            try
            {
                await _quizRepository.UpdateQuizStartTimeAsync(resultId);
                return Ok(new { Message = $"Quiz start time updated for ResultID {resultId}." });
            }
            catch (SqlException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("submit-answer")]
        public async Task<IActionResult> SubmitAnswer([FromBody] SubmitAnswerDto dto)
        {
            await _quizRepository.SubmitAnswerAsync(dto);
            return NoContent();
        }

        [HttpPost("submit-quiz/{resultId}")]
        public async Task<IActionResult> SubmitQuiz(int resultId)
        {
            await _quizRepository.SubmitQuizAsync(resultId);
            return Ok(new { message = "Quiz submitted successfully." });
        }

        [HttpGet("ScoreResult")]
        public async Task<IActionResult> ScoreResult(int resultId, bool weightByDifficulty = false)
        {
            var (summary, details) = await _quizRepository.GetScoreResultAsync(resultId, weightByDifficulty);
            return Ok(new { Summary = summary, Details = details });
        }

        [HttpGet("RetrievesQuizHeaders")]
        public async Task<ActionResult<List<RetrievesQuizHeaders>>> GetQuizHeaders(
        [FromQuery] string? quizName,
        [FromQuery] string? description,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
        {
            var result = await _quizRepository.GetQuizHeadersAsync(quizName, description, page, pageSize);
            return Ok(result);
        }

        [HttpGet("QuizHeadersUser/{userId}")]
        public async Task<IActionResult> GetQuizHeadersByUserId(int userId)
        {
            var headers = await _quizRepository.GetQuizHeadersByUserIdAsync(userId);
            return Ok(headers);
        }

        [HttpGet("Result/Responses/{resultId}")]
        public async Task<IActionResult> GetUserResponsesByResultId(int resultId)
        {
            var responses = await _quizRepository.GetUserResponsesByResultIdAsync(resultId);
            return Ok(responses);
        }
    }
    }