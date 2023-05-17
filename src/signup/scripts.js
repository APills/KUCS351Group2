document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    // Prevent the form from submitting normally
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const username = document.getElementById("username").value;
    const description = document.getElementById("description").value;
    const password = document.getElementById("password").value;

    const formData = {
      full_name: fullName,
      username: username,
      description: description,
      password: password,
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
            throw new Error(
              "Username is already taken."
            );
          } else {
            throw new Error("Error: " + response.statusText);
          }
        }
        return response.json();
      })
      .then((responseJson) => {
        // Handle the response
        console.log(responseJson);
      })
      .catch((error) => {
        // Handle the error
        console.error("Error:", error);

        // Remove existing error message, if any
        const oldErrorMessageElement = document.getElementById("errorMessage");
        if (oldErrorMessageElement) {
          oldErrorMessageElement.remove();
        }

        // Create an error message element
        const errorMessageElement = document.createElement("p");
        errorMessageElement.id = "errorMessage";
        errorMessageElement.style.color = "red";
        errorMessageElement.textContent = error.message;

        // Add the error message element to the form
        document.getElementById("signupForm").appendChild(errorMessageElement);
      });
  });
