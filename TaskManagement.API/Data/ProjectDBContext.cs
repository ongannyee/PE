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
                entity.HasKey(p => p.Id); 
                entity.Property(p => p.ProjectName).HasMaxLength(150);
                entity.Property(p => p.ProjectId).ValueGeneratedOnAdd();
                entity.HasIndex(p => p.ProjectId).IsUnique();
                
                entity.Property(p => p.CreatedByUserId).IsRequired();

                entity.HasOne(p => p.Creator)
                      .WithMany(u => u.OwnedProjects) 
                      .HasForeignKey(p => p.CreatedByUserId)
                      .OnDelete(DeleteBehavior.Restrict); 
            });

            // --- 2. CONFIGURATION FOR USER ---
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id); 
                entity.Property(u => u.UserId).ValueGeneratedOnAdd();
                entity.HasIndex(u => u.UserId).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();

                entity.Property(u => u.Role)
                      .HasMaxLength(20)
                      .HasDefaultValue("User")
                      .IsRequired();
            });

            // --- 3. CONFIGURATION FOR TASKITEM ---
            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.HasKey(t => t.Id); 
                entity.Property(t => t.TaskId).ValueGeneratedOnAdd();
                entity.HasIndex(t => t.TaskId).IsUnique();
                
                entity.HasOne(t => t.Project)
                      .WithMany(p => p.Tasks)
                      .HasForeignKey(t => t.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // --- 4. CONFIGURATION FOR SUBTASK ---
            modelBuilder.Entity<SubTask>(entity =>
            {
                entity.HasKey(s => s.Id); 
                entity.Property(s => s.SubTaskId).ValueGeneratedOnAdd(); 
                entity.HasIndex(s => s.SubTaskId).IsUnique();

                entity.HasOne(s => s.TaskItem)
                      .WithMany(t => t.SubTasks)
                      .HasForeignKey(s => s.TaskId)
                      .OnDelete(DeleteBehavior.Cascade); 
            });

            // --- 5. CONFIGURATION FOR COMMENT ---
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.CommentId).ValueGeneratedOnAdd();
                entity.HasIndex(c => c.CommentId).IsUnique();

                entity.HasOne(c => c.TaskItem)
                    .WithMany(t => t.Comments) 
                    .HasForeignKey(c => c.TaskId)
                    .OnDelete(DeleteBehavior.Cascade); 

                entity.HasOne(c => c.User)
                    .WithMany(u => u.Comments) 
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.NoAction); 
            });

            // --- 6. ATTACHMENT CONFIG (UPDATED TO USE GUID FK) ---
            modelBuilder.Entity<Attachment>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.AttachmentId).ValueGeneratedOnAdd();
                entity.HasIndex(a => a.AttachmentId).IsUnique();

                // Relationship to Uploader (User) using Guid FK
                entity.HasOne(a => a.UploadedByUser)
                      .WithMany(u => u.Attachments) 
                      .HasForeignKey(a => a.UploadedByUserId)
                      .OnDelete(DeleteBehavior.Restrict); 

                entity.HasOne(a => a.TaskItem)
                      .WithMany(t => t.TaskAttachments)
                      .HasForeignKey(a => a.TaskId)
                      .OnDelete(DeleteBehavior.NoAction); 

                entity.HasOne(a => a.SubTask)
                      .WithMany(s => s.Attachments)
                      .HasForeignKey(a => a.SubTaskId)
                      .OnDelete(DeleteBehavior.Cascade); 
            });

            // --- 7. BRIDGE TABLES ---
            modelBuilder.Entity<ProjectMember>(entity =>
            {
                entity.HasKey(pm => new { pm.UserId, pm.ProjectId });
                entity.Property(pm => pm.ProjectRole).HasMaxLength(50).HasDefaultValue("Contributor");
                entity.HasOne(pm => pm.User).WithMany(u => u.ProjectMembers).HasForeignKey(pm => pm.UserId);
                entity.HasOne(pm => pm.Project).WithMany(p => p.ProjectMembers).HasForeignKey(pm => pm.ProjectId);
            });

            modelBuilder.Entity<TaskAssignment>(entity =>
            {
                entity.HasKey(ta => new { ta.UserId, ta.TaskId });
                entity.HasOne(ta => ta.User).WithMany(u => u.TaskAssignments).HasForeignKey(ta => ta.UserId);
                entity.HasOne(ta => ta.TaskItem).WithMany(t => t.TaskAssignments).HasForeignKey(ta => ta.TaskId);
            });

            modelBuilder.Entity<SubTaskAssignment>(entity =>
            {
                entity.HasKey(sta => new { sta.UserId, sta.SubTaskId });
                entity.HasOne(sta => sta.SubTask).WithMany(s => s.SubTaskAssignments).HasForeignKey(sta => sta.SubTaskId);
                entity.HasOne(sta => sta.User).WithMany(u => u.SubTaskAssignments).HasForeignKey(sta => sta.UserId);
            });
        }
    }
}