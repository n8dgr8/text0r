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
    $('#messages').append(`
        <div class="ml-auto card w-70">
            <div class="card-header">
                <p class="card-text">${message.from}</p>
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

function setCurrentRecipient(currentRecipient) {
    console.log(currentRecipient);
}

function sendIt() {
    console.log('sending message');
}