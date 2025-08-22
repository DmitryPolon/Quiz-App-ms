using Microsoft.EntityFrameworkCore;
using QuizApp.Models;
using System.Text.Json.Serialization;
using Serilog;
using Serilog.Sinks.MSSqlServer;
using System.Configuration;
using QuizApp.Repositories;
//using QuizApp.Data;

            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            Console.WriteLine($"Loaded connection string: {connectionString}");

            builder.Services.AddDbContext<MyDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddScoped<ApiLoggingFilter>(provider =>
            {
                var configuration = provider.GetRequiredService<IConfiguration>();
                var filterConnectionString = configuration.GetConnectionString("DefaultConnection");
                Console.WriteLine($"Filter connection string: {filterConnectionString}");
                return new ApiLoggingFilter(filterConnectionString);
            });
            builder.Services.AddControllers(options =>
            {
                options.Filters.AddService<ApiLoggingFilter>();
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddScoped<QuizAdminRepository>();
            builder.Services.AddScoped<QuizRepository>();
            builder.Services.AddScoped<UserRepository>();
            builder.Services.AddScoped<QuestionSequenceRepository>();

            var app = builder.Build();

            app.UseMiddleware<ErrorHandlingMiddleware>();
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuizApp API V1");
                c.RoutePrefix = "swagger";
            });

            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            Log.Logger = new LoggerConfiguration()
                .WriteTo.MSSqlServer(connectionString, sinkOptions: new MSSqlServerSinkOptions { TableName = "ErrorLogs" })
                .CreateLogger();

            app.Run();

            //static IHostBuilder CreateHostBuilder(string[] args) =>
            //    Host.CreateDefaultBuilder(args)
            //        .ConfigureWebHostDefaults(webBuilder =>
             //       {
             //           webBuilder.UseStartup<Startup>();
             //       });

