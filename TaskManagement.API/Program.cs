using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using TaskManagement.API.Data;
using System.IO;
using Microsoft.AspNetCore.Authentication.JwtBearer; // <--- NEW IMPORT
using Microsoft.IdentityModel.Tokens;               // <--- NEW IMPORT
using System.Text;                                  // <--- NEW IMPORT

var builder = WebApplication.CreateBuilder(args);

// ... (Your CORS setup remains here) ...
builder.Services.AddCors(options => { /* ... */ });

// 1. ADD JWT AUTHENTICATION SERVICE
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});
// ------------------------------------

builder.Services.AddControllers()
    .AddNewtonsoftJson(options => {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

builder.Services.AddOpenApi();

builder.Services.AddDbContext<ProjectDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ProjectConnection"))
);

// ... (Your second CORS setup) ...

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// ... (Static Files config) ...

app.UseHttpsRedirection();
app.UseStaticFiles(/*...*/);

app.UseCors("AllowAll"); // Simplified to use one policy for now

// 2. ENABLE AUTHENTICATION (Must be before Authorization)
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();
app.Run();