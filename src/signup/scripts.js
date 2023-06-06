document
    .getElementById("signupForm")
    .addEventListener("submit", function (event) {
        // Prevent the form from submitting normally
        event.preventDefault();

        const fullName = document.getElementById("fullName");
        const username = document.getElementById("username");
        const description = document.getElementById("description");
        const password = document.getElementById("password");

        const formData = {
            full_name: fullName.value,
            username: username.value,
            description: description.value,
            password: password.value,
        };

        // Now you can send the form data to your server
        fetch("http://20.106.172.11:80/api/v1/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 409) {
                        // username is already taken
                        throw new Error("Username is already taken.");
                    } else {
                        throw new Error("Error: " + response.statusText);
                    }
                }
                return response.json();
            })
            .then((responseJson) => {
                login(username.value, password.value);

                // Clear the form
                fullName.value = "";
                username.value = "";
                description.value = "";
                password.value = "";

                // Handle the response
                console.log(responseJson);
            })
            .catch((error) => {
                // Handle the error
                console.error("Error:", error);

                // Remove existing message, if any
                const oldMessageElement = document.getElementById("message");
                if (oldMessageElement) {
                    oldMessageElement.remove();
                }

                // Create an error message element
                const messageElement = document.createElement("p");
                messageElement.id = "message";
                messageElement.style.color = "red";
                messageElement.textContent = error.message;

                // Add the error message element to the form
                document
                    .getElementById("signupForm")
                    .appendChild(messageElement);
            });
    });

function login(username, password) {
    const formData = new URLSearchParams();
    formData.append("grant_type", "");
    formData.append("username", username);
    formData.append("password", password);
    formData.append("scope", "");
    formData.append("client_id", "");
    formData.append("client_secret", "");

    // Now you can send 'username' and 'password' to your server
    fetch("http://20.106.172.11:80/api/v1/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
        },
        body: formData,
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Error: " + response.statusText);
            }
        })
        .then((responseJson) => {
            // Store the received access token
            localStorage.setItem("access_token", responseJson.access_token);
            // Fetch the current user's details
            fetch("http://20.106.172.11:80/api/v1/users/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    accept: "application/json",
                    Authorization: `Bearer ${responseJson.access_token}`,
                },
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error("Error: " + response.statusText);
                    }
                })
                .then((responseJson) => {
                    // Store the current user's ID
                    localStorage.setItem("current_user", responseJson.id);

                    // Handle the response
                    console.log(responseJson);

                    // Redirect to conversations page after successful login
                    window.location.href = "../conversations/page.html";
                })
                .catch((error) => {
                    // Handle the error
                    console.error("Error:", error);
                });
        })
        .catch((error) => {
            // Handle the error
            console.error("Error:", error);
        });
}
