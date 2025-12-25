using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Models.Domain;

namespace TaskManagement.API.Data
{
    public class ProjectDBContext(DbContextOptions<ProjectDBContext> options) : DbContext(options)
    {
        // Primary Tables
        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<SubTask> SubTasks { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Attachment> Attachments { get; set; }

        // Association (Bridge) Tables
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<TaskAssignment> TaskAssignments { get; set; }
        public DbSet<SubTaskAssignment> SubTaskAssignments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- 1. CONFIGURATION FOR PROJECT ---
            modelBuilder.Entity<Project>(entity =>
            {
                entity.Property(p => p.ProjectName).HasMaxLength(150);
                // Auto-increment and Unique for ProjectId (int)
                entity.Property(p => p.ProjectId).ValueGeneratedOnAdd();
                entity.HasIndex(p => p.ProjectId).IsUnique();
            });

            // --- 2. CONFIGURATION FOR USER ---
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(u => u.UserId).ValueGeneratedOnAdd();
                entity.HasIndex(u => u.UserId).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique(); // Emails should also be unique
            });

            // --- 3. CONFIGURATION FOR TASKITEM ---
            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.Property(t => t.TaskId).ValueGeneratedOnAdd();
                entity.HasIndex(t => t.TaskId).IsUnique();
            });

            // --- 4. CONFIGURATION FOR SUBTASK ---
            modelBuilder.Entity<SubTask>(entity =>
            {
                entity.Property(s => s.SubTaskId).ValueGeneratedOnAdd();
                entity.HasIndex(s => s.SubTaskId).IsUnique();
            });

            // --- 5. CONFIGURATION FOR COMMENT ---
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.Property(c => c.CommentId).ValueGeneratedOnAdd();
                entity.HasIndex(c => c.CommentId).IsUnique();
            });

            // --- 6. CONFIGURATION FOR ATTACHMENT ---
            modelBuilder.Entity<Attachment>(entity =>
            {
                entity.Property(a => a.AttachmentId).ValueGeneratedOnAdd();
                entity.HasIndex(a => a.AttachmentId).IsUnique();
            });

            // --- 7. MANY-TO-MANY BRIDGE CONFIGURATIONS (Composite Keys) ---

            // Project <-> User
            modelBuilder.Entity<ProjectMember>()
                .HasKey(pm => new { pm.UserId, pm.ProjectId });

            // Task <-> User
            modelBuilder.Entity<TaskAssignment>()
                .HasKey(ta => new { ta.UserId, ta.TaskId });

            // SubTask <-> User
            modelBuilder.Entity<SubTaskAssignment>()
                .HasKey(sta => new { sta.UserId, sta.SubTaskId });
        }
    }
}