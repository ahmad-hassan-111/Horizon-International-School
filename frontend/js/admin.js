document.addEventListener("DOMContentLoaded", () => {

```
// =========================================================
// CONFIG
// =========================================================

const API_URL =
    "https://horizon-international-school.vercel.app/api";


// =========================================================
// ELEMENTS
// =========================================================

const applicationsContainer =
    document.getElementById("applicationsContainer");

const totalApplications =
    document.getElementById("totalApplications");

const pendingApplications =
    document.getElementById("pendingApplications");

const confirmedApplications =
    document.getElementById("confirmedApplications");

const completedApplications =
    document.getElementById("completedApplications");

const refreshButton =
    document.getElementById("refreshAdmissions");

const searchInput =
    document.getElementById("applicationSearch");

const statusFilter =
    document.getElementById("statusFilter");


// Modal elements
const applicationModal =
    document.getElementById("applicationModal");

const modalOverlay =
    document.querySelector(".application-modal-overlay");

const closeApplicationModal =
    document.getElementById("closeApplicationModal");

const modalStudentName =
    document.getElementById("modalStudentName");

const modalStatus =
    document.getElementById("modalStatus");

const modalStudent =
    document.getElementById("modalStudent");

const modalDateOfBirth =
    document.getElementById("modalDateOfBirth");

const modalGrade =
    document.getElementById("modalGrade");

const modalParent =
    document.getElementById("modalParent");

const modalEmail =
    document.getElementById("modalEmail");

const modalPhone =
    document.getElementById("modalPhone");

const modalMessage =
    document.getElementById("modalMessage");


// =========================================================
// STATE
// =========================================================

let admissions = [];
let selectedAdmission = null;


// =========================================================
// LOAD ADMISSIONS
// =========================================================

async function loadAdmissions() {

    if (applicationsContainer) {

        applicationsContainer.innerHTML = `
            <div class="admin-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading applications...</span>
            </div>
        `;

    }


    try {

        const response = await fetch(
            `${API_URL}/admissions`
        );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data = await response.json();


        if (data.status !== "success") {

            throw new Error(
                "Unable to load admissions."
            );

        }


        admissions =
            Array.isArray(data.admissions)
                ? data.admissions
                : [];


        updateStats();
        renderAdmissions();


    } catch (error) {

        console.error(
            "Admissions loading error:",
            error
        );


        if (applicationsContainer) {

            applicationsContainer.innerHTML = `
                <div class="admin-empty">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Unable to load applications
                    </h3>

                    <p>
                        Please check your connection and try again.
                    </p>

                    <button
                        type="button"
                        class="admin-retry-btn"
                        id="retryAdmissions"
                    >
                        Try Again
                    </button>

                </div>
            `;


            const retryButton =
                document.getElementById(
                    "retryAdmissions"
                );


            if (retryButton) {

                retryButton.addEventListener(
                    "click",
                    loadAdmissions
                );

            }

        }

    }

}


// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateStats() {

    const total =
        admissions.length;


    const pending =
        admissions.filter(
            admission =>
                admission.status === "Pending"
        ).length;


    const confirmed =
        admissions.filter(
            admission =>
                admission.status === "Confirmed"
        ).length;


    const completed =
        admissions.filter(
            admission =>
                admission.status === "Completed"
        ).length;


    if (totalApplications) {
        totalApplications.textContent = total;
    }


    if (pendingApplications) {
        pendingApplications.textContent = pending;
    }


    if (confirmedApplications) {
        confirmedApplications.textContent = confirmed;
    }


    if (completedApplications) {
        completedApplications.textContent = completed;
    }

}


// =========================================================
// FILTER + SEARCH
// =========================================================

function getFilteredAdmissions() {

    const searchTerm =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    return admissions.filter(
        admission => {

            const student =
                String(
                    admission.student_name || ""
                ).toLowerCase();


            const parent =
                String(
                    admission.parent_name || ""
                ).toLowerCase();


            const email =
                String(
                    admission.email || ""
                ).toLowerCase();


            const grade =
                String(
                    admission.grade || ""
                ).toLowerCase();


            const matchesSearch =
                !searchTerm ||
                student.includes(searchTerm) ||
                parent.includes(searchTerm) ||
                email.includes(searchTerm) ||
                grade.includes(searchTerm);


            const matchesStatus =
                selectedStatus === "all" ||
                admission.status === selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


// =========================================================
// RENDER APPLICATIONS
// =========================================================

function renderAdmissions() {

    if (!applicationsContainer) {
        return;
    }


    const filteredAdmissions =
        getFilteredAdmissions();


    if (filteredAdmissions.length === 0) {

        applicationsContainer.innerHTML = `
            <div class="admin-empty">

                <i class="fa-solid fa-folder-open"></i>

                <h3>
                    No applications found
                </h3>

                <p>
                    Try changing your search or filter.
                </p>

            </div>
        `;

        return;

    }


    applicationsContainer.innerHTML =
        filteredAdmissions
            .map(createApplicationCard)
            .join("");


    document
        .querySelectorAll(".application-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            card.dataset.id
                        );


                    const admission =
                        admissions.find(
                            item =>
                                item.id === id
                        );


                    if (admission) {

                        openApplicationModal(
                            admission
                        );

                    }

                }
            );

        });

}


// =========================================================
// APPLICATION CARD
// =========================================================

function createApplicationCard(admission) {

    const studentName =
        escapeHTML(
            admission.student_name ||
            "Unnamed Student"
        );


    const parentName =
        escapeHTML(
            admission.parent_name ||
            "—"
        );


    const grade =
        escapeHTML(
            admission.grade ||
            "—"
        );


    const email =
        escapeHTML(
            admission.email ||
            "—"
        );


    const status =
        escapeHTML(
            admission.status ||
            "Pending"
        );


    const date =
        formatDate(
            admission.created_at
        );


    return `
        <article
            class="application-card"
            data-id="${admission.id}"
        >

            <div class="application-card-number">
                #${admission.id}
            </div>


            <div class="application-card-main">

                <div class="application-card-top">

                    <div>

                        <h3>
                            ${studentName}
                        </h3>

                        <p>
                            ${parentName}
                        </p>

                    </div>


                    <span
                        class="application-status status-${status.toLowerCase()}"
                    >
                        ${status}
                    </span>

                </div>


                <div class="application-card-info">

                    <span>
                        <i class="fa-solid fa-graduation-cap"></i>
                        ${grade}
                    </span>


                    <span>
                        <i class="fa-solid fa-envelope"></i>
                        ${email}
                    </span>


                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        ${date}
                    </span>

                </div>

            </div>


            <div class="application-card-arrow">

                <i class="fa-solid fa-arrow-right"></i>

            </div>

        </article>
    `;

}


// =========================================================
// OPEN MODAL
// =========================================================

function openApplicationModal(admission) {

    selectedAdmission =
        admission;


    if (modalStudentName) {

        modalStudentName.textContent =
            admission.student_name ||
            "Unnamed Student";

    }


    if (modalStatus) {

        modalStatus.textContent =
            admission.status ||
            "Pending";

        updateModalStatusClass(
            admission.status
        );

    }


    if (modalStudent) {

        modalStudent.textContent =
            admission.student_name ||
            "—";

    }


    if (modalDateOfBirth) {

        modalDateOfBirth.textContent =
            admission.date_of_birth ||
            "—";

    }


    if (modalGrade) {

        modalGrade.textContent =
            admission.grade ||
            "—";

    }


    if (modalParent) {

        modalParent.textContent =
            admission.parent_name ||
            "—";

    }


    if (modalEmail) {

        modalEmail.textContent =
            admission.email ||
            "—";

    }


    if (modalPhone) {

        modalPhone.textContent =
            admission.phone ||
            "—";

    }


    if (modalMessage) {

        modalMessage.textContent =
            admission.message ||
            "No additional message.";

    }


    if (applicationModal) {

        applicationModal.classList.add(
            "active"
        );

        applicationModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";

    }

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeModal() {

    if (!applicationModal) {
        return;
    }


    applicationModal.classList.remove(
        "active"
    );


    applicationModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";


    selectedAdmission =
        null;

}


if (closeApplicationModal) {

    closeApplicationModal.addEventListener(
        "click",
        closeModal
    );

}


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        closeModal
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            applicationModal &&
            applicationModal.classList.contains(
                "active"
            )
        ) {

            closeModal();

        }

    }
);


// =========================================================
// STATUS BUTTONS
// =========================================================

document
    .querySelectorAll(".modal-status-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const newStatus =
                    button.dataset.status;


                if (
                    !selectedAdmission ||
                    !newStatus
                ) {

                    return;

                }


                alert(
                    `Status change to "${newStatus}" will be connected to the backend next.`
                );

            }
        );

    });


// =========================================================
// MODAL STATUS STYLE
// =========================================================

function updateModalStatusClass(status) {

    if (!modalStatus) {
        return;
    }


    modalStatus.className =
        "application-status";


    if (status) {

        modalStatus.classList.add(
            `status-${String(status).toLowerCase()}`
        );

    }

}


// =========================================================
// REFRESH
// =========================================================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadAdmissions
    );

}


// =========================================================
// SEARCH
// =========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderAdmissions
    );

}


// =========================================================
// FILTER
// =========================================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderAdmissions
    );

}


// =========================================================
// HELPERS
// =========================================================

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =========================================================
// INITIAL LOAD
// =========================================================

loadAdmissions();
```

});
