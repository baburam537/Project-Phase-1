const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const message = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");


togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  

  togglePassword.classList.toggle("fa-eye-slash", isPassword);
  togglePassword.classList.toggle("fa-eye", !isPassword);
});


loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  
  if (!validateEmailSimple(username)) {
    showMessage("Please enter a valid email address.", "red");
    return;
  }

  
  if (password.length === 0) {
    showMessage("Please enter your password.", "red");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Login successful! Redirecting...", "green");
      loginForm.classList.add("success-shake");
      setTimeout(() => {
        window.location.href = "mybooking.html";
      }, 1500);
    } else {
      
      showMessage("Invalid credentials.", "red");
      loginForm.classList.add("error-shake");
    }
  } catch (err) {
    console.error(err);
    showMessage("An error occurred. Please try again.", "red");
  }
});

// Simple email validation function
function validateEmailSimple(email) {
   if (!email.includes("@")) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  if (parts[0].trim() === "" || parts[1].trim() === "") return false;
  if (!parts[1].includes(".")) return false;
  return true;
}

// Show message below form
function showMessage(text, color) {
  message.textContent = text;
  message.style.color = color;
}

// Remove shake animation classes after animation ends
loginForm.addEventListener("animationend", () => {
  loginForm.classList.remove("error-shake", "success-shake");
});
