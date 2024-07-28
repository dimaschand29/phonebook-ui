document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("phonebook-form");
  const contactsList = document.getElementById("contacts-list");
  const searchBar = document.getElementById("search-bar");
  const apiUrl = "http://localhost:8080/api/contacts";
  let timeout = null;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = document.getElementById("contact-id").value;
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    const contact = { name, phone, email };

    try {
      let response;
      if (id) {
        response = await fetch(`${apiUrl}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contact),
        });
      } else {
        response = await fetch(`${apiUrl}/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contact),
        });
      }

      const jsonResponse = await response.json();

      if (!response.ok) {
        alert(jsonResponse.msg);
      } else {
        form.reset();
        document.getElementById("contact-id").value = "";
        loadContacts();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred");
    }
  });

  contactsList.addEventListener("click", async (event) => {
    try {
      if (event.target.classList.contains("delete")) {
        const id = event.target.dataset.id;
        const response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const jsonResponse = await response.json();
          alert(jsonResponse.msg);
        } else {
          loadContacts();
        }
      } else if (event.target.classList.contains("edit")) {
        const id = event.target.dataset.id;
        const response = await fetch(`${apiUrl}/${id}`);
        const jsonResponse = await response.json();
        if (!response.ok) {
          alert(jsonResponse.msg);
        } else {
          const contact = jsonResponse.data;
          document.getElementById("contact-id").value = contact.id;
          document.getElementById("name").value = contact.name;
          document.getElementById("phone").value = contact.phone;
          document.getElementById("email").value = contact.email;
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred");
    }
  });

  searchBar.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const query = searchBar.value.toLowerCase();
      try {
        const response = await fetch(`${apiUrl}/get?query=${query}`);
        const jsonResponse = await response.json();
        if (!response.ok) {
          alert(jsonResponse.msg);
        } else {
          const contacts = jsonResponse.data;
          displayContacts(contacts);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred");
      }
    }, 1000);
  });

  async function loadContacts() {
    try {
      const response = await fetch(`${apiUrl}/get`, { method: "GET" });
      const jsonResponse = await response.json();
      if (!response.ok) {
        alert(jsonResponse.msg);
      } else {
        const contacts = jsonResponse.data;
        displayContacts(contacts);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred");
    }
  }

  function displayContacts(contacts) {
    contactsList.innerHTML = contacts
      .map(
        (contact) => `
            <div class="contact row">
              <div class="contact-details col-8 d-flex justify-content-between">
                <span><strong>Name:</strong> ${contact.name}</span>
                <span><strong>Phone:</strong> ${contact.phone}</span>
                <span><strong>Email:</strong> ${contact.email}</span>
              </div>
              <div class="col-4 text-right">
                <button class="btn btn-sm btn-warning edit" data-id="${contact.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete" data-id="${contact.id}">Delete</button>
              </div>
            </div>
          `
      )
      .join("");
  }

  loadContacts();
});
