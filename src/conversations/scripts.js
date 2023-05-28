let currentConversation = null;
let otherUserId = null;

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("access_token");

    fetch("http://localhost:8000/api/v1/conversations", {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const conversationList =
                document.getElementById("conversations-list");
            let firstElement;
            data.forEach((conversation, index) => {
                const div = document.createElement("div");
                div.textContent = conversation.user.full_name;
                div.classList.add("conversation-item");
                div.addEventListener("click", function () {
                    document
                        .querySelectorAll(".conversation-item")
                        .forEach((el) => el.classList.remove("active"));
                    this.classList.add("active");
                    currentConversation = conversation;
                    otherUserId = conversation.messages[0].target_user_id;
                    loadMessages(conversation.messages);
                });
                conversationList.appendChild(div);
                if (index === 0) firstElement = div;
            });
            if (firstElement) firstElement.click();
        })
        .catch((error) => console.error("Error:", error));

    document
        .getElementById("newButton")
        .addEventListener("click", onNewButtonClick);

    document
        .getElementById("messageForm")
        .addEventListener("submit", function (event) {
            event.preventDefault();
            const messageInput = document.getElementById("message-input");
            const content = messageInput.value;
            messageInput.value = "";

            const targetUserId = otherUserId;
            const token = localStorage.getItem("access_token");
            fetch("http://localhost:8000/api/v1/messages?return_results=true", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    target_user_id: targetUserId,
                    content: content,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (currentConversation) {
                        addMessageToCurrentConversation(data);
                    }
                })
                .catch((error) => console.error("Error:", error));
        });
});

function loadMessages(messages) {
    const messagesList = document.getElementById("messages-list");
    messagesList.innerHTML = "";
    const currentUserId = localStorage.getItem("current_user");
    messages.forEach((message) => {
        const div = document.createElement("div");
        div.textContent = message.content;
        div.classList.add("message");

        if (message.source_user_id == currentUserId) {
            div.classList.add("right");
        } else {
            div.classList.add("left");
        }

        messagesList.appendChild(div);
    });
}

function addMessageToCurrentConversation(message) {
    currentConversation.messages.push(message);
    loadMessages(currentConversation.messages);
}

function onNewButtonClick() {
    window.location.href = "../search/page.html";
}
