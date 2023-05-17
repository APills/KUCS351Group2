document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {
        // Prevent the form from submitting normally
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const formData = new URLSearchParams();
        formData.append("grant_type", "");
        formData.append("username", username);
        formData.append("password", password);
        formData.append("scope", "");
        formData.append("client_id", "");
        formData.append("client_secret", "");

        // Now you can send 'username' and 'password' to your server
        fetch("http://localhost:8000/api/v1/token", {
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
                fetch("http://localhost:8000/api/v1/users/me", {
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
    });
