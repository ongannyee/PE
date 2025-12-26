using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class SubTaskRevised : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SubTasks_Tasks_TaskItemId",
                table: "SubTasks");

            migrationBuilder.DropIndex(
                name: "IX_SubTasks_TaskItemId",
                table: "SubTasks");

            migrationBuilder.DropColumn(
                name: "TaskItemId",
                table: "SubTasks");

            migrationBuilder.CreateIndex(
                name: "IX_SubTasks_TaskId",
                table: "SubTasks",
                column: "TaskId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubTasks_Tasks_TaskId",
                table: "SubTasks",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SubTasks_Tasks_TaskId",
                table: "SubTasks");

            migrationBuilder.DropIndex(
                name: "IX_SubTasks_TaskId",
                table: "SubTasks");

            migrationBuilder.AddColumn<Guid>(
                name: "TaskItemId",
                table: "SubTasks",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_SubTasks_TaskItemId",
                table: "SubTasks",
                column: "TaskItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubTasks_Tasks_TaskItemId",
                table: "SubTasks",
                column: "TaskItemId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
