namespace PromoteSeaTourism.DTOs
{

    public record ApiResponse<T>(
        int Code,
        string Message,
        T? Data
    );


    public record PagedResponse<T>(
        int Code,
        string Message,
        int Total,
        int Page,
        int PageSize,
        IEnumerable<T> Data
    );
}
