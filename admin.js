const getElement = (id) => document.getElementById(id);

const elements = {
    resetClientsButton: getElement("resetClientsButton"),
};

let socket = new WebSocket("wss://prompt-battle-server.glitch.me");
const resetClients = () => {
    alert()
    socket.send(
        JSON.stringify({
            type: "resetClients",
        })
    );
};

elements.resetClientsButton.addEventListener("click", resetClients);
