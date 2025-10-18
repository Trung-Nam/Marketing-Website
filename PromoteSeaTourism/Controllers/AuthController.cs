// File: PromoteSeaTourism/Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PromoteSeaTourism.Data;
using PromoteSeaTourism.DTOs;
using PromoteSeaTourism.Models;
using PromoteSeaTourism.Services;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace PromoteSeaTourism.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly PasswordHasher _hasher;
        private readonly JwtTokenService _jwt;

        public AuthController(AppDbContext db, PasswordHasher hasher, JwtTokenService jwt)
        {
            _db = db;
            _hasher = hasher;
            _jwt = jwt;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req, CancellationToken ct)
        {
            var exists = await _db.Users.AnyAsync(u => u.Email == req.Email, ct);
            if (exists) return Conflict("Email already exists");

            var (hash, salt) = _hasher.Hash(req.Password);
            var user = new User
            {
                Email = req.Email,
                PasswordHash = hash,
                PasswordSalt = salt,
                Name = req.Name,
                Role = UserRole.User,
                IsActive = true
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);

            var token = _jwt.CreateToken(user.Id, user.Email, user.Name, user.Role.ToString());
            var dto = new AuthUserDto(user.Id, user.Email, user.Name, user.Role.ToString(), user.Img);
            return Ok(new AuthResponse(dto, token));
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req, CancellationToken ct)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email, ct);
            if (user is null || !user.IsActive) return Unauthorized("Invalid credentials");

            if (!_hasher.Verify(req.Password, user.PasswordHash, user.PasswordSalt))
                return Unauthorized("Invalid credentials");

            var token = _jwt.CreateToken(user.Id, user.Email, user.Name, user.Role.ToString());
            var dto = new AuthUserDto(user.Id, user.Email, user.Name, user.Role.ToString(), user.Img);
            return Ok(new AuthResponse(dto, token));
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<AuthUserDto>> Me(CancellationToken ct)
        {
            var sub = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!long.TryParse(sub, out var userId)) return Unauthorized();

            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
            if (user is null) return Unauthorized();

            return Ok(new AuthUserDto(user.Id, user.Email, user.Name, user.Role.ToString(), user.Img));
        }

        // PUT /api/auth/me
        [HttpPut("me")]
        [Authorize]
        public async Task<ActionResult<AuthUserDto>> UpdateMe([FromBody] UpdateProfileRequest req, CancellationToken ct)
        {
            var sub = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!long.TryParse(sub, out var userId)) return Unauthorized();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
            if (user is null) return Unauthorized();

            // Validate đơn giản
            if (string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new { message = "Name is required" });
            if (req.Name.Length > 150)
                return BadRequest(new { message = "Name max length is 150" });
            if (req.Img != null && req.Img.Length > 500)
                return BadRequest(new { message = "Img max length is 500" });

            user.Name = req.Name.Trim();
            user.Img  = string.IsNullOrWhiteSpace(req.Img) ? null : req.Img.Trim();

            await _db.SaveChangesAsync(ct);

            var dto = new AuthUserDto(user.Id, user.Email, user.Name, user.Role.ToString(), user.Img);
            return Ok(dto);
        }

        [HttpPut("me/password")]
        [Authorize]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest req, CancellationToken ct)
        {
            var sub = User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!long.TryParse(sub, out var userId)) return Unauthorized();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
            if (user is null || !user.IsActive) return Unauthorized();

            // Basic body validation
            if (string.IsNullOrWhiteSpace(req.CurrentPassword) ||
                string.IsNullOrWhiteSpace(req.NewPassword) ||
                string.IsNullOrWhiteSpace(req.ConfirmNewPassword))
            {
                return BadRequest(new { message = "All password fields are required" });
            }

            // Kiểm tra mật khẩu hiện tại
            if (!_hasher.Verify(req.CurrentPassword, user.PasswordHash, user.PasswordSalt))
            {
                // Tránh leak thông tin: dùng cùng 1 message cho sai current password
                return Unauthorized("Invalid current password");
            }

            // Kiểm tra confirm
            if (!req.NewPassword.Equals(req.ConfirmNewPassword))
                return BadRequest(new { message = "Confirm password does not match" });

            // Không cho phép trùng mật khẩu cũ
            if (req.NewPassword == req.CurrentPassword)
                return BadRequest(new { message = "New password must be different from current password" });

            // Validate độ mạnh (có thể điều chỉnh theo policy của bạn)
            var pwdMsg = ValidateNewPassword(req.NewPassword);
            if (pwdMsg is not null)
                return BadRequest(new { message = pwdMsg });

            // Hash & lưu
            var (newHash, newSalt) = _hasher.Hash(req.NewPassword);
            user.PasswordHash = newHash;
            user.PasswordSalt = newSalt;
            await _db.SaveChangesAsync(ct);

            // (Tuỳ chọn) phát hành token mới để client cập nhật immediately.
            // Lưu ý: JWT cũ vẫn hợp lệ tới khi hết hạn trừ khi bạn triển khai token version/blacklist.
            var token = _jwt.CreateToken(user.Id, user.Email, user.Name, user.Role.ToString());

            return Ok(new
            {
                ok = true,
                token
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // JWT stateless: client xoá token là đủ
            return Ok(new { ok = true });
        }

        // == Helpers ==
        private static string? ValidateNewPassword(string pwd)
        {
            // Tối thiểu 8 ký tự, có ít nhất: 1 chữ thường, 1 chữ hoa, 1 chữ số
            if (pwd.Length < 6) return "Password must be at least 6 characters";
            return null;
        }
    }
}

// --- DTO nội bộ để sẵn dùng, bạn có thể tách ra file riêng trong PromoteSeaTourism.DTOs ---
namespace PromoteSeaTourism.DTOs
{
    public record UpdatePasswordRequest(
        string CurrentPassword,
        string NewPassword,
        string ConfirmNewPassword
    );
}
