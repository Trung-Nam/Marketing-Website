namespace PromoteSeaTourism.DTOs
{
    // ===== CREATE =====
    public record CreateTourWithImagesDto(
        string Name,
        string Slug,
        string? Summary,
        string Description,
        decimal? PriceFrom,
        string? Itinerary,
        long CategoryId,
        bool IsPublished,
        // Media
        NewImageItem[]? Images,     // ảnh mới tạo cùng tour
        long[]? AttachMediaIds,     // gắn các media đã có sẵn
        long? CoverImageId          // đặt ảnh cover trong gallery (nếu đã attach/link)
    );

    // ===== UPDATE =====
    public record UpdateTourWithImagesDto(
        string Name,
        string Slug,
        string? Summary,
        string Description,
        decimal? PriceFrom,
        string? Itinerary,
        long CategoryId,
        bool IsPublished,
        // Media ops
        NewImageItem[]?   AddImages,       // thêm ảnh mới
        long[]?           AttachMediaIds,  // gắn media có sẵn
        long[]?           RemoveLinkIds,   // xoá link ảnh khỏi tour (không xoá media gốc)
        ReorderImageItem[]? Reorders,      // đổi Position các link ảnh
        long? CoverImageId                 // đặt ảnh cover trong gallery
    );
}
