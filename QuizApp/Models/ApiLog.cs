public class ApiLog
{
    public int? Id { get; set; }
    public string UserId { get; set; }
    public string Path { get; set; }
    public string HttpMethod { get; set; }
    public string InputParameters { get; set; }
    public string Output { get; set; }
    public DateTime Timestamp { get; set; }
    public bool IsBefore { get; set; }
}