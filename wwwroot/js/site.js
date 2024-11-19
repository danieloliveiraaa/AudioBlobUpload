let gravadorAudio;
let audioPartes = [];

$('#startButton').on('click', async function () {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    gravadorAudio = new MediaRecorder(stream);

    gravadorAudio.ondataavailable = event => audioChunks.push(event.data);
    gravadorAudio.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audioFile', audioBlob, 'recordedAudio.wav');

        return $.ajax({
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
    audioChunks = [];
});