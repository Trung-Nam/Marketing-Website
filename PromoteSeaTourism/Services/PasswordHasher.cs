using System.Security.Cryptography;
using System.Text;

namespace PromoteSeaTourism.Services
{
    public class PasswordHasher
    {
        public (byte[] hash, byte[] salt) Hash(string password)
        {
            using var hmac = new HMACSHA512();
            var salt = hmac.Key;
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return (hash, salt);
        }

        public bool Verify(string password, byte[] hash, byte[] salt)
        {
            using var hmac = new HMACSHA512(salt);
            var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return CryptographicOperations.FixedTimeEquals(computed, hash);
        }
    }
}
