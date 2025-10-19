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
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1507525428034-34cf961d30ab?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1493558103817-992924bce12a?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1526481280698-8fcc13fd6a5f?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1503264116251-35a269479413?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&fit=crop",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop",
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
    var placesSeed = new (string Name, string Slug, string? Summary, string? Address, string CatSlug, string CoverUrl, string Content)[]
    {
        ("Bãi biển Ba Động",  "bai-bien-ba-dong",  "Bãi biển hoang sơ, cát mịn trải dài với rặng phi lao xanh mát.",     "Trà Vinh",  "beaches",         sampleImageUrls[0],
            "Bãi biển Ba Động nổi tiếng với không gian yên bình, làn nước trong xanh và bãi cát mịn. Bạn có thể tắm biển, đi dạo trên bờ cát lúc bình minh, trải nghiệm ẩm thực hải sản địa phương và check-in tại các điểm nhìn hướng ra đại dương. Khu vực xung quanh có nhiều quán nhỏ bán hải sản tươi sống với mức giá dễ chịu."),
        ("Đồi cát vàng",      "doi-cat-vang",      "Địa điểm ngắm hoàng hôn, chụp ảnh sống động với nền cát vàng.",     "Phan Thiết","view-check-in",   sampleImageUrls[15],
            "Đồi cát vàng là địa danh được yêu thích bởi vẻ đẹp mênh mông của sa mạc cát nằm sát biển. Màu cát thay đổi tùy thời điểm trong ngày, đặc biệt rực rỡ vào buổi chiều muộn khi ánh nắng vàng óng phản chiếu trên những đụn cát uốn lượn. Du khách có thể thử trượt cát bằng ván trượt, chụp hình với những góc ảnh đẹp mắt, hoặc ngắm toàn cảnh biển – đồi cát từ trên cao. Khu vực này có nhiều điểm check-in nổi tiếng với view 360 độ, phù hợp cho các cặp đôi chụp ảnh cưới hoặc du khách yêu thích nhiếp ảnh. Ngoài ra còn có dịch vụ cưỡi lạc đà, xe jeep tour và các hoạt động thể thao trên cát. Thời điểm đẹp nhất để tham quan là sáng sớm hoặc chiều muộn để tránh nắng gắt và có ánh sáng đẹp nhất cho chụp ảnh."),
        ("Bảo tàng Biển",     "bao-tang-bien",     "Không gian trưng bày văn hóa, sinh vật biển và nghề biển truyền thống.",       "Nha Trang", "museums",         sampleImageUrls[2],
            "Bảo tàng Biển giới thiệu lịch sử hình thành của làng chài, công cụ đánh bắt, tàu thuyền, trang phục ngư dân cùng nhiều mẫu sinh vật biển được gìn giữ. Đây là điểm đến cho gia đình và nhóm bạn muốn tìm hiểu văn hóa bản địa và lịch sử vùng ven biển."),
        ("Công viên Sinh thái Biển",     "cong-vien-sinh-thai-bien",     "Khuôn viên xanh mát với đường mòn dạo biển và khu bảo tồn thực vật.",       "Quy Nhơn", "parks-nature",  sampleImageUrls[3],
            "Công viên sinh thái ven biển là nơi thích hợp cho hoạt động đi bộ, picnic và giáo dục môi trường. Du khách có thể tham gia tour trải nghiệm tìm hiểu hệ sinh thái biển, quan sát thảm thực vật ven bờ và các chương trình thiện nguyện bảo vệ bờ biển."),
        ("Chợ hải sản Bình Minh",     "cho-hai-san-binh-minh",     "Khu chợ sôi động mỗi sớm, hải sản tươi và nhiều món ăn địa phương.",       "Đà Nẵng", "markets",         sampleImageUrls[4],
            "Chợ hải sản hoạt động từ rạng sáng, nơi người dân và du khách có thể mua hải sản tươi vừa cập bến. Bạn có thể chọn nguyên liệu rồi nhờ các quán xung quanh chế biến theo khẩu vị. Không khí nhộn nhịp, giá cả rõ ràng và nhiều món đặc sản địa phương.")
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
            Content = p.Content,
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
    var restaurantsSeed = new (string Name, string Slug, string? Summary, string? Address, string? Price, string CatSlug, string CoverUrl, string Content)[]
    {
        ("Hải sản Nắng Gió", "hai-san-nang-gio", "Hải sản tươi theo mùa, phục vụ nhanh, chỗ ngồi sát biển.", "Số 12 Đường Ven Biển", "200k–500k", "seafood", sampleImageUrls[16],
            "Nhà hàng nổi tiếng với các món hải sản địa phương được chế biến tươi sống: tôm hùm, cua gạch, mực trứng, cá mú, ốc hương và nhiều loại cá biển đặc sản. Không gian mở với view biển tuyệt đẹp, gió biển mát mẻ và phục vụ thân thiện, chuyên nghiệp. Có khu vực riêng cho gia đình và nhóm bạn với bàn tròn lớn, nhận đặt tiệc sinh nhật, liên hoan công ty hay tiệc cưới nhỏ. Menu đa dạng từ các món nướng than hoa, hấp, chiên đến các món lẩu hải sản. Đặc biệt có khu vực chọn hải sản sống tại bể để đảm bảo độ tươi ngon. Nhà hàng cũng phục vụ các món ăn kèm như cơm trắng, bánh mì, rau xào và nước chấm đặc biệt. Có dịch vụ giao hàng tận nơi cho khách lưu trú tại resort gần đó. Thời gian phục vụ từ 11h sáng đến 10h tối, đặc biệt đông khách vào cuối tuần nên nên đặt bàn trước."),
        ("Cà phê Sóng",      "ca-phe-song",      "Không gian mở nhìn ra biển, thức uống đa dạng, nhạc chill.",    "Quảng trường Biển",     "35k–80k",  "cafes",   sampleImageUrls[15],
            "Quán cà phê được thiết kế theo phong cách tối giản với không gian mở, trang trí bằng vật liệu tự nhiên như gỗ, tre và đá. Ngoài cà phê rang xay thủ công, quán có nhiều loại trà trái cây tươi, sinh tố, bánh homemade và góc sách nhỏ với nhiều đầu sách hay. Buổi tối có chương trình acoustic nhẹ nhàng với các nghệ sĩ địa phương. Không gian được thiết kế để tối đa hóa view biển, có nhiều góc ngồi khác nhau từ sofa êm ái đến bàn cao cho nhóm bạn. Quán cũng phục vụ các món ăn nhẹ như sandwich, salad và pizza. Có khu vực riêng cho các cuộc họp nhỏ và không gian làm việc với wifi miễn phí. Thời điểm đẹp nhất để ghé thăm là sáng sớm để ngắm bình minh hoặc chiều muộn để thưởng thức hoàng hôn cùng ly cà phê nóng."),
        ("Bếp Làng Chài",      "bep-lang-chai",      "Quán ăn gia đình, món truyền thống vùng biển.",    "Ngõ 9 Làng Chài",     "80k–180k",  "local-food",   sampleImageUrls[7],
            "Không gian ấm cúng, phù hợp nhóm nhỏ. Món ăn đặc trưng như cá kho tộ, canh chua cá, mực nướng than hoa. Giá cả phải chăng, phục vụ ân cần."),
        ("Hải sản Hoa Biển",      "hai-san-hoa-bien",      "Hải sản sống chọn tại bể, chế biến theo yêu cầu.",    "Kè ven biển",     "250k–700k",  "seafood",   sampleImageUrls[8],
            "Điểm nhấn là hải sản sống: tôm mũ ni, cá mú, cua gạch. Nhà hàng có khu vực nướng tại chỗ, đảm bảo giữ trọn vị ngọt tự nhiên."),
        ("Cafe Bình Minh",      "cafe-binh-minh",      "Ngắm bình minh tuyệt đẹp cùng ly cà phê nóng.",    "Công viên ven biển",     "35k–60k",  "cafes",   sampleImageUrls[9],
            "Nhiều góc chụp hình đẹp, phù hợp cặp đôi và du khách trẻ. Có bán mang đi và nhận đặt chỗ cho đoàn tour sáng sớm.")
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
            Content = r.Content,
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
    var accSeed = new (string Name, string Slug, string? Summary, string? Address, sbyte? Star, decimal? Min, decimal? Max, string CatSlug, string CoverUrl, string Content)[]
    {
        ("Blue Sea Resort", "blue-sea-resort", "Resort ven biển với hồ bơi vô cực và khu vườn nhiệt đới.", "Khu du lịch Biển Xanh", 4, 1200000, 3800000, "hotels",    sampleImageUrls[10],
            "Phòng rộng, hướng vườn hoặc hướng biển, có bữa sáng buffet. Dịch vụ spa, xe đưa đón sân bay và tour trải nghiệm địa phương."),
        ("An Nhiên Homestay", "an-nhien-homestay", "Homestay gần biển, thiết kế mộc mạc với nhiều góc sống ảo.", "Hẻm 5 Đường Biển",     null, 450000,  950000,  "homestays", sampleImageUrls[11],
            "Chủ nhà thân thiện, cung cấp xe đạp miễn phí, hướng dẫn quán ăn địa phương. Phù hợp cặp đôi hoặc gia đình nhỏ."),
        ("Sóng Biển Hotel", "song-bien-hotel", "Khách sạn gần bãi tắm chính, tiện di chuyển.", "Số 3 Trục Biển", 3, 650000, 1600000, "hotels", sampleImageUrls[12],
            "Phòng sạch, nhân viên nhiệt tình. Có dịch vụ thuê xe máy và đặt tour đảo."),
        ("Ngọn Hải Đăng Villa", "ngon-hai-dang-villa", "Villa riêng tư, hồ bơi mini, bếp đầy đủ.", "Khu nghỉ dưỡng Phía Nam", null, 1800000, 3800000, "hotels", sampleImageUrls[13],
            "Phù hợp nhóm bạn 6-10 người, có khu nướng BBQ, sân vườn rộng, chỗ đậu xe riêng."),
        ("Nhà Nghỉ Bờ Cát", "nha-nghi-bo-cat", "Nhà nghỉ giá tốt, gần chợ hải sản.", "Chợ mới ven biển", null, 250000, 600000, "homestays", sampleImageUrls[14],
            "Phòng gọn gàng, an ninh tốt, thích hợp đi công tác hoặc du lịch tiết kiệm.")
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
            Content = a.Content,
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

    var eventsSeed = new (string Title, string Slug, string? Summary, string? Address, DateTime Start, DateTime? End, string CatSlug, string CoverUrl, string Content, string? Price)[]
    {
        ("Lễ hội Biển 2025", "le-hoi-bien-2025", "Sự kiện âm nhạc, ẩm thực và trình diễn văn hóa biển kéo dài 2 ngày.", baiBien.Address, DateTime.UtcNow.AddDays(20), DateTime.UtcNow.AddDays(22), "festivals", sampleImageUrls[2],
            "Lễ hội quy tụ các nghệ sĩ địa phương, gian hàng ẩm thực, trò chơi dân gian và hoạt động bảo vệ môi trường biển.", "Miễn phí"),
        ("Giải chạy ven biển", "giai-chay-ven-bien", "Giải chạy 5km/10km/21km dọc bờ biển vào sáng sớm.", baiBien.Address, DateTime.UtcNow.AddDays(35), DateTime.UtcNow.AddDays(35).AddHours(6), "sports", sampleImageUrls[0],
            "Đường chạy bằng phẳng, nhìn thẳng ra biển. Có tiếp nước, y tế và phần thưởng cho top 3.", "300,000đ"),
        ("Lễ hội hải sản địa phương", "le-hoi-hai-san-dia-phuong", "Tuần lễ hải sản với nhiều món đặc trưng từ ngư dân.", baiBien.Address, DateTime.UtcNow.AddDays(10), DateTime.UtcNow.AddDays(15), "fairs", sampleImageUrls[16],
            "Lễ hội hải sản địa phương là sự kiện thường niên quy tụ hàng chục gian hàng do ngư dân và nhà hàng địa phương tham gia. Du khách có thể thưởng thức các món hải sản tươi sống vừa cập bến như tôm hùm, cua gạch, mực trứng, cá mú, ốc hương và nhiều loại cá biển đặc sản. Các gian hàng được trang trí theo phong cách làng chài truyền thống với thuyền thúng, lưới cá và dụng cụ đánh bắt. Có lớp học nấu ăn nhanh cho du khách với các đầu bếp địa phương, hướng dẫn cách chế biến hải sản giữ trọn vị ngọt tự nhiên. Ngoài ra còn có các hoạt động văn hóa như múa lân, hát bội, trình diễn nghề đan lưới và thi nấu ăn giữa các làng chài. Trẻ em có thể tham gia các trò chơi dân gian và học cách làm đồ thủ công từ vỏ sò, vỏ ốc. Lễ hội cũng có chương trình bảo vệ môi trường biển với các hoạt động dọn rác bờ biển và tuyên truyền về tầm quan trọng của việc bảo tồn hệ sinh thái biển.", "Miễn phí"),
        ("Đêm nhạc Acoustic Biển", "dem-nhac-acoustic-bien", "Đêm nhạc nhẹ nhàng trên bãi biển, số lượng chỗ ngồi có hạn.", baiBien.Address, DateTime.UtcNow.AddDays(12), DateTime.UtcNow.AddDays(12).AddHours(3), "music", sampleImageUrls[7],
            "Chương trình âm nhạc ngoài trời, phục vụ cà phê và nước trái cây. Đặt chỗ trước để có vị trí đẹp.", "120,000đ"),
        ("Giải lướt ván mở rộng", "giai-luot-van-mo-rong", "Sự kiện thể thao trên sóng biển với nhiều vận động viên tham gia.", baiBien.Address, DateTime.UtcNow.AddDays(50), DateTime.UtcNow.AddDays(52), "sports", sampleImageUrls[8],
            "Các hạng mục thi đấu dành cho người mới và chuyên nghiệp. Có khu vực khán giả an toàn và hướng dẫn trải nghiệm cho người mới.", "Miễn phí")
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
            Content = ev.Content,
            PlaceId = baiBien.Id,
            Address = ev.Address,
            StartTime = ev.Start,
            EndTime = ev.End,
            PriceInfo = ev.Price,
            CoverImageId = imageIdByUrl[ev.CoverUrl],
            CategoryId = CatId(ev.CatSlug),
            IsPublished = true,
            CreatedAt = DateTime.UtcNow
        });
    }
    db.SaveChanges();

    // ---------- TOURS ----------
    var toursSeed = new (string Name, string Slug, string? Summary, string Description, decimal? PriceFrom, string? Itinerary, string CatSlug)[]
    {
        ("Tour Ba Động 1 ngày", "tour-ba-dong-1-ngay", "Khởi hành sáng – về chiều, lịch trình linh hoạt cho mọi độ tuổi.", 
            "Lịch trình đưa bạn khám phá bãi biển Ba Động, trải nghiệm ẩm thực hải sản địa phương, check-in tại các điểm view đẹp và tham gia các hoạt động trên biển.", 650000,
            "07:30 đón khách • 09:30 tắm biển • 12:00 ăn trưa • 15:00 quay về.", "day-trips"),

        ("Tour 2N1Đ Biển & Làng chài", "tour-2n1d-bien-lang-chai", "Lịch trình nhẹ nhàng, phù hợp gia đình và nhóm bạn.",
            "Ngày 1 khám phá biển, làng chài và cafe hoàng hôn; Ngày 2 dạo chợ hải sản và tham quan bảo tàng biển, thưởng thức đặc sản.", 1850000,
            "Ngày 1: 08:00 xuất phát • 10:00 biển • 16:30 cafe; Ngày 2: 07:00 chợ hải sản • 09:30 bảo tàng.", "two-three-days"),

        ("Tour Phiêu lưu ven biển", "tour-phieu-luu-ven-bien", "Hành trình trekking nhẹ, chèo SUP và cắm trại qua đêm.",
            "Kinh nghiệm phiêu lưu an toàn cùng HLV, hoạt động thể thao biển vui nhộn phù hợp người mới lẫn người có kinh nghiệm.", 2150000,
            "Ngày 1: Trekking nhẹ • SUP lúc chiều • Lửa trại; Ngày 2: Ngắm bình minh & vệ sinh bờ biển.", "adventure"),

        ("Tour Gia đình khám phá biển", "tour-gia-dinh-kham-pha-bien", "Hoạt động nhẹ nhàng cho gia đình có trẻ nhỏ.",
            "Bao gồm dịch vụ xe đưa đón, bữa trưa hải sản và hướng dẫn viên thân thiện. Có trò chơi cát cho trẻ em.", 1450000,
            "08:00 xuất phát • 10:00 tắm biển • 12:00 ăn trưa • 14:00 trò chơi gia đình.", "family"),

        ("Tour Ẩm thực ven biển", "tour-am-thuc-ven-bien", "Tập trung trải nghiệm ẩm thực địa phương và chợ hải sản.",
            "Tham quan chợ sáng, học nấu ăn nhanh với đầu bếp địa phương, thưởng thức hải sản tươi sống vừa cập bến.", 980000,
            "07:00 chợ hải sản • 10:00 tham quan • 12:00 lớp nấu ăn • 15:00 cafe.", "day-trips"),
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

    // Note: Gallery supported for Article/Restaurant/Accommodation/Tour/Event per current ImageOwner enum.

    // Gắn ảnh cho Restaurants
    foreach (var r in db.Restaurants.Where(x => restaurantsSeed.Select(s => s.Slug).Contains(x.Slug)).ToList())
        EnsureGallery(ImageOwner.Restaurant, r.Id, sampleImageUrls[5], sampleImageUrls[6]);

    // Gắn ảnh cho Accommodations
    foreach (var a in db.Accommodations.Where(x => accSeed.Select(s => s.Slug).Contains(x.Slug)).ToList())
        EnsureGallery(ImageOwner.Accommodation, a.Id, sampleImageUrls[10], sampleImageUrls[11]);

    // Gắn ảnh cho Tours
    foreach (var t in db.Tours.Where(x => toursSeed.Select(s => s.Slug).Contains(x.Slug)).ToList())
        EnsureGallery(ImageOwner.Tour, t.Id, sampleImageUrls[0], sampleImageUrls[2]);

    // Gắn ảnh cho Events
    foreach (var e2 in db.Events.Where(x => eventsSeed.Select(s => s.Slug).Contains(x.Slug)).ToList())
        EnsureGallery(ImageOwner.Event, e2.Id, sampleImageUrls[7], sampleImageUrls[8]);

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
            "Lịch trình, chi phí, lưu ý khi đi biển Ba Động với nhiều gợi ý thực tế.", 
            "Bài viết tổng hợp kinh nghiệm di chuyển, chọn thời điểm đẹp, quán ăn ngon, nơi ở phù hợp và các mẹo nhỏ để chuyến đi hiệu quả.",
            "guides", sampleImageUrls[0], true, DateTime.UtcNow.AddDays(-10)),

        ("Gợi ý lịch trình 2N1Đ", "goi-y-lich-trinh-2n1d",
            "Lịch trình nhẹ nhàng cho gia đình có trẻ nhỏ, kết hợp tham quan – ẩm thực – nghỉ dưỡng.",
            "Ngày 1: Biển – làng chài – cafe hoàng hôn; Ngày 2: chợ hải sản – bảo tàng biển. Gợi ý chi phí, thời gian hợp lý.",
            "suggested-itineraries", sampleImageUrls[2], true, DateTime.UtcNow.AddDays(-7)),

        ("Mẹo săn hải sản tươi", "meo-san-hai-san-tuoi",
            "Cách chọn hải sản tươi ngon tại chợ địa phương, tránh bị hớ giá.",
            "Nên đi chợ sớm, hỏi giá trước, chọn quầy uy tín, cách phân biệt tôm cá tươi theo màu mắt, mang, độ đàn hồi.",
            "tips", sampleImageUrls[3], true, DateTime.UtcNow.AddDays(-3)),

        ("Check-list đồ biển cần mang", "checklist-do-bien",
            "Danh sách đồ dùng cần thiết khi đi biển cho gia đình.",
            "Mũ nón, kem chống nắng, kính râm, túi chống nước, dép đi biển, thuốc say xe, bộ sơ cứu, đồ cho trẻ nhỏ...",
            "guides", sampleImageUrls[4], true, DateTime.UtcNow.AddDays(-2)),

        ("Top quán cafe view biển", "top-cafe-view-bien",
            "Tổng hợp 5 quán cafe có view biển đẹp, đồ uống ổn.",
            "Khám phá những quán cafe ven biển với không gian mở, view đẹp và đồ uống chất lượng. Mỗi quán có phong cách riêng từ tối giản đến vintage, phù hợp cho các buổi hẹn hò, làm việc hay thư giãn. Gợi ý thời điểm ghé thăm tốt nhất là sáng sớm để ngắm bình minh hoặc chiều muộn để thưởng thức hoàng hôn. Các món nên thử bao gồm cà phê phin truyền thống, cà phê sữa đá, trà đào cam sả, sinh tố trái cây tươi và các loại bánh homemade. Hướng dẫn chi tiết cách di chuyển giữa các quán trong ngày, bao gồm phương tiện công cộng, taxi và thuê xe máy. Mỗi quán có đặc điểm riêng về không gian, giá cả và dịch vụ để bạn lựa chọn phù hợp với nhu cầu và ngân sách.",
            "news", sampleImageUrls[17], true, DateTime.UtcNow.AddDays(-1)),
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
        EnsureGallery(ImageOwner.Article, art.Id, sampleImageUrls[1], sampleImageUrls[9]);

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
