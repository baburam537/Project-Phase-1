
  document.addEventListener("DOMContentLoaded", () => {
      const bookingList = document.getElementById("bookingList");
    const clearAllBtn = document.getElementById("clearAllBtn");
      const userId = parseInt(localStorage.getItem('userId')) || 1;

  function loadBookings()  {
    fetch(`http://localhost:3000/bookings?userId=${userId}`)
      .then(response => response.json())
      .then(data => {
        const bookings = data.bookings || [];
          bookingList.innerHTML = "";

        if (bookings.length === 0) {
          bookingList.innerHTML = "<p class='empty-message'>You have no bookings yet.</p>";
          clearAllBtn.style.display = "none";
          return;
        }

        clearAllBtn.style.display = "block";

        bookings.forEach(booking => {
          const div = document.createElement("div");
          div.className = "booking-item card";

          const details = document.createElement("div");
          details.className = "booking-details";
          details.innerHTML = `
            <p><strong>Workspace:</strong> ${booking.workspace.replace(/-/g, " ")}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Duration:</strong> ${booking.duration} hour(s)</p>
            <p><strong>Price:</strong> $${booking.price}</p>
          `;

          const delBtn = document.createElement("button");
          delBtn.className = "delete-btn";
          delBtn.textContent = "Delete";
          delBtn.addEventListener("click", () => deleteBooking(booking.id));

          div.appendChild(details);
          div.appendChild(delBtn);
          bookingList.appendChild(div);
        });
      })
      .catch(error => console.error('Error:', error));
  }

  function deleteBooking(bookingId) {
    fetch(`http://localhost:3000/bookings/${bookingId}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        loadBookings();
      } else {
        alert(data.message);
      }
    })
    .catch(error => console.error('Error:', error));
  }

  clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all bookings?")) {
      fetch(`http://localhost:3000/bookings?userId=${userId}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          loadBookings();
        } else {
          alert(data.message);
        }
      })
      .catch(error => console.error('Error:', error));
    }
  });

  loadBookings();
});


