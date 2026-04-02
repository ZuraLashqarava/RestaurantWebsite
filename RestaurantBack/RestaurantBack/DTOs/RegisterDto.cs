using System.ComponentModel.DataAnnotations;

namespace RestaurantBack.DTOs
{
    public class RegisterDto
    {
       
            [Required]
            public string Name { get; set; }

            [Required]
            public string LastName { get; set; }

            [Required]
            [EmailAddress]
            public string Email { get; set; }

            [Required]
            [MinLength(6)]
            public string Password { get; set; }
        }

        public class LoginDto
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; }

            [Required]
            public string Password { get; set; }
        }

        public class UserResponseDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string LastName { get; set; }
            public string Email { get; set; }
        }

        public class AuthResponseDto
        {
            public string Token { get; set; }
            public UserResponseDto User { get; set; }
        }


    }

