/* =========================================================
   HORIZON INTERNATIONAL SCHOOL
   ADMIN LOGIN
========================================================= */

const API_URL =
    "https://horizon-international-school.vercel.app/api";


/* =========================================================
   ELEMENTS
========================================================= */

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginStatus = document.getElementById("loginStatus");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("passwordToggle");


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

if (passwordToggle && passwordInput) {

    passwordToggle.addEventListener("click", () => {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type =
            isPassword ? "text" : "password";

        passwordToggle.innerHTML = isPassword
            ? '<i class="fa-regular fa-eye-slash"></i>'
            : '<i class="fa-regular fa-eye"></i>';

        passwordToggle.setAttribute(
            "aria-label",
            isPassword
                ? "Hide password"
                : "Show password"
        );

    });

}


/* =========================================================
   STATUS MESSAGE
========================================================= */

function showStatus(message, type = "info") {

    if (!loginStatus) {
        return;
    }

    loginStatus.textContent = message;

    loginStatus.className = "login-status";

    if (type === "error") {

        loginStatus.style.color = "#9B3D32";

    } else if (type === "success") {

        loginStatus.style.color = "#315C4C";

    } else {

        loginStatus.style.color = "#68746E";

    }

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!email || !password) {

            showStatus(
                "Please enter your email and password.",
                "error"
            );

            return;
        }


        /* ---------------------------------------------
           LOADING
        --------------------------------------------- */

        loginButton.disabled = true;

        const buttonText =
            loginButton.querySelector("span");

        if (buttonText) {
            buttonText.textContent = "Signing in...";
        }

        showStatus(
            "Verifying your credentials...",
            "info"
        );


        /* ---------------------------------------------
           API REQUEST
        --------------------------------------------- */

        try {

            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data =
                await response.json();


            /* -----------------------------------------
               LOGIN FAILED
            ----------------------------------------- */

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Invalid email or password."
                );
            }


            if (data.status !== "success") {

                throw new Error(
                    data.message ||
                    "Invalid email or password."
                );
            }


            /* -----------------------------------------
               LOGIN SUCCESS
            ----------------------------------------- */

            sessionStorage.setItem(
                "horizonAdminLoggedIn",
                "true"
            );


            showStatus(
                "Login successful. Opening dashboard...",
                "success"
            );


            /* -----------------------------------------
               REDIRECT
            ----------------------------------------- */

            setTimeout(() => {

                window.location.href =
                    "admin.html";

            }, 700);


        } catch (error) {

            console.error(
                "Horizon login error:",
                error
            );


            showStatus(
                error.message ||
                "Unable to connect to the server.",
                "error"
            );


            loginButton.disabled = false;


            if (buttonText) {
                buttonText.textContent =
                    "Access Dashboard";
            }

        }

    });

}