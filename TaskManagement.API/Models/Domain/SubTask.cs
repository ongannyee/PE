using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagement.API.Models.Domain
{
    public class SubTask
    {
        // SubTask data
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SubTaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }

        // Foreign Key
        public Guid TaskId { get; set; } 
        public TaskItem TaskItem { get; set; } = null!;

        // Foreign key related
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        public ICollection<SubTaskAssignment> SubTaskAssignments { get; set; } = new List<SubTaskAssignment>();
    }
}