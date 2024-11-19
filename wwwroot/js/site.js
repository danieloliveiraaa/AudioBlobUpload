let gravadorAudio;
let mp3Encoder;
let audioPartes = [];
let mp3Data = [];
let audioContexto;
let processor;

$('#startButton').on('click', async function () {
    alert("Gravação iniciada");

    //peço permissão ao usuário para acessar o microfone, caso o usuário aceite, ela retorna um stream de áudio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    //MediaRecorder gravando e 'stream', seria o audio capturado
    gravadorAudio = new MediaRecorder(stream);

    // Crio um contexto de áudio para trabalhar com o Stream
    audioContexto = new (window.AudioContext || window.webkitAudioContext)();

    //controle do audio gravado
    const source = audioContexto.createMediaStreamSource(stream);

    //processamento do audio
    processor = audioContexto.createScriptProcessor(4096, 1, 1); // Tamanho do buffer

    //utilizando lameJS para conversão do audio para mp3
    mp3Encoder = new lamejs.Mp3Encoder(1, 44100, 128);

    //convertendo o audio em um formato que possa ser salvo
    processor.onaudioprocess = function (event) {
        const inputData = event.inputBuffer.getChannelData(0); // contém audio que esta sendo capturado, no primeiro canal 0
        const int16Data = convertFloat32ToInt16(inputData); // áudio convertido para Int16, ideal para MP3.
        const encoded = mp3Encoder.encodeBuffer(int16Data); // audio transformado em em mp3
        if (encoded.length > 0) { //verifico se tem dados
            mp3Data.push(encoded); //adiciono no array
        }
    };

    // associando ou conectando o fluxo de áudio capturado do microfone ao processador de audio
    source.connect(processor);

    processor.connect(audioContexto.destination);

    // Controlar quando a gravação é interrompida
    gravadorAudio.onstop = async () => {

        //interrompendo processamento e captura
        processor.disconnect();
        source.disconnect();

        const endData = mp3Encoder.flush();
        if (endData.length > 0) {
            mp3Data.push(endData);
        }

        // Criar o Blob do MP3
        const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });

        // Enviar o MP3
        const formData = new FormData();
        formData.append('audioFile', mp3Blob, 'audio.mp3');

        $.ajax({
            url: '/api/audio/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                alert('Áudio enviado com sucesso.');
            },
            error: function (err) {
                alert('Erro ao enviar áudio:', err);
            },
        });
    };

    gravadorAudio.start();
    $('#startButton').prop('disabled', true);
    $('#stopButton').prop('disabled', false);
});

$('#stopButton').on('click', function () {
    gravadorAudio.stop();
    $('#startButton').prop('disabled', false);
    $('#stopButton').prop('disabled', true);
    audioPartes = [];
});

function convertFloat32ToInt16(float32Data) {
    const int16Data = new Int16Array(float32Data.length);
    for (let i = 0; i < float32Data.length; i++) {
        int16Data[i] = Math.max(-1, Math.min(1, float32Data[i])) * 0x7FFF;
    }
    return int16Data;
}