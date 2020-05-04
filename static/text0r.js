const socket = new WebSocket(`ws://${window.location.host}`);

let currentPhoneNumber;

socket.addEventListener('message', function (event) {
    let payload = event.data;

    try {
        payload = JSON.parse(event.data);

        if (payload.eventType = 'Incoming Message') {
            addMessage(payload);
        }

    } catch(e) {
        console.log('Well that didn\'t work...');
    }
});

function addMessage(message) {
    if (message.sent) {
        $('#messages').append(`
            <div class="card w-75 my-2">
                <div class="card-header">
                    <p class="card-text">To: ${message.to}</p>
                </div>
                <div class="card-body">
                    <p class="card-text">${message.body}</p>
                </div>
                <div class="card-footer">
                    <p class="card-text" style="float: right;">${moment(message.dateTime).format('llll')}</p>
                </div>
            </div>`
        );
    } else {
        $('#messages').append(`
            <div class="ml-auto card w-75 my-2">
                <div class="card-header">
                    <p class="card-text">From: ${message.from}</p>
                </div>
                <div class="card-body">
                    <p class="card-text">${message.body}</p>
                </div>
                <div class="card-footer">
                    <p class="card-text" style="float: right;">${moment(message.dateTime).format('llll')}</p>
                </div>
            </div>
        `);
    }
}

function setCurrentRecipient(currentRecipient) {
    console.log(currentRecipient);
}

function sendIt() {
    const messageText = $('#messageText').val();
    const messageRecipient = $('#messageRecipient').val();

    const message = {
        to: messageRecipient,
        dateTime: Date.now(),
        body: messageText,
        sent: true,
    };

    addMessage(message);

    sendMessage(message);

    $('#messageText').val('');
    $('#messageRecipient').val('');


    console.log('sending message');
}

function sendMessage(message) {
    axios.post('/send', message)
}
