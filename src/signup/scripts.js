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
        fetch("http://localhost:8000/api/v1/users", {
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
                // Clear the form
                fullName.value = "";
                username.value = "";
                description.value = "";
                password.value = "";

                // Handle the response
                console.log(responseJson);

                // Redirect to the conversations page
                window.location.href = "../conversations/page.html";
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
