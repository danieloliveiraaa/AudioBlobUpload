let gravadorAudio;
let audioChunks = [];

// Evento para iniciar a gravação
$('#startButton').on('click', async function () {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    gravadorAudio = new MediaRecorder(stream);

    gravadorAudio.ondataavailable = event => audioChunks.push(event.data);
    gravadorAudio.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audioFile', audioBlob, 'recordedAudio.wav');

        await fetch('/api/audio/upload', {
            method: 'POST',
            body: formData
        });
    };

    gravadorAudio.start();
    $('#startButton').prop('disabled', true);
    $('#stopButton').prop('disabled', false);
});

// Evento para parar a gravação
$('#stopButton').on('click', function () {
    gravadorAudio.stop();
    $('#startButton').prop('disabled', false);
    $('#stopButton').prop('disabled', true);
    audioChunks = [];
});
