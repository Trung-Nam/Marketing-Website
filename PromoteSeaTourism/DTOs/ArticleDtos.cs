using System.ComponentModel.DataAnnotations;

namespace PromoteSeaTourism.DTOs
{
    // Ảnh mới gửi kèm khi create/update
    public record NewImageItem(
        [Required, Url] string Url,
        string? AltText,
        string? Caption,
        int Position = 0,
        bool IsCover = false
    );

    // Create Article + ảnh (một bước)
    public record CreateArticleWithImagesDto(
        [Required] string Title,
        [Required] string Slug,
        string? Summary,
        string? Content,
        long? CategoryId,
        bool IsPublished,
        DateTime? PublishedAt,
        // danh sách ảnh mới sẽ được tạo & gắn vào bài
        NewImageItem[]? Images
    );

    // Update Article + ảnh (một bước, đủ case phổ biến)
    public record UpdateArticleWithImagesDto(
        [Required] string Title,
        [Required] string Slug,
        string? Summary,
        string? Content,
        long? CategoryId,
        bool IsPublished,
        DateTime? PublishedAt,

        // 1) Thêm ảnh mới (tạo Media mới + gắn link)
        NewImageItem[]? AddImages,

        // 2) Gắn thêm ảnh đã tồn tại (media đã có sẵn trong hệ thống)
        long[]? AttachMediaIds,

        // 3) Gỡ các liên kết ảnh hiện có (truyền id của bảng image_links)
        long[]? RemoveLinkIds,

        // 4) Sắp xếp lại ảnh hiện có
        ReorderImageItem[]? Reorders,

        // 5) Đặt ảnh đại diện (cover) = mediaId đã có hoặc mới tạo ở bước (1)/(2)
        long? CoverImageId
    );

    public record ReorderImageItem(long ImageLinkId, int Position);
}
