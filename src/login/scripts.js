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
                    // If the response status is 401 (Unauthorized), throw a custom error message
                    if (response.status === 401) {
                        throw new Error("Invalid username or password");
                    } else {
                        throw new Error("Error: " + response.statusText);
                    }
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
                        console.error("Error:", error);
                    });
            })
            .catch((error) => {
                const errorMessageElement =
                    document.getElementById("error-message");
                errorMessageElement.innerText = error.message;
                errorMessageElement.style.display = "block";
                console.error("Error:", error);
            });
    });
