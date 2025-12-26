using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagement.API.Models.Domain
{
    public class SubTask
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // DatabaseGenerated tells EF Core to let the SQL Server handle the increment (1, 2, 3...)
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SubTaskId { get; set; }

        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }

        // Foreign Key back to Task
        public Guid TaskId { get; set; } 
        public TaskItem TaskItem { get; set; } = null!;

        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        public ICollection<SubTaskAssignment> SubTaskAssignments { get; set; } = new List<SubTaskAssignment>();
    }
}