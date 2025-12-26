using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using TaskManagement.API.Data;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

builder.Services.AddOpenApi();

builder.Services.AddDbContext<ProjectDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ProjectConnection"))
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader()
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Ensure the Uploads folder exists physically
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "Uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseHttpsRedirection();

// --- STATIC FILES CONFIG ---
// This allows React to access http://localhost:5017/Uploads/filename.jpg
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/Uploads"
});

app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

app.Run();