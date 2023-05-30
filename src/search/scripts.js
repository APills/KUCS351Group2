document.addEventListener("DOMContentLoaded", function () {
    const fields = ['full_name', 'username', 'description'];

    // Initial load with no filters
    fetchUsers();

    // Add event listeners for changes in the input fields
    fields.forEach(field => {
        document.getElementById(field).addEventListener('change', fetchUsers);
    });
});

function fetchUsers() {
    const fields = ['full_name', 'username', 'description'];
    const params = new URLSearchParams();
    let isEmpty = true;
    fields.forEach(f => {
        const value = document.getElementById(f).value;
        if (value) {
            params.append(f, value);
            isEmpty = false;
        }
    });

    if (isEmpty) {
        document.getElementById('search-list').innerHTML = '';
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
        .then(response => response.json())
        .then(data => {
            const searchList = document.getElementById('search-list');
            searchList.innerHTML = '';
            if (data && Array.isArray(data.items)) {
                data.items.forEach(user => {
                    const div = document.createElement('div');
                    div.textContent = `${user.full_name} @${user.username}: ${user.description}`;
                    div.classList.add('search-item');
                    searchList.appendChild(div);
                });
            }
        })
        .catch(error => console.error('Error:', error));
}
