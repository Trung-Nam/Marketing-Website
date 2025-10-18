namespace PromoteSeaTourism.DTOs
{
    public record RegisterRequest(string Email, string Password, string Name);
    public record LoginRequest(string Email, string Password);
    public record UpdateProfileRequest(string Name, string? Img);
    public record AuthUserDto(long Id, string Email, string Name, string Role, string? Img);
    public record AuthResponse(AuthUserDto User, string Token);
}