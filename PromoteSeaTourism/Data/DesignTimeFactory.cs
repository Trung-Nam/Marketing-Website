using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace PromoteSeaTourism.Data
{
    public class DesignTimeFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var cfg = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .Build();

            var cs = cfg.GetConnectionString("Default")!;
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseMySql(cs, ServerVersion.AutoDetect(cs), my =>
                {
                    my.EnableRetryOnFailure();
                })
                .Options;

            return new AppDbContext(options);
        }
    }
}
