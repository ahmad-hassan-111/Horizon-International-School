/* =========================================================
   HORIZON INTERNATIONAL SCHOOL
   ADMIN LOGIN
========================================================= */

const API_URL =
    "https://horizon-international-school.vercel.app/api";


/* =========================================================
   ELEMENTS
========================================================= */

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginStatus =
    document.getElementById("loginStatus");

const passwordInput =
    document.getElementById("password");

const passwordToggle =
    document.getElementById("passwordToggle");


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

if (passwordToggle && passwordInput) {

    passwordToggle.addEventListener("click", () => {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type =
            isPassword ? "text" : "password";

        passwordToggle.innerHTML =
            isPassword
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

    loginStatus.className =
        `login-status ${type}`;
}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const password =
                passwordInput.value;


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (!username || !password) {

                showStatus(
                    "Please enter your username and password.",
                    "error"
                );

                return;
            }


            /* -----------------------------------------
               LOADING STATE
            ----------------------------------------- */

            loginButton.disabled = true;

            loginButton.querySelector("span")
                .textContent = "Signing in...";

            showStatus(
                "Verifying your credentials...",
                "info"
            );


            try {

                /* -------------------------------------
                   LOGIN REQUEST
                ------------------------------------- */

                const response =
                    await fetch(
                        `${API_URL}/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username: username,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                /* -------------------------------------
                   LOGIN FAILED
                ------------------------------------- */

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        data.message ||
                        "Invalid username or password."
                    );
                }


                /* -------------------------------------
                   LOGIN SUCCESS
                ------------------------------------- */

                sessionStorage.setItem(
                    "horizonAdminLoggedIn",
                    "true"
                );


                showStatus(
                    "Login successful. Opening dashboard...",
                    "success"
                );


                /* -------------------------------------
                   REDIRECT
                ------------------------------------- */

                setTimeout(() => {

                    window.location.href =
                        "admin.html";

                }, 700);

            }


            /* -----------------------------------------
               ERROR
            ----------------------------------------- */

            catch (error) {

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

                loginButton.querySelector("span")
                    .textContent =
                    "Access Dashboard";
            }

        }
    );
}