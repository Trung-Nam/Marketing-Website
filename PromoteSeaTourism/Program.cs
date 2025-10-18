// File: PromoteSeaTourism/Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PromoteSeaTourism.Data;
using PromoteSeaTourism.Services;
using PromoteSeaTourism.Models; // User/UserRole/Category/CategoryScope
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ===== DbContext =====
var connStr = builder.Configuration.GetConnectionString("Default")
              ?? throw new InvalidOperationException("Missing ConnectionStrings:Default");
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseMySql(connStr, ServerVersion.AutoDetect(connStr))
);

// ===== CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact5173", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ===== JWT =====
var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<JwtOptions>(jwtSection);
var jwtOpts = jwtSection.Get<JwtOptions>()
             ?? throw new InvalidOperationException("Missing Jwt config");
var keyBytes = Encoding.UTF8.GetBytes(jwtOpts.Key ?? throw new InvalidOperationException("Missing Jwt:Key"));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOpts.Issuer,
            ValidAudience = jwtOpts.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization();

// ===== DI services =====
builder.Services.AddScoped<PasswordHasher>();
builder.Services.AddScoped<JwtTokenService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ===== Swagger + JWT Bearer =====
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PromoteSeaTourism", Version = "v1" });

    var jwtScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Nhập token theo dạng: **Bearer {token}**",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };

    c.AddSecurityDefinition("Bearer", jwtScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtScheme, Array.Empty<string>() }
    });

    // Register schema examples
    c.SchemaFilter<PromoteSeaTourism.Infrastructure.Swagger.ExampleSchemaFilter>();
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact5173");

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ===== Migrate + Seed (Users + Categories flat) =====
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();

    db.Database.Migrate();

    // --- Seed Users ---
    const string adminEmail = "admin@example.com";
    if (!db.Users.Any(u => u.Email == adminEmail))
    {
        var (hash, salt) = hasher.Hash("123456");
        db.Users.Add(new User
        {
            Email = adminEmail,
            PasswordHash = hash,
            PasswordSalt = salt,
            Name = "Administrator",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
    }

    const string userEmail = "user@example.com";
    if (!db.Users.Any(u => u.Email == userEmail))
    {
        var (hash, salt) = hasher.Hash("123456");
        db.Users.Add(new User
        {
            Email = userEmail,
            PasswordHash = hash,
            PasswordSalt = salt,
            Name = "Default User",
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
    }

    // Thêm Editor user
    const string editorEmail = "editor@example.com";
    if (!db.Users.Any(u => u.Email == editorEmail))
    {
        var (hash, salt) = hasher.Hash("123456");
        db.Users.Add(new User
        {
            Email = editorEmail,
            PasswordHash = hash,
            PasswordSalt = salt,
            Name = "Content Editor",
            Role = UserRole.Editor,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
    }

    // --- Seed Categories (flat, no parent) ---
    var seeds = new (string Name, string Slug, string Type)[]
    {
        // ===== Places =====
        ("Điểm đến/Địa danh",      "places",                "place"),
        ("Bãi biển",                "beaches",               "place"),
        ("View check-in",           "view-check-in",         "place"),
        ("Di tích",                 "heritage-sites",        "place"),
        ("Chợ",                     "markets",               "place"),
        ("Làng nghề",               "craft-villages",        "place"),
        ("Công viên & Thiên nhiên", "parks-nature",          "place"),
        ("Bảo tàng",                "museums",               "place"),

        // ===== Articles =====
        ("Bài viết/Blog",           "articles",              "article"),
        ("Tin tức",                 "news",                  "article"),
        ("Cẩm nang",                "guides",                "article"),
        ("Mẹo du lịch",             "tips",                  "article"),
        ("Lịch trình gợi ý",        "suggested-itineraries", "article"),

        // ===== Events =====
        ("Sự kiện/Lễ hội",          "events",                "event"),
        ("Lễ hội",                  "festivals",             "event"),
        ("Hội chợ",                 "fairs",                 "event"),
        ("Thể thao",                "sports",                "event"),
        ("Âm nhạc",                 "music",                 "event"),

        // ===== Accommodations =====
        ("Lưu trú",                 "accommodations",        "accommodation"),
        ("Khách sạn",               "hotels",                "accommodation"),
        ("Homestay",                "homestays",             "accommodation"),

        // ===== Restaurants =====
        ("Ăn uống",                 "restaurants",           "restaurant"),
        ("Đặc sản địa phương",      "local-food",            "restaurant"),
        ("Hải sản",                 "seafood",               "restaurant"),
        ("Cà phê",                  "cafes",                 "restaurant"),

        // ===== Tours =====
        ("Tour & Lịch trình",       "tours",                 "tour"),
        ("Tour trong ngày",         "day-trips",             "tour"),
        ("Tour 2–3 ngày",           "two-three-days",        "tour"),
        ("Phiêu lưu",               "adventure",             "tour"),
        ("Gia đình",                "family",                "tour"),
    };

    static void Log(string msg) => Console.WriteLine($"[Seed] {msg}");

    Category? FindBySlug(AppDbContext db, string slug)
        => db.Categories.FirstOrDefault(c => c.Slug == slug);

    bool ExistsBySlug(AppDbContext db, string slug)
        => db.Categories.Any(c => c.Slug == slug);

    foreach (var s in seeds)
    {
        try
        {
            var existed = FindBySlug(db, s.Slug);
            if (existed != null)
            {
                if (existed.Name != s.Name || !string.Equals(existed.Type, s.Type, StringComparison.OrdinalIgnoreCase))
                {
                    existed.Name = s.Name;
                    existed.Type = s.Type;
                    existed.IsActive = true;
                    db.Update(existed);
                    db.SaveChanges();
                    Log($"Updated category: {s.Slug}");
                }
                else
                {
                    Log($"Skipped category (exists): {s.Slug}");
                }
                continue;
            }

            db.Categories.Add(new Category
            {
                Name = s.Name,
                Slug = s.Slug,
                Type = s.Type,
                IsActive = true
            });
            db.SaveChanges();
            Log($"Added category: {s.Slug}");
        }
        catch (Exception ex)
        {
            Log($"ERROR category {s.Slug}: {ex.GetBaseException().Message}");
        }
    }
        // =========================
    // SEED MẪU CHO ẢNH & NỘI DUNG
    // =========================

    // Helpers chung
    long CatId(string slug) =>
        db.Categories.Where(c => c.Slug == slug).Select(c => c.Id).First();

    T Ensure<T>(T? entity, string what) where T : class
        => entity ?? throw new InvalidOperationException($"Missing seed dependency: {what}");

    // ---------- IMAGES ----------
    // Tạo một vài ảnh mẫu (nếu chưa có URL tương ứng)
    string[] sampleImageUrls = new[]
    {
        "https://picsum.photos/id/1018/1200/800",
        "https://picsum.photos/id/1015/1200/800",
        "https://picsum.photos/id/1016/1200/800",
        "https://picsum.photos/id/1024/1200/800",
        "https://picsum.photos/id/1020/1200/800",
        "https://picsum.photos/id/1021/1200/800",
    };

    var existingUrls = db.Images
        .Where(i => sampleImageUrls.Contains(i.Url))
        .Select(i => i.Url).ToHashSet();

    foreach (var url in sampleImageUrls)
    {
        if (!existingUrls.Contains(url))
        {
            db.Images.Add(new Image
            {
                Url = url,
                AltText = "Sample image",
                Caption = "Ảnh mẫu",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = null
            });
        }
    }
    db.SaveChanges();

    // Map URL → Image.Id
    var imageIdByUrl = db.Images
        .Where(i => sampleImageUrls.Contains(i.Url))
        .ToDictionary(i => i.Url, i => i.Id);

    // ---------- PLACES ----------
    var placesSeed = new (string Name, string Slug, string? Summary, string? Address, string CatSlug, string CoverUrl)[]
    {
        ("Bãi biển Ba Động",  "bai-bien-ba-dong",  "Bãi biển hoang sơ, cát mịn.",     "Trà Vinh",  "beaches",         sampleImageUrls[0]),
        ("Đồi cát vàng",      "doi-cat-vang",      "Điểm check-in hoàng hôn đẹp.",     "Phan Thiết","view-check-in",   sampleImageUrls[1]),
        ("Bảo tàng Biển",     "bao-tang-bien",     "Trưng bày văn hóa ngư dân.",       "Nha Trang", "museums",         sampleImageUrls[2]),
        ("Chợ đêm Hội An",    "cho-dem-hoi-an",    "Chợ đêm sầm uất với đèn lồng.",    "Hội An",   "markets",         sampleImageUrls[3]),
        ("Làng gốm Thanh Hà", "lang-gom-thanh-ha", "Làng nghề gốm truyền thống.",       "Hội An",   "craft-villages",  sampleImageUrls[4]),
        ("Công viên Quốc gia", "cong-vien-quoc-gia", "Khu bảo tồn thiên nhiên.",        "Cát Tiên", "parks-nature",    sampleImageUrls[5]),
    };

    // Remove old sample places with same slugs for a clean re-seed
    var placeSlugs = placesSeed.Select(p => p.Slug).ToArray();
    var oldPlaces = db.Places.Where(x => placeSlugs.Contains(x.Slug)).ToList();
    if (oldPlaces.Count > 0)
    {
        db.Places.RemoveRange(oldPlaces);
        db.SaveChanges();
    }

    foreach (var p in placesSeed)
    {
        db.Places.Add(new Place
        {
            Name = p.Name,
            Slug = p.Slug,
            Summary = p.Summary,
            Content = null,
            Address = p.Address,
            Province = null,
            District = null,
            Ward = null,
            GeoLat = null,
            GeoLng = null,
            BestSeason = "3–8",
            TicketInfo = null,
            OpeningHours = null,
            CoverImageId = imageIdByUrl[p.CoverUrl],
            CategoryId = CatId(p.CatSlug),
            IsPublished = true,
            CreatedAt = DateTime.UtcNow
        });
    }
    db.SaveChanges();

    // ---------- RESTAURANTS ----------
    var restaurantsSeed = new (string Name, string Slug, string? Summary, string? Address, string? Price, string CatSlug, string CoverUrl)[]
    {
        ("Hải sản Nắng Gió", "hai-san-nang-gio", "Hải sản tươi, view biển.", "Số 12 Đường Ven Biển", "200k–500k", "seafood", sampleImageUrls[3]),
        ("Cà phê Sóng",      "ca-phe-song",      "Cafe ven biển, chill.",    "Quảng trường Biển",     "35k–80k",  "cafes",   sampleImageUrls[4]),
        ("Nhà hàng Biển Xanh", "nha-hang-bien-xanh", "Đặc sản biển địa phương.", "Khu du lịch Biển Xanh", "150k–300k", "local-food", sampleImageUrls[0]),
        ("Quán Cà phê Gió",  "quan-ca-phe-gio",  "Cà phê view biển đẹp.",    "Bãi biển Mũi Né",       "25k–60k",  "cafes",   sampleImageUrls[1]),
    };

    var restSlugs = restaurantsSeed.Select(r => r.Slug).ToArray();
    var oldRestaurants = db.Restaurants.Where(x => restSlugs.Contains(x.Slug)).ToList();
    if (oldRestaurants.Count > 0)
    {
        db.Restaurants.RemoveRange(oldRestaurants);
        db.SaveChanges();
    }

    foreach (var r in restaurantsSeed)
    {
        db.Restaurants.Add(new Restaurant
        {
            Name = r.Name,
            Slug = r.Slug,
            Summary = r.Summary,
            Content = "Menu đa dạng, đặc sản biển.",
            Address = r.Address,
            Phone = null,
            Website = null,
            PriceRangeText = r.Price,
            CoverImageId = imageIdByUrl[r.CoverUrl],
            CategoryId = CatId(r.CatSlug),
            IsPublished = true,
            CreatedAt = DateTime.UtcNow
        });
    }
    db.SaveChanges();

    // ---------- ACCOMMODATIONS ----------
    var accSeed = new (string Name, string Slug, string? Summary, string? Address, sbyte? Star, decimal? Min, decimal? Max, string CatSlug, string CoverUrl)[]
    {
        ("Blue Sea Resort", "blue-sea-resort", "Resort ven biển, hồ bơi vô cực.", "Khu du lịch Biển Xanh", 4, 1200000, 3800000, "hotels",    sampleImageUrls[5]),
        ("An Nhiên Homestay", "an-nhien-homestay", "Homestay gần biển, decor mộc.", "Hẻm 5 Đường Biển",     null, 450000,  950000,  "homestays", sampleImageUrls[1]),
        ("Sunset Hotel", "sunset-hotel", "Khách sạn 3 sao view biển.", "Đường Bãi Trước", 3, 800000, 1500000, "hotels", sampleImageUrls[2]),
        ("Beach House", "beach-house", "Nhà nghỉ gần biển, giá rẻ.", "Bãi biển Mũi Né", null, 300000, 600000, "homestays", sampleImageUrls[3]),
    };

    var accSlugs = accSeed.Select(a => a.Slug).ToArray();
    var oldAcc = db.Accommodations.Where(x => accSlugs.Contains(x.Slug)).ToList();
    if (oldAcc.Count > 0)
    {
        db.Accommodations.RemoveRange(oldAcc);
        db.SaveChanges();
    }

    foreach (var a in accSeed)
    {
        db.Accommodations.Add(new Accommodation
        {
            Name = a.Name,
            Slug = a.Slug,
            Summary = a.Summary,
            Content = "Phòng sạch, tiện nghi cơ bản.",
            Address = a.Address,
            Phone = null,
            Website = null,
            Star = a.Star,
            MinPrice = a.Min,
            MaxPrice = a.Max,
            CoverImageId = imageIdByUrl[a.CoverUrl],
            CategoryId = CatId(a.CatSlug),
            IsPublished = true,
            CreatedAt = DateTime.UtcNow
        });
    }
    db.SaveChanges();

    // ---------- EVENTS ----------
    // Gán event về một Place bất kỳ (ví dụ bãi biển Ba Động)
    var baiBien = Ensure(db.Places.FirstOrDefault(p => p.Slug == "bai-bien-ba-dong"), "place 'bai-bien-ba-dong'");

    var eventsSeed = new (string Title, string Slug, string? Summary, string? Address, DateTime Start, DateTime? End, string CatSlug, string CoverUrl)[]
    {
        ("Lễ hội Biển 2025", "le-hoi-bien-2025", "Âm nhạc & ẩm thực biển.", baiBien.Address, DateTime.UtcNow.AddDays(20), DateTime.UtcNow.AddDays(22), "festivals", sampleImageUrls[2]),
        ("Giải chạy ven biển", "giai-chay-ven-bien", "Giải chạy 10km, 21km.", baiBien.Address, DateTime.UtcNow.AddDays(35), DateTime.UtcNow.AddDays(35).AddHours(6), "sports", sampleImageUrls[0]),
        ("Hội chợ ẩm thực", "hoi-cho-am-thuc", "Hội chợ ẩm thực địa phương.", "Quảng trường Trung tâm", DateTime.UtcNow.AddDays(45), DateTime.UtcNow.AddDays(47), "fairs", sampleImageUrls[1]),
        ("Concert Biển", "concert-bien", "Buổi hòa nhạc ngoài trời.", "Sân khấu ven biển", DateTime.UtcNow.AddDays(60), DateTime.UtcNow.AddDays(60).AddHours(3), "music", sampleImageUrls[4]),
    };

    var eventSlugs = eventsSeed.Select(e => e.Slug).ToArray();
    var oldEvents = db.Events.Where(x => eventSlugs.Contains(x.Slug)).ToList();
    if (oldEvents.Count > 0)
    {
        db.Events.RemoveRange(oldEvents);
        db.SaveChanges();
    }

    foreach (var ev in eventsSeed)
    {
        db.Events.Add(new Event
        {
            Title = ev.Title,
            Slug = ev.Slug,
            Summary = ev.Summary,
            Content = "Thông tin chi tiết sự kiện.",
            PlaceId = baiBien.Id,
            Address = ev.Address,
            StartTime = ev.Start,
            EndTime = ev.End,
            PriceInfo = "Miễn phí",
            CoverImageId = imageIdByUrl[ev.CoverUrl],
            CategoryId = CatId(ev.CatSlug),
            IsPublished = true,
            CreatedAt = DateTime.UtcNow
        });
    }
    db.SaveChanges();

    // ---------- TOURS ----------
    var toursSeed = new (string Name, string Slug, string? Summary, string Description, decimal? PriceFrom, string? Itinerary, string CatSlug, bool IsPublished)[]
    {
        ("Tour Ba Động 1 ngày", "tour-ba-dong-1-ngay", "Khởi hành sáng – về chiều.", 
            "Tham quan bãi biển Ba Động, check-in, thưởng thức hải sản.", 650000,
            "07:30 đón khách • 09:30 tắm biển • 12:00 ăn trưa • 15:00 quay về.", "day-trips", true),

        ("Tour 2N1Đ Biển & Làng chài", "tour-2n1d-bien-lang-chai", "Lịch trình nhẹ nhàng, phù hợp gia đình.",
            "Ngày 1: Biển – làng chài – cafe hoàng hôn. Ngày 2: Chợ hải sản – bảo tàng biển.", 1850000,
            "Ngày 1: 08:00 xuất phát • 10:00 biển • 16:30 cafe; Ngày 2: 07:00 chợ hải sản • 09:30 bảo tàng.", "two-three-days", true),

        ("Tour Phiêu lưu Mũi Né", "tour-phieu-luu-mui-ne", "Trải nghiệm hoang dã tại Mũi Né.",
            "Leo đồi cát, lướt ván, tham quan làng chài truyền thống.", 1200000,
            "06:00 khởi hành • 08:00 leo đồi cát • 10:00 lướt ván • 14:00 tham quan làng chài.", "adventure", true),

        ("Tour Gia đình Nha Trang", "tour-gia-dinh-nha-trang", "Tour phù hợp cho cả gia đình.",
            "Tham quan Vinpearl, thủy cung, bãi biển Nha Trang.", 2200000,
            "08:00 khởi hành • 10:00 Vinpearl • 14:00 thủy cung • 16:00 bãi biển.", "family", false),
    };

    var tourSlugs = toursSeed.Select(t => t.Slug).ToArray();
    var oldTours = db.Tours.Where(x => tourSlugs.Contains(x.Slug)).ToList();
    if (oldTours.Count > 0)
    {
        db.Tours.RemoveRange(oldTours);
        db.SaveChanges();
    }

    foreach (var t in toursSeed)
        db.Tours.Add(new Tour
        {
            Name = t.Name,
            Slug = t.Slug,
            Summary = t.Summary,
            Description = t.Description,
            PriceFrom = t.PriceFrom,
            Itinerary = t.Itinerary,
            CategoryId = CatId(t.CatSlug),
            IsPublished = t.IsPublished,
            CreatedAt = DateTime.UtcNow
        });
    db.SaveChanges();

    // ---------- IMAGELINKS (gallery) ----------
    // Liên kết mỗi entity với 1–2 ảnh; ảnh đầu tiên đánh dấu IsCover
    void EnsureGallery(ImageOwner owner, long targetId, params string[] urls)
    {
        var current = db.ImageLinks
            .Where(l => l.TargetType == owner && l.TargetId == targetId)
            .Select(l => l.Image.Url)
            .ToHashSet();

        for (int i = 0; i < urls.Length; i++)
        {
            var url = urls[i];
            if (!imageIdByUrl.TryGetValue(url, out var imgId)) continue;
            if (current.Contains(url)) continue;

            db.ImageLinks.Add(new ImageLink
            {
                ImageId = imgId,
                TargetType = owner,
                TargetId = targetId,
                Position = i,
                IsCover = (i == 0),
                CreatedAt = DateTime.UtcNow
            });
        }
    }

    // Note: Gallery supported for Article/Restaurant/Accommodation/Tour per current ImageOwner enum.

    // Gắn ảnh cho Restaurants
    foreach (var r in db.Restaurants.Where(x => restaurantsSeed.Select(s => s.Slug).Contains(x.Slug)).ToList())
        EnsureGallery(ImageOwner.Restaurant, r.Id, sampleImageUrls[3], sampleImageUrls[0]);

    // Gắn ảnh cho Accommodations
    foreach (var a in db.Accommodations.Where(x => accSeed.Select(s => s.Slug).Contains(x.Slug)).ToList())
        EnsureGallery(ImageOwner.Accommodation, a.Id, sampleImageUrls[5], sampleImageUrls[1]);

    // Gắn ảnh cho Tours
    foreach (var t in db.Tours.Where(x => toursSeed.Select(s => s.Slug).Contains(x.Slug)).ToList())
        EnsureGallery(ImageOwner.Tour, t.Id, sampleImageUrls[0], sampleImageUrls[2]);

    db.SaveChanges();

    Log("Seeded sample Images/Places/Restaurants/Accommodations/Events/Tours (+ galleries).");
        // =========================
    // SEED ARTICLES + REVIEWS + FAVORITES
    // =========================

    // --- Helpers bổ sung ---
    long UserIdByEmail(string email)
        => db.Users.Where(u => u.Email == email).Select(u => u.Id).First();

    long ArticleId(string slug)
        => db.Articles.Where(a => a.Slug == slug).Select(a => a.Id).First();

    long TourId(string slug)
        => db.Tours.Where(t => t.Slug == slug).Select(t => t.Id).First();

    long PlaceId(string slug)
        => db.Places.Where(p => p.Slug == slug).Select(p => p.Id).First();

    long RestaurantId(string slug)
        => db.Restaurants.Where(r => r.Slug == slug).Select(r => r.Id).First();

    long AccommodationId(string slug)
        => db.Accommodations.Where(a => a.Slug == slug).Select(a => a.Id).First();

    // ---------- ARTICLES ----------
    var articlesSeed = new (string Title, string Slug, string? Summary, string? Content, string CatSlug, string CoverUrl, bool IsPublished, DateTime? PublishedAt)[]
    {
        ("Cẩm nang đi Ba Động", "cam-nang-di-ba-dong",
            "Lịch trình, chi phí, lưu ý khi đi biển Ba Động.", 
            "Bài viết tổng hợp kinh nghiệm di chuyển, ăn uống, nghỉ ngơi...",
            "guides", sampleImageUrls[0], true, DateTime.UtcNow.AddDays(-10)),

        ("Gợi ý lịch trình 2N1Đ", "goi-y-lich-trinh-2n1d",
            "Lịch trình nhẹ nhàng cho gia đình có trẻ nhỏ.",
            "Ngày 1: Biển – làng chài – cafe; Ngày 2: chợ hải sản – bảo tàng...",
            "suggested-itineraries", sampleImageUrls[2], true, DateTime.UtcNow.AddDays(-7)),

        ("Mẹo săn hải sản tươi", "meo-san-hai-san-tuoi",
            "Cách chọn hải sản tươi ngon tại chợ địa phương.",
            "Đi chợ sớm, hỏi giá trước, ưu tiên quầy thân quen...",
            "tips", sampleImageUrls[3], true, DateTime.UtcNow.AddDays(-3)),

        ("Tin tức du lịch mới", "tin-tuc-du-lich-moi",
            "Cập nhật tin tức du lịch biển mới nhất.",
            "Thông tin về các điểm đến mới, chính sách du lịch...",
            "news", sampleImageUrls[1], true, DateTime.UtcNow.AddDays(-1)),

        ("Hướng dẫn chụp ảnh biển", "huong-dan-chup-anh-bien",
            "Kỹ thuật chụp ảnh đẹp tại bãi biển.",
            "Góc chụp, thời điểm vàng, setup ánh sáng...",
            "tips", sampleImageUrls[4], false, null),
    };

    foreach (var a in articlesSeed)
    {
        var existed = db.Articles.FirstOrDefault(x => x.Slug == a.Slug);
        if (existed == null)
        {
            db.Articles.Add(new Article
            {
                Title = a.Title,
                Slug = a.Slug,
                Summary = a.Summary,
                Content = a.Content,
                CoverImageId = imageIdByUrl[a.CoverUrl],
                CategoryId = CatId(a.CatSlug),
                IsPublished = a.IsPublished,
                PublishedAt = a.PublishedAt,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
    db.SaveChanges();

    // Gắn gallery cho Articles
    foreach (var art in db.Articles.Where(x => articlesSeed.Select(s => s.Slug).Contains(x.Slug)).ToList())
        EnsureGallery(ImageOwner.Article, art.Id, sampleImageUrls[0], sampleImageUrls[4]);

    db.SaveChanges();

    // ---------- REVIEWS ----------
    var adminId = UserIdByEmail("admin@example.com");
    var userId  = UserIdByEmail("user@example.com");

    // Chuẩn bị target IDs dùng slug đã seed bên trên
    var tour1Id = TourId("tour-ba-dong-1-ngay");
    var tour2Id = TourId("tour-2n1d-bien-lang-chai");
    var place1Id = PlaceId("bai-bien-ba-dong");
    var rest1Id = RestaurantId("hai-san-nang-gio");
    var acc1Id  = AccommodationId("blue-sea-resort");
    var art1Id  = ArticleId("cam-nang-di-ba-dong");

    var reviewsSeed = new (long UserId, ContentTarget TargetType, long TargetId, sbyte Rating, string? Title, string? Content)[]
    {
        (adminId, ContentTarget.Tour, tour1Id, 5, "Đáng tiền!", "Lịch trình hợp lý, ăn trưa ngon."),
        (userId,  ContentTarget.Tour, tour2Id, 4, "Ổn cho gia đình", "Nhịp độ vừa phải, trẻ con theo được."),
        (userId,  ContentTarget.Place, place1Id, 5, "Biển sạch", "Cát mịn, vắng người."),
        (adminId, ContentTarget.Restaurant, rest1Id, 4, "Hải sản tươi", "Giá ổn, view nhìn thẳng biển."),
        (userId,  ContentTarget.Accommodation, acc1Id, 4, "Resort đẹp", "Hồ bơi rộng, phòng sạch."),
        (adminId, ContentTarget.Article, art1Id, 5, "Bài viết hữu ích", "Thông tin đầy đủ, dễ áp dụng.")
    };

    foreach (var rv in reviewsSeed)
    {
        // idempotent: kiểm tra trùng theo (UserId, TargetType, TargetId, Title)
        bool exists = db.Reviews.Any(x =>
            x.UserId == rv.UserId &&
            x.TargetType == rv.TargetType &&
            x.TargetId == rv.TargetId &&
            x.Title == rv.Title);

        if (!exists)
        {
            db.Reviews.Add(new Review
            {
                UserId = rv.UserId,
                TargetType = rv.TargetType,
                TargetId = rv.TargetId,
                Rating = rv.Rating,
                Title = rv.Title,
                Content = rv.Content,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
    db.SaveChanges();

    // ---------- FAVORITES ----------
    var favoritesSeed = new (long UserId, ContentTarget TargetType, long TargetId)[]
    {
        (userId,  ContentTarget.Tour,  tour1Id),
        (userId,  ContentTarget.Place, place1Id),
        (userId,  ContentTarget.Article, art1Id),
        (adminId, ContentTarget.Restaurant, rest1Id),
        (adminId, ContentTarget.Accommodation, acc1Id),
    };

    foreach (var f in favoritesSeed)
    {
        bool exists = db.Favorites.Any(x =>
            x.UserId == f.UserId &&
            x.TargetType == f.TargetType &&
            x.TargetId == f.TargetId);

        if (!exists)
        {
            db.Favorites.Add(new Favorite
            {
                UserId = f.UserId,
                TargetType = f.TargetType,
                TargetId = f.TargetId,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
    db.SaveChanges();

    Log("Seeded Articles + galleries, Reviews, Favorites.");


}

app.Run();
