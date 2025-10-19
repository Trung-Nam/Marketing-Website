using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using PromoteSeaTourism.DTOs;

namespace PromoteSeaTourism.Infrastructure.Swagger
{
    public class ExampleSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (schema is null) return;

            var t = context.Type;

            if (t == typeof(CreateCategoryDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Bãi biển"),
                    ["slug"] = new OpenApiString("beaches"),
                    ["type"] = new OpenApiString("place")
                };
                return;
            }

            if (t == typeof(UpdateCategoryDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Cẩm nang"),
                    ["slug"] = new OpenApiString("guides"),
                    ["type"] = new OpenApiString("article"),
                    ["isActive"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(CreatePlaceDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Bãi biển Ba Động"),
                    ["slug"] = new OpenApiString("bai-bien-ba-dong"),
                    ["summary"] = new OpenApiString("Bãi biển hoang sơ, cát mịn."),
                    ["content"] = new OpenApiString(null!),
                    ["address"] = new OpenApiString("Trà Vinh"),
                    ["province"] = new OpenApiString(null!),
                    ["district"] = new OpenApiString(null!),
                    ["ward"] = new OpenApiString(null!),
                    ["geoLat"] = new OpenApiNull(),
                    ["geoLng"] = new OpenApiNull(),
                    ["bestSeason"] = new OpenApiString("3–8"),
                    ["ticketInfo"] = new OpenApiString(null!),
                    ["openingHours"] = new OpenApiString(null!),
                    ["categoryId"] = new OpenApiLong(0),
                    ["coverImageId"] = new OpenApiNull(),
                    ["isPublished"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(UpdatePlaceDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Đồi cát vàng"),
                    ["slug"] = new OpenApiString("doi-cat-vang"),
                    ["summary"] = new OpenApiString("Điểm check-in hoàng hôn đẹp."),
                    ["content"] = new OpenApiString(null!),
                    ["address"] = new OpenApiString("Phan Thiết"),
                    ["province"] = new OpenApiString(null!),
                    ["district"] = new OpenApiString(null!),
                    ["ward"] = new OpenApiString(null!),
                    ["geoLat"] = new OpenApiNull(),
                    ["geoLng"] = new OpenApiNull(),
                    ["bestSeason"] = new OpenApiString("4–9"),
                    ["ticketInfo"] = new OpenApiString(null!),
                    ["openingHours"] = new OpenApiString(null!),
                    ["categoryId"] = new OpenApiLong(0),
                    ["coverImageId"] = new OpenApiNull(),
                    ["isPublished"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(CreateRestaurantDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Hải sản Nắng Gió"),
                    ["slug"] = new OpenApiString("hai-san-nang-gio"),
                    ["summary"] = new OpenApiString("Hải sản tươi, view biển."),
                    ["content"] = new OpenApiString("Menu đa dạng, đặc sản biển."),
                    ["address"] = new OpenApiString("Số 12 Đường Ven Biển"),
                    ["phone"] = new OpenApiString(null!),
                    ["website"] = new OpenApiString(null!),
                    ["priceRangeText"] = new OpenApiString("200k–500k"),
                    ["categoryId"] = new OpenApiLong(0),
                    ["coverImageId"] = new OpenApiNull(),
                    ["isPublished"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(UpdateRestaurantDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Cà phê Sóng"),
                    ["slug"] = new OpenApiString("ca-phe-song"),
                    ["summary"] = new OpenApiString("Cafe ven biển, chill."),
                    ["content"] = new OpenApiString("Menu nước đa dạng."),
                    ["address"] = new OpenApiString("Quảng trường Biển"),
                    ["phone"] = new OpenApiString(null!),
                    ["website"] = new OpenApiString(null!),
                    ["priceRangeText"] = new OpenApiString("35k–80k"),
                    ["categoryId"] = new OpenApiLong(0),
                    ["coverImageId"] = new OpenApiNull(),
                    ["isPublished"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(CreateAccommodationDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Blue Sea Resort"),
                    ["slug"] = new OpenApiString("blue-sea-resort"),
                    ["summary"] = new OpenApiString("Resort ven biển, hồ bơi vô cực."),
                    ["content"] = new OpenApiString("Phòng sạch, tiện nghi cơ bản."),
                    ["address"] = new OpenApiString("Khu du lịch Biển Xanh"),
                    ["phone"] = new OpenApiString(null!),
                    ["website"] = new OpenApiString(null!),
                    ["star"] = new OpenApiInteger(4),
                    ["minPrice"] = new OpenApiDouble(1200000),
                    ["maxPrice"] = new OpenApiDouble(3800000),
                    ["categoryId"] = new OpenApiLong(0),
                    ["coverImageId"] = new OpenApiNull(),
                    ["isPublished"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(UpdateAccommodationDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("An Nhiên Homestay"),
                    ["slug"] = new OpenApiString("an-nhien-homestay"),
                    ["summary"] = new OpenApiString("Homestay gần biển, decor mộc."),
                    ["content"] = new OpenApiString("Phòng ấm cúng, gần chợ."),
                    ["address"] = new OpenApiString("Hẻm 5 Đường Biển"),
                    ["phone"] = new OpenApiString(null!),
                    ["website"] = new OpenApiString(null!),
                    ["star"] = new OpenApiNull(),
                    ["minPrice"] = new OpenApiDouble(450000),
                    ["maxPrice"] = new OpenApiDouble(950000),
                    ["categoryId"] = new OpenApiLong(0),
                    ["coverImageId"] = new OpenApiNull(),
                    ["isPublished"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(NewImageItem))
            {
                schema.Example = new OpenApiObject
                {
                    ["url"] = new OpenApiString("https://picsum.photos/id/1018/1200/800"),
                    ["altText"] = new OpenApiString("Ảnh bãi biển"),
                    ["caption"] = new OpenApiString("Bãi biển hoàng hôn"),
                    ["position"] = new OpenApiInteger(0),
                    ["isCover"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(CreateArticleWithImagesDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["title"] = new OpenApiString("Cẩm nang đi Ba Động"),
                    ["slug"] = new OpenApiString("cam-nang-di-ba-dong"),
                    ["summary"] = new OpenApiString("Lịch trình, chi phí, lưu ý khi đi biển."),
                    ["content"] = new OpenApiString("Bài viết tổng hợp kinh nghiệm..."),
                    ["categoryId"] = new OpenApiLong(0),
                    ["isPublished"] = new OpenApiBoolean(true),
                    ["publishedAt"] = new OpenApiString(DateTime.UtcNow.ToString("o")),
                    ["images"] = new OpenApiArray
                    {
                        new OpenApiObject
                        {
                            ["url"] = new OpenApiString("https://picsum.photos/id/1015/1200/800"),
                            ["altText"] = new OpenApiString("Ảnh 1"),
                            ["caption"] = new OpenApiString("Bìa"),
                            ["position"] = new OpenApiInteger(0),
                            ["isCover"] = new OpenApiBoolean(true)
                        }
                    }
                };
                return;
            }

            if (t == typeof(UpdateArticleWithImagesDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["title"] = new OpenApiString("Gợi ý lịch trình 2N1Đ"),
                    ["slug"] = new OpenApiString("goi-y-lich-trinh-2n1d"),
                    ["summary"] = new OpenApiString("Lịch trình nhẹ nhàng cho gia đình."),
                    ["content"] = new OpenApiString("Ngày 1: ... Ngày 2: ..."),
                    // CategoryId theo DB là nullable, cho ví dụ null để rõ nghĩa
                    ["categoryId"] = new OpenApiNull(),
                    ["isPublished"] = new OpenApiBoolean(true),
                    // PublishedAt có thể null nếu chưa xuất bản
                    ["publishedAt"] = new OpenApiNull(),
                    // Thêm ảnh mới (tạo media và gắn link)
                    ["addImages"] = new OpenApiArray
                    {
                        new OpenApiObject
                        {
                            ["url"] = new OpenApiString("https://picsum.photos/id/1031/1200/800"),
                            ["altText"] = new OpenApiString("Ảnh bìa"),
                            ["caption"] = new OpenApiString("Cover"),
                            ["position"] = new OpenApiInteger(0),
                            ["isCover"] = new OpenApiBoolean(true)
                        }
                    },
                    // Gắn thêm media đã có sẵn (IDs của bảng images)
                    ["attachMediaIds"] = new OpenApiArray { new OpenApiLong(101), new OpenApiLong(102) },
                    // Gỡ các link ảnh hiện có (IDs của bảng image_links)
                    ["removeLinkIds"] = new OpenApiArray { new OpenApiLong(201) },
                    // Sắp xếp lại link ảnh
                    ["reorders"] = new OpenApiArray
                    {
                        new OpenApiObject { ["imageLinkId"] = new OpenApiLong(301), ["position"] = new OpenApiInteger(1) }
                    },
                    // Đặt ảnh đại diện = mediaId đã gắn
                    ["coverImageId"] = new OpenApiNull()
                };
                return;
            }

            if (t == typeof(CreatePlaceDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Bãi biển Ba Động"),
                    ["slug"] = new OpenApiString("bai-bien-ba-dong"),
                    ["summary"] = new OpenApiString("Bãi biển hoang sơ, cát mịn."),
                    ["content"] = new OpenApiString("Địa điểm du lịch nổi tiếng với bãi cát trắng mịn..."),
                    ["address"] = new OpenApiString("Trà Vinh"),
                    ["province"] = new OpenApiString("Trà Vinh"),
                    ["district"] = new OpenApiString("Duyên Hải"),
                    ["ward"] = new OpenApiString("Long Hữu"),
                    ["geoLat"] = new OpenApiDouble(9.9347),
                    ["geoLng"] = new OpenApiDouble(106.3453),
                    ["bestSeason"] = new OpenApiString("3–8"),
                    ["ticketInfo"] = new OpenApiString("Miễn phí"),
                    ["openingHours"] = new OpenApiString("24/7"),
                    ["categoryId"] = new OpenApiLong(0),
                    ["coverImageId"] = new OpenApiNull(),
                    ["isPublished"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(UpdatePlaceDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Đồi cát vàng"),
                    ["slug"] = new OpenApiString("doi-cat-vang"),
                    ["summary"] = new OpenApiString("Điểm check-in hoàng hôn đẹp."),
                    ["content"] = new OpenApiString("Đồi cát với view hoàng hôn tuyệt đẹp..."),
                    ["address"] = new OpenApiString("Phan Thiết"),
                    ["province"] = new OpenApiString("Bình Thuận"),
                    ["district"] = new OpenApiString("Hàm Thuận Nam"),
                    ["ward"] = new OpenApiString("Mũi Né"),
                    ["geoLat"] = new OpenApiDouble(10.9333),
                    ["geoLng"] = new OpenApiDouble(108.1000),
                    ["bestSeason"] = new OpenApiString("4–9"),
                    ["ticketInfo"] = new OpenApiString("50,000 VND"),
                    ["openingHours"] = new OpenApiString("6:00 - 18:00"),
                    ["categoryId"] = new OpenApiLong(0),
                    ["coverImageId"] = new OpenApiNull(),
                    ["isPublished"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(CreateImageDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["url"] = new OpenApiString("https://picsum.photos/id/1018/1200/800"),
                    ["altText"] = new OpenApiString("Bãi biển hoàng hôn"),
                    ["caption"] = new OpenApiString("Cảnh hoàng hôn tuyệt đẹp tại bãi biển")
                };
                return;
            }

            if (t == typeof(LinkImageDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["targetType"] = new OpenApiString("Article"),
                    ["targetId"] = new OpenApiLong(1),
                    ["position"] = new OpenApiInteger(0),
                    ["isCover"] = new OpenApiBoolean(true)
                };
                return;
            }

            if (t == typeof(CreateEventWithImagesDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["title"] = new OpenApiString("Lễ hội biển 2024"),
                    ["slug"] = new OpenApiString("le-hoi-bien-2024"),
                    ["summary"] = new OpenApiString("Lễ hội biển lớn nhất năm với nhiều hoạt động thú vị."),
                    ["content"] = new OpenApiString("Chương trình lễ hội bao gồm..."),
                    ["startTime"] = new OpenApiString("2024-12-25T08:00:00Z"),
                    ["endTime"] = new OpenApiString("2024-12-25T22:00:00Z"),
                    ["address"] = new OpenApiString("Bãi biển Mũi Né"),
                    ["priceInfo"] = new OpenApiString("Miễn phí tham gia"),
                    ["categoryId"] = new OpenApiLong(1),
                    ["placeId"] = new OpenApiLong(1),
                    ["isPublished"] = new OpenApiBoolean(true),
                    ["images"] = new OpenApiArray
                    {
                        new OpenApiObject
                        {
                            ["url"] = new OpenApiString("https://picsum.photos/id/1015/1200/800"),
                            ["altText"] = new OpenApiString("Ảnh lễ hội"),
                            ["caption"] = new OpenApiString("Bìa lễ hội"),
                            ["position"] = new OpenApiInteger(0),
                            ["isCover"] = new OpenApiBoolean(true)
                        }
                    },
                    ["coverImageId"] = new OpenApiNull()
                };
                return;
            }

            if (t == typeof(UpdateEventWithImagesDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["title"] = new OpenApiString("Lễ hội biển 2024 - Cập nhật"),
                    ["slug"] = new OpenApiString("le-hoi-bien-2024-updated"),
                    ["summary"] = new OpenApiString("Lễ hội biển lớn nhất năm với nhiều hoạt động thú vị - Phiên bản cập nhật."),
                    ["content"] = new OpenApiString("Chương trình lễ hội bao gồm nhiều hoạt động mới..."),
                    ["startTime"] = new OpenApiString("2024-12-25T09:00:00Z"),
                    ["endTime"] = new OpenApiString("2024-12-25T23:00:00Z"),
                    ["address"] = new OpenApiString("Bãi biển Mũi Né - Khu vực mở rộng"),
                    ["priceInfo"] = new OpenApiString("Miễn phí tham gia, có phí cho một số hoạt động đặc biệt"),
                    ["categoryId"] = new OpenApiLong(1),
                    ["placeId"] = new OpenApiLong(1),
                    ["isPublished"] = new OpenApiBoolean(true),
                    // Thêm ảnh mới (tạo media và gắn link)
                    ["addImages"] = new OpenApiArray
                    {
                        new OpenApiObject
                        {
                            ["url"] = new OpenApiString("https://picsum.photos/id/1031/1200/800"),
                            ["altText"] = new OpenApiString("Ảnh lễ hội mới"),
                            ["caption"] = new OpenApiString("Hoạt động mới"),
                            ["position"] = new OpenApiInteger(0),
                            ["isCover"] = new OpenApiBoolean(true)
                        }
                    },
                    // Gắn thêm media đã có sẵn (IDs của bảng images)
                    ["attachMediaIds"] = new OpenApiArray { new OpenApiLong(101), new OpenApiLong(102) },
                    // Gỡ các link ảnh hiện có (IDs của bảng image_links)
                    ["removeLinkIds"] = new OpenApiArray { new OpenApiLong(201) },
                    // Sắp xếp lại link ảnh
                    ["reorders"] = new OpenApiArray
                    {
                        new OpenApiObject { ["imageLinkId"] = new OpenApiLong(301), ["position"] = new OpenApiInteger(1) }
                    },
                    // Đặt ảnh đại diện = mediaId đã gắn
                    ["coverImageId"] = new OpenApiLong(101)
                };
                return;
            }

            if (t == typeof(UpdateTourWithImagesDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Tour biển 3 ngày 2 đêm - Cập nhật"),
                    ["slug"] = new OpenApiString("tour-bien-3-ngay-2-dem-updated"),
                    ["summary"] = new OpenApiString("Tour biển 3 ngày 2 đêm với nhiều hoạt động thú vị - Phiên bản cập nhật."),
                    ["description"] = new OpenApiString("Chương trình tour bao gồm nhiều hoạt động mới..."),
                    ["priceFrom"] = new OpenApiDouble(2500000),
                    ["itinerary"] = new OpenApiString("Ngày 1: Khởi hành... Ngày 2: Tham quan... Ngày 3: Trở về..."),
                    ["categoryId"] = new OpenApiLong(1),
                    ["isPublished"] = new OpenApiBoolean(true),
                    // Thêm ảnh mới (tạo media và gắn link)
                    ["addImages"] = new OpenApiArray
                    {
                        new OpenApiObject
                        {
                            ["url"] = new OpenApiString("https://picsum.photos/id/1031/1200/800"),
                            ["altText"] = new OpenApiString("Ảnh tour mới"),
                            ["caption"] = new OpenApiString("Hoạt động mới"),
                            ["position"] = new OpenApiInteger(0),
                            ["isCover"] = new OpenApiBoolean(true)
                        }
                    },
                    // Gắn thêm media đã có sẵn (IDs của bảng images)
                    ["attachMediaIds"] = new OpenApiArray { new OpenApiLong(101), new OpenApiLong(102) },
                    // Gỡ các link ảnh hiện có (IDs của bảng image_links)
                    ["removeLinkIds"] = new OpenApiArray { new OpenApiLong(201) },
                    // Sắp xếp lại link ảnh
                    ["reorders"] = new OpenApiArray
                    {
                        new OpenApiObject { ["imageLinkId"] = new OpenApiLong(301), ["position"] = new OpenApiInteger(1) }
                    },
                    // Đặt ảnh đại diện = mediaId đã gắn
                    ["coverImageId"] = new OpenApiLong(101)
                };
                return;
            }

            // === FAVORITE DTOs ===
            if (t == typeof(UpsertFavoriteDto))
            {
                schema.Example = new OpenApiObject
                {
                    ["targetType"] = new OpenApiString("Article"),
                    ["targetId"] = new OpenApiLong(1)
                };
                return;
            }
        }
    }
}


