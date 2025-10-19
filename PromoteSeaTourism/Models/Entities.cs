using System;
using System.Collections.Generic;

namespace PromoteSeaTourism.Models
{
    // ========== ENUMS ==========
    public enum UserRole { User, Editor, Admin }
    public enum CategoryScope { Article, Tour, Place, Event, Accommodation, Restaurant }
    public enum ContentTarget { Article, Tour, Place, Event, Accommodation, Restaurant }
    public enum ImageOwner { Article, Restaurant, Accommodation, Review, Tour, Event, Place }

    // ========== USER ==========
    public class User
    {
        public long Id { get; set; }
        public string Email { get; set; } = default!;
        public byte[] PasswordHash { get; set; } = default!;
        public byte[] PasswordSalt { get; set; } = default!;
        public string Name { get; set; } = default!;
        public UserRole Role { get; set; } = UserRole.User;
        public string? Img { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Image> MediaCreated { get; set; } = new List<Image>();
    }

    // ========== CATEGORY ==========
    public class Category
    {
        public long Id { get; set; }
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string Type { get; set; } = "article";
        public bool IsActive { get; set; } = true;
    }

    // ========== ARTICLE ==========
    public class Article
    {
        public long Id { get; set; }
        public string Title { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public long? CoverImageId { get; set; }
        public long? CategoryId { get; set; }
        public Category? Category { get; set; }
        public bool IsPublished { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    // ========== PLACE ==========
    public class Place
    {
        public long Id { get; set; }
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? Address { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public decimal? GeoLat { get; set; }
        public decimal? GeoLng { get; set; }
        public string? BestSeason { get; set; }
        public string? TicketInfo { get; set; }
        public string? OpeningHours { get; set; }
        public long? CoverImageId { get; set; }
        public long? CategoryId { get; set; }
        public Category? Category { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    // ========== TOUR ==========
    public class Tour
    {
       public long Id { get; set; }

        // === Schema mới ===
        public string Name { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string? Summary { get; set; }
        public string Description { get; set; } = null!;
        public decimal? PriceFrom { get; set; }
        public string? Itinerary { get; set; }   // TEXT NULL
        public long CategoryId { get; set; }
        public bool IsPublished { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Category Category { get; set; } = null!;
    }

    // ========== EVENT ==========
    public class Event
    {
        public long Id { get; set; }
        public string Title { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public long? PlaceId { get; set; }
        public string? Address { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? PriceInfo { get; set; }
        public long? CoverImageId { get; set; }
        public long? CategoryId { get; set; }
        public Category? Category { get; set; }
        public Place? Place { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
    // ========== ACCOMMODATION ==========
    public class Accommodation
    {
        public long Id { get; set; }
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Website { get; set; }
        public sbyte? Star { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public long? CoverImageId { get; set; }
        public long? CategoryId { get; set; }
        public Category? Category { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    // ========== RESTAURANT ==========
    public class Restaurant
    {
        public long Id { get; set; }
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Website { get; set; }
        public string? PriceRangeText { get; set; }
        public long? CoverImageId { get; set; }
        public long? CategoryId { get; set; }
        public Category? Category { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    // ========== REVIEW ==========
    public class Review
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public User User { get; set; } = default!;
        public ContentTarget TargetType { get; set; }
        public long TargetId { get; set; }
        public sbyte Rating { get; set; } = 5;
        public string? Title { get; set; }
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    // ========== FAVORITE ==========
    public class Favorite
    {
        public long UserId { get; set; }
        public User User { get; set; } = default!;
        public ContentTarget TargetType { get; set; }
        public long TargetId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    // ========== IMAGE ==========
    public class Image
    {
        public long Id { get; set; }
        public string Url { get; set; } = default!;
        public string? AltText { get; set; }
        public string? Caption { get; set; }
        public bool IsCover { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public long? CreatedBy { get; set; }
        public User? CreatedByUser { get; set; }
    }

    // ========== IMAGELINK ==========
    public class ImageLink
    {
        public long Id { get; set; }
        public long ImageId { get; set; }
        public Image Image { get; set; } = default!;
        public ImageOwner TargetType { get; set; }
        public long TargetId { get; set; }
        public int Position { get; set; } = 0;
        public bool IsCover { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
