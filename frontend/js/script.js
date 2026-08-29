document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // MOBILE MENU
    // =========================================================

    const menuToggle = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileMenuClose = document.querySelector(".mobile-menu-close");

    if (menuToggle && mobileMenu) {

        menuToggle.addEventListener("click", () => {
            mobileMenu.classList.add("active");
            document.body.style.overflow = "hidden";
        });

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener("click", () => {
                mobileMenu.classList.remove("active");
                document.body.style.overflow = "";
            });
        }

        const mobileLinks = mobileMenu.querySelectorAll("a");

        mobileLinks.forEach(link => {

            link.addEventListener("click", () => {
                mobileMenu.classList.remove("active");
                document.body.style.overflow = "";
            });

        });
    }


    // =========================================================
    // ADMISSION FORM
    // =========================================================

    const admissionForm = document.getElementById("admissionForm");
    const formStatus = document.getElementById("formStatus");

    if (admissionForm) {

        admissionForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            // Show submitting message
            if (formStatus) {
                formStatus.textContent = "Submitting your application...";
                formStatus.className = "form-status loading";
            }

            // Get form values
            const studentName =
                document.getElementById("studentName").value.trim();

            const dateOfBirth =
                document.getElementById("dateOfBirth").value;

            const grade =
                document.getElementById("grade").value;

            const parentName =
                document.getElementById("parentName").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const phone =
                document.getElementById("phone").value.trim();

            const message =
                document.getElementById("message").value.trim();


            // Prepare data for FastAPI
            const admissionData = {
                student_name: studentName,
                date_of_birth: dateOfBirth,
                grade: grade,
                parent_name: parentName,
                email: email,
                phone: phone,
                message: message
            };


            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/api/admissions",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },

                        body: JSON.stringify(admissionData)
                    }
                );


                const data = await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.detail || "Something went wrong."
                    );
                }


                // Success
                if (formStatus) {
                    formStatus.textContent =
                        "Application submitted successfully! Our admissions team will contact you soon.";

                    formStatus.className = "form-status success";
                }


                // Clear form
                admissionForm.reset();


            } catch (error) {

                console.error("Admission submission error:", error);

                if (formStatus) {
                    formStatus.textContent =
                        "We couldn't submit your application. Please try again.";

                    formStatus.className = "form-status error";
                }

            }

        });

    }

});