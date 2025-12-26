using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class attachmentrevised : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_SubTasks_SubTaskId",
                table: "Attachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Tasks_TaskItemId",
                table: "Attachments");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_TaskItemId",
                table: "Attachments");

            migrationBuilder.DropColumn(
                name: "TaskItemId",
                table: "Attachments");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_TaskId",
                table: "Attachments",
                column: "TaskId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_SubTasks_SubTaskId",
                table: "Attachments",
                column: "SubTaskId",
                principalTable: "SubTasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Tasks_TaskId",
                table: "Attachments",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_SubTasks_SubTaskId",
                table: "Attachments");

            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Tasks_TaskId",
                table: "Attachments");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_TaskId",
                table: "Attachments");

            migrationBuilder.AddColumn<Guid>(
                name: "TaskItemId",
                table: "Attachments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_TaskItemId",
                table: "Attachments",
                column: "TaskItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_SubTasks_SubTaskId",
                table: "Attachments",
                column: "SubTaskId",
                principalTable: "SubTasks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Tasks_TaskItemId",
                table: "Attachments",
                column: "TaskItemId",
                principalTable: "Tasks",
                principalColumn: "Id");
        }
    }
}
