using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using QuizApp.Models;
using QuizApp.Repositories;

[ApiController]
[Route("api/[controller]")]
[ServiceFilter(typeof(ApiLoggingFilter))]
public class QuestionSequenceController : ControllerBase
{
    private readonly QuestionSequenceRepository _repo;
    public QuestionSequenceController(QuestionSequenceRepository repo) => _repo = repo;

    [HttpPost("CreateSequence")]
    public async Task<ActionResult<int?>> CreateSequence([FromBody] QuestionSequenceCreateDto dto)
    {
        var id = await _repo.CreateSequenceAsync(dto.SequenceNum, dto.QuizID, dto.QuestionID);
        return Ok(id);
    }

    [HttpPut("UpdateSequence")]
    public async Task<ActionResult> UpdateSequence([FromQuery] int sequenceId, [FromQuery] int sequenceNum)
    {
        await _repo.UpdateSequenceAsync(sequenceId, sequenceNum);
        return NoContent();
    }

    [HttpDelete("DeleteSequence/{sequenceId}")]
    public async Task<ActionResult> DeleteSequence(int sequenceId)
    {
        await _repo.DeleteAsync(sequenceId);
        return NoContent();
    }

    [HttpGet("GetSequenceByQuizId/{quizId}")]
    public async Task<ActionResult<List<QuestionSequence>>> GetSequenceByQuizId(int quizId)
    {
        var result = await _repo.GetSequenceByQuizIdAsync(quizId);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<QuestionSequence>>> GetAll()
    {
        var result = await _repo.GetSequenceAllAsync();
        return Ok(result);
    }

    [HttpDelete("DeleteSequenceByQuizId/{quizId}")]
    public async Task<ActionResult> DeleteSequenceByQuizId(int quizId)
    {
        await _repo.DeleteSequenceByQuizIdAsync(quizId);
        return NoContent();
    }
}