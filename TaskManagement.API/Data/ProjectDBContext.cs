using System.Diagnostics.Eventing.Reader;
using System.IO.Pipes;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Models.Domain;

namespace TaskManagement.API.Data
{
    public class ProjectDBContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<Project> Projects {get;set;}
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Project>()
                .Property(p => p.ProjectName)
                .HasMaxLength(150);
        }
    }
}