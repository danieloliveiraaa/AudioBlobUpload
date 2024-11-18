using AudioTeste.Models;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace AudioTeste.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly BlobServiceClient _blobServiceClient;
        private const string nomeContainer = "audiofiles";
        
        public HomeController(IConfiguration configuration, ILogger<HomeController> logger)
        {
            var connectionString = configuration.GetConnectionString("AzureBlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost("api/audio/upload")]
        public async Task<IActionResult> UploadAudio ([FromForm] IFormFile audioFile)
        {
            //gerando um identificador aleatorio, evitando sobrescrever arquivos existentes
            var nomeAleatorio = $"{Guid.NewGuid()}_{Path.GetExtension(audioFile.FileName)}";

            //verifico se o arquivo foi enviado
            if (audioFile == null || audioFile.Length == 0) return BadRequest("Nenhum arquivo foi enviado.");

            //limitação de 5mb
            if (audioFile.Length > 5_000_000) return BadRequest("O arquivo está muito grande. Limite: 5 MB.");
            



            var containerClient = _blobServiceClient.GetBlobContainerClient(nomeContainer);
            await containerClient.CreateIfNotExistsAsync();
            var blobClient = containerClient.GetBlobClient(nomeAleatorio);

            using var stream = audioFile.OpenReadStream();
            await blobClient.UploadAsync(stream);
            
            return Ok (new { message = "Upload realizado com sucesso." });
        }
    }
}
