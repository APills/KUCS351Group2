let otherUserId = null;

document.addEventListener("DOMContentLoaded", function () {
    const fields = ["full_name", "username", "description"];

    // Add event listeners for changes in the input fields
    fields.forEach((field) => {
        document.getElementById(field).addEventListener("input", fetchUsers);
    });

    // Disable the message input and send button initially
    document.getElementById("message-input").disabled = true;
    document.getElementById("send-button").disabled = true;

    // Enable Enter key to send message
    document
        .getElementById("message-input")
        .addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                e.preventDefault(); // Prevent the default action to stop scrolling when space is pressed
                document.getElementById("send-button").click();
            }
        });
});

function fetchUsers() {
    const fields = ["full_name", "username", "description"];
    const params = new URLSearchParams();
    let isEmpty = true;
    fields.forEach((f) => {
        const { value } = document.getElementById(f);
        if (value) {
            params.append(f, value);
            isEmpty = false;
        }
    });

    if (isEmpty) {
        document.getElementById("search-list").innerHTML = "";

        // disable the message input and send button
        document.getElementById("message-input").disabled = true;
        document.getElementById("send-button").disabled = true;

        return;
    }

    const token = localStorage.getItem("access_token");

    fetch(`http://localhost:8000/api/v1/users?${params.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const searchList = document.getElementById("search-list");
            searchList.innerHTML = "";
            if (data && Array.isArray(data.items)) {
                data.items.forEach((user) => {
                    const div = document.createElement("div");
                    div.textContent = `${user.full_name} @${user.username}: ${user.description}`;
                    div.classList.add("search-item");
                    div.addEventListener("click", () => {
                        if (div.classList.contains("selected")) {
                            div.classList.remove("selected");
                            otherUserId = null;

                            // disable the message input and send button
                            document.getElementById(
                                "message-input"
                            ).disabled = true;
                            document.getElementById(
                                "send-button"
                            ).disabled = true;
                        } else {
                            const prevSelectedUser = document.querySelector(
                                ".search-item.selected"
                            );
                            if (prevSelectedUser) {
                                prevSelectedUser.classList.remove("selected");
                            }

                            div.classList.add("selected");
                            otherUserId = user.id;

                            // enable the message input and send button
                            document.getElementById(
                                "message-input"
                            ).disabled = false;
                            document.getElementById(
                                "send-button"
                            ).disabled = false;
                        }
                    });
                    searchList.appendChild(div);
                });
            }
        })
        .catch((error) => console.error("Error:", error));
}

document.getElementById("send-button").addEventListener("click", () => {
    const messageInput = document.getElementById("message-input");
    const content = messageInput.value;

    if (content && otherUserId) {
        const token = localStorage.getItem("access_token");
        fetch("http://localhost:8000/api/v1/messages?return_results=true", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                target_user_id: otherUserId,
                content: content,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                messageInput.value = "";
                window.location.href = "../conversations/page.html";
            })
            .catch((error) => console.error("Error:", error));
    } else {
        alert("Please select a user and type a message before sending.");
    }
});
