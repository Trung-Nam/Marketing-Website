using Microsoft.EntityFrameworkCore;
using PromoteSeaTourism.Models;

namespace PromoteSeaTourism.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> o) : base(o) { }

        // === Core Entities ===
        public DbSet<User> Users => Set<User>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Article> Articles => Set<Article>();
        public DbSet<Place> Places => Set<Place>();
        public DbSet<Tour> Tours => Set<Tour>();
        public DbSet<Event> Events => Set<Event>();
        public DbSet<Accommodation> Accommodations => Set<Accommodation>();
        public DbSet<Restaurant> Restaurants => Set<Restaurant>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Favorite> Favorites => Set<Favorite>();
        public DbSet<Image> Images => Set<Image>();
        public DbSet<ImageLink> ImageLinks => Set<ImageLink>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            // Nếu dùng MySQL (Pomelo), giữ charset này; nếu dùng SQL Server thì bỏ
            b.HasCharSet("utf8mb4");

            // === USERS ===
            b.Entity<User>(e =>
            {
                e.ToTable("users");
                e.Property(p => p.Email).HasMaxLength(255).IsRequired();
                e.HasIndex(p => p.Email).IsUnique();
                e.Property(p => p.Name).HasMaxLength(150).IsRequired();
                e.Property(p => p.Role).HasConversion<string>().HasMaxLength(16);
                e.Property(p => p.Img).HasMaxLength(500);
                e.Property(p => p.IsActive).HasDefaultValue(true);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            });

            // === CATEGORY ===
            b.Entity<Category>(e =>
            {
                e.ToTable("categories");
                e.Property(p => p.Name).HasMaxLength(255).IsRequired();
                e.Property(p => p.Slug).HasMaxLength(255).IsRequired();
                e.HasIndex(p => p.Slug).IsUnique();
                e.Property(p => p.Type).HasMaxLength(40).IsRequired();
                e.Property(p => p.IsActive).HasDefaultValue(true);
            });

            // === ARTICLE ===
            b.Entity<Article>(e =>
            {
                e.ToTable("articles");
                e.Property(p => p.Title).HasMaxLength(300).IsRequired();
                e.Property(p => p.Slug).HasMaxLength(340).IsRequired();
                e.HasIndex(p => p.Slug).IsUnique();
                e.Property(p => p.Summary).HasMaxLength(500);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                e.HasIndex(p => new { p.IsPublished, p.PublishedAt });
                e.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
                e.HasOne<Image>()
                    .WithMany()
                    .HasForeignKey(p => p.CoverImageId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // === PLACE ===
            b.Entity<Place>(e =>
            {
                e.ToTable("places");
                e.Property(p => p.Name).HasMaxLength(300).IsRequired();
                e.Property(p => p.Slug).HasMaxLength(340).IsRequired();
                e.HasIndex(p => p.Slug).IsUnique();
                e.Property(p => p.Summary).HasMaxLength(500);
                e.Property(p => p.Address).HasMaxLength(500);
                e.Property(p => p.Province).HasMaxLength(120);
                e.Property(p => p.District).HasMaxLength(120);
                e.Property(p => p.Ward).HasMaxLength(120);
                e.Property(p => p.BestSeason).HasMaxLength(120);
                e.Property(p => p.TicketInfo).HasMaxLength(255);
                e.Property(p => p.OpeningHours).HasMaxLength(255);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                e.HasIndex(p => new { p.IsPublished, p.CreatedAt });
                e.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
                e.HasOne<Image>()
                    .WithMany()
                    .HasForeignKey(p => p.CoverImageId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // === TOUR (UPDATED) ===
            b.Entity<Tour>(e =>
            {
                e.ToTable("tours");

                // name
                e.Property(p => p.Name).HasMaxLength(300).IsRequired();

                // slug UNIQUE
                e.Property(p => p.Slug).HasMaxLength(340).IsRequired();
                e.HasIndex(p => p.Slug).IsUnique();

                // summary (nullable)
                e.Property(p => p.Summary).HasMaxLength(500);

                // description (TEXT, required)
                e.Property(p => p.Description).IsRequired();

                // price_from DECIMAL(10,2) NULL
                e.Property(p => p.PriceFrom)
                    .HasColumnType("decimal(10,2)");

                // itinerary (TEXT NULL)
                e.Property(p => p.Itinerary);

                // created_at default now(6)
                e.Property(p => p.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                // category_id (NOT NULL) → categories.id
                e.Property(p => p.CategoryId).IsRequired();
                e.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // === EVENT ===
            b.Entity<Event>(e =>
            {
                e.ToTable("events");
                e.Property(p => p.Title).HasMaxLength(300).IsRequired();
                e.Property(p => p.Slug).HasMaxLength(340).IsRequired();
                e.HasIndex(p => p.Slug).IsUnique();
                e.Property(p => p.Summary).HasMaxLength(500);
                e.Property(p => p.Address).HasMaxLength(500);
                e.Property(p => p.PriceInfo).HasMaxLength(255);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                e.HasIndex(p => new { p.StartTime, p.EndTime });
                e.HasIndex(p => new { p.IsPublished, p.StartTime });
                e.HasOne(ev => ev.Category)
                    .WithMany()
                    .HasForeignKey(ev => ev.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
                e.HasOne(ev => ev.Place)
                    .WithMany()
                    .HasForeignKey(ev => ev.PlaceId)
                    .OnDelete(DeleteBehavior.SetNull);

            });


            // === ACCOMMODATION ===
            b.Entity<Accommodation>(e =>
            {
                e.ToTable("accommodations");
                e.Property(p => p.Name).HasMaxLength(300).IsRequired();
                e.Property(p => p.Slug).HasMaxLength(340).IsRequired();
                e.HasIndex(p => p.Slug).IsUnique();
                e.Property(p => p.Summary).HasMaxLength(500);
                e.Property(p => p.Address).HasMaxLength(500);
                e.Property(p => p.Phone).HasMaxLength(50);
                e.Property(p => p.Website).HasMaxLength(255);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                e.HasIndex(p => new { p.IsPublished, p.CreatedAt });
                e.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
                e.HasOne<Image>()
                    .WithMany()
                    .HasForeignKey(p => p.CoverImageId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // === RESTAURANT ===
            b.Entity<Restaurant>(e =>
            {
                e.ToTable("restaurants");
                e.Property(p => p.Name).HasMaxLength(300).IsRequired();
                e.Property(p => p.Slug).HasMaxLength(340).IsRequired();
                e.HasIndex(p => p.Slug).IsUnique();
                e.Property(p => p.Summary).HasMaxLength(500);
                e.Property(p => p.Address).HasMaxLength(500);
                e.Property(p => p.Phone).HasMaxLength(50);
                e.Property(p => p.Website).HasMaxLength(255);
                e.Property(p => p.PriceRangeText).HasMaxLength(120);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                e.HasIndex(p => new { p.IsPublished, p.CreatedAt });
                e.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
                e.HasOne<Image>()
                    .WithMany()
                    .HasForeignKey(p => p.CoverImageId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // === REVIEW ===
            b.Entity<Review>(e =>
            {
                e.ToTable("reviews", t =>
                {
                    t.HasCheckConstraint("CK_reviews_Rating_1_5", "`Rating` between 1 and 5");
                });
                e.Property(p => p.TargetType).HasConversion<string>().HasMaxLength(20);
                e.Property(p => p.Title).HasMaxLength(255);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                e.HasIndex(p => new { p.TargetType, p.TargetId, p.CreatedAt });
                e.HasOne(p => p.User)
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // === FAVORITE ===
            b.Entity<Favorite>(e =>
            {
                e.ToTable("favorites");
                e.HasKey(k => new { k.UserId, k.TargetType, k.TargetId });
                e.Property(p => p.TargetType).HasConversion<string>().HasMaxLength(20);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                e.HasIndex(p => new { p.TargetType, p.TargetId });
                e.HasOne(p => p.User)
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // === IMAGE ===
            b.Entity<Image>(e =>
            {
                e.ToTable("images");
                e.Property(p => p.Url).HasMaxLength(1000).IsRequired();
                e.Property(p => p.AltText).HasMaxLength(255);
                e.Property(p => p.Caption).HasMaxLength(255);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                e.HasOne(p => p.CreatedByUser)
                    .WithMany(u => u.MediaCreated)
                    .HasForeignKey(p => p.CreatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // === IMAGELINK ===
            b.Entity<ImageLink>(e =>
            {
                e.ToTable("image_links");
                e.Property(p => p.TargetType).HasConversion<string>().HasMaxLength(20);
                e.Property(p => p.Position).HasDefaultValue(0);
                e.Property(p => p.IsCover).HasDefaultValue(false);
                e.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
                e.HasIndex(p => new { p.TargetType, p.TargetId, p.Position });
                e.HasIndex(p => p.ImageId);
                e.HasOne(p => p.Image)
                    .WithMany()
                    .HasForeignKey(p => p.ImageId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(p => new { p.TargetType, p.TargetId, p.ImageId }).IsUnique();
            });
        }
    }
}
