﻿using System.ComponentModel.DataAnnotations;

namespace Api.Dtos
{
    public class UserDto
    {
        [Required]
        [StringLength(15, MinimumLength = 3, ErrorMessage = "Name must be at least (3), and maximum (15) characters")]
        public string Name { get; set; }
    }
}
