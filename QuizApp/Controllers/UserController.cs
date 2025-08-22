using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using QuizApp.Models;
using QuizApp.Repositories;
using QuizApp.UserAppRepositories;
using Microsoft.Data.SqlClient;

namespace QuizApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ServiceFilter(typeof(ApiLoggingFilter))]
    public class UserController : ControllerBase
    {
        private readonly UserRepository _userRepository;

        public UserController(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // POST: api/User
        [HttpPost("CreateUser")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            try
            {
                await _userRepository.CreateUserAsync(dto);
                return Ok(new { dto.Username, dto.Email, IsAdmin = dto.IsAdmin });
            }
            catch (SqlException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST: api/User/verify-email
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
        {
            int rowsAffected = await _userRepository.VerifyEmailAsync(dto.UserID, dto.Code);

            if (rowsAffected > 0)
                return Ok(new { Message = "Email verified successfully." });
            else
                return BadRequest("Invalid user or verification code.");
        }

        // POST: api/User/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto dto)
        {
            var user = await _userRepository.LoginUserAsync(dto.Username, dto.Password);
            if (user == null || user.UserID == null)
                return Unauthorized("Invalid username or password.");

            return Ok(new { user });
        }

        [HttpGet("GetUsers")]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserFilterDto filter)
        {
            var users = await _userRepository.GetAllUsersAsync(filter);
            return Ok(users);
        }

        // POST: api/User/promote-to-admin/{userId}
        [HttpPost("promote-to-admin/{userId}")]
        public async Task<IActionResult> PromoteToAdmin(int userId)
        {
            try
            {
                await _userRepository.PromoteUserToAdminAsync(userId);
                return Ok(new { Message = $"User {userId} promoted to admin." });
            }
            catch (SqlException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
   
     [HttpPost("AssignQuizToUser")]
        public async Task<IActionResult> AssignQuizToUser([FromBody] AssignQuizDto dto)
        {
            try
            {
                await _userRepository.AssignQuizToUserAsync(dto.UserID, dto.QuizID);
                return Ok(new { Message = $"Quiz {dto.QuizID} assigned to user {dto.UserID}." });
            }
            catch (SqlException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}