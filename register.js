document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  
  const confirmInput = document.createElement("input");
  confirmInput.type = "password";
  confirmInput.id="confirmPassword";
  confirmInput.placeholder =  "Confirm Password";
  confirmInput.required = true;
     registerForm.insertBefore(confirmInput, registerForm.querySelector("button"));

  const passwordField = document.getElementById("password");
  const passWrapper = document.createElement("div");
  const confirmWrapper = document.createElement("div");
  passWrapper.style.position = confirmWrapper.style.position = "relative";
  passwordField.parentNode.insertBefore(passWrapper, passwordField);
  passWrapper.appendChild(passwordField);
  confirmInput.parentNode.insertBefore(confirmWrapper, confirmInput);
  confirmWrapper.appendChild(confirmInput);


  function createToggle(targetInput) {
    const toggleBtn = document.createElement("span");
    toggleBtn.textContent = "Show";
    toggleBtn.style.cursor = "pointer";
    toggleBtn.style.position = "absolute";
    toggleBtn.style.right = "10px";
    toggleBtn.style.top = "50%";
    toggleBtn.style.transform = "translateY(-50%)";
    toggleBtn.style.color = "#007bff";
    toggleBtn.style.userSelect = "none";
    toggleBtn.style.fontWeight = "600";
    toggleBtn.style.fontSize = "0.9rem";

    toggleBtn.addEventListener("click", () => {
      const isHidden=targetInput.type === "password";
      targetInput.type  = isHidden ? "text" : "password";
      toggleBtn.textContent = isHidden ? "Hide" : "Show";
    });

    return toggleBtn;
  }

  passWrapper.appendChild(createToggle(passwordField));
  confirmWrapper.appendChild(createToggle(confirmInput));

  
  const phoneInput = document.createElement("input");
   phoneInput.type = "tel";
   phoneInput.id = "phone";
     phoneInput.placeholder =  "Phone Number (digits only)";
  phoneInput.required = true;
   phoneInput.pattern = "^\\+?\\d{10,15}$"; 
  registerForm.insertBefore(phoneInput, passwordField);

  
  const roleSelect = document.createElement("select");
  roleSelect.id = "role";
  roleSelect.required = true;
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = "Select Role";
  roleSelect.appendChild(defaultOption);

  const ownerOption = document.createElement("option");
  ownerOption.value = "owner";
  ownerOption.textContent = "Owner";
  roleSelect.appendChild(ownerOption);

  const coworkerOption = document.createElement("option");
  coworkerOption.value = "coworker";
  coworkerOption.textContent = "Coworker";
  roleSelect.appendChild(coworkerOption);

  registerForm.insertBefore(roleSelect, phoneInput);

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const phone = document.getElementById("phone").value.trim();
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Basic validation checks
    if (fullName.length < 3) {
      alert("Full name must be at least 3 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!/^\+?\d{10,15}$/.test(phone)) {
      alert("Please enter a valid phone number (10-15 digits).");
      return;
    }

    if (!role) {
      alert("Please select a role.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Prepare data for POST
    const postData = { fullName, email, phone, role, password };

    fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Registration successful! Redirecting to login...");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Registration failed.");
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert("An error occurred during registration. Please try again.");
    });
  });
});
