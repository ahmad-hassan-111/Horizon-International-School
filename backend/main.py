import os

import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="Horizon International School API",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE
# =========================================================

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured.")

    return psycopg.connect(
        DATABASE_URL,
        sslmode="require"
    )


# =========================================================
# CREATE ADMISSIONS TABLE
# =========================================================

def create_table():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS admissions (
                    id SERIAL PRIMARY KEY,
                    student_name VARCHAR(150) NOT NULL,
                    date_of_birth VARCHAR(50),
                    grade VARCHAR(50),
                    parent_name VARCHAR(150) NOT NULL,
                    email VARCHAR(150) NOT NULL,
                    phone VARCHAR(50),
                    message TEXT,
                    status VARCHAR(30) DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
        conn.commit()


# =========================================================
# STARTUP
# =========================================================

@app.on_event("startup")
def startup():
    create_table()


# =========================================================
# MODELS
# =========================================================

class Admission(BaseModel):
    student_name: str
    date_of_birth: str | None = None
    grade: str | None = None
    parent_name: str
    email: str
    phone: str | None = None
    message: str | None = None


class StatusUpdate(BaseModel):
    status: str


class LoginRequest(BaseModel):
    username: str
    password: str


# =========================================================
# ADMIN LOGIN
# =========================================================

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


@app.post("/api/login")
def login(login_data: LoginRequest):

    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Admin login credentials are not configured."
        )

    if (
        login_data.username != ADMIN_USERNAME
        or login_data.password != ADMIN_PASSWORD
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password."
        )

    return {
        "status": "success",
        "message": "Login successful."
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Horizon International School API is running."
    }


@app.get("/api/health")
def health():
    return {
        "status": "success",
        "message": "API is healthy."
    }
# =========================================================
# ADMIN LOGIN
# =========================================================

class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/api/login")
def admin_login(login: LoginRequest):

    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Admin login credentials are not configured."
        )

    if (
        login.email != ADMIN_EMAIL
        or login.password != ADMIN_PASSWORD
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return {
        "status": "success",
        "message": "Login successful."
    }

# =========================================================
# SUBMIT ADMISSION
# =========================================================

@app.post("/api/admissions")
def submit_admission(admission: Admission):

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                cur.execute("""
                    INSERT INTO admissions (
                        student_name,
                        date_of_birth,
                        grade,
                        parent_name,
                        email,
                        phone,
                        message
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    admission.student_name,
                    admission.date_of_birth,
                    admission.grade,
                    admission.parent_name,
                    admission.email,
                    admission.phone,
                    admission.message
                ))

                admission_id = cur.fetchone()[0]

            conn.commit()

        return {
            "status": "success",
            "message": "Admission application submitted successfully.",
            "admission_id": admission_id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# GET ADMISSIONS
# =========================================================

@app.get("/api/admissions")
def get_admissions():

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                cur.execute("""
                    SELECT
                        id,
                        student_name,
                        date_of_birth,
                        grade,
                        parent_name,
                        email,
                        phone,
                        message,
                        status,
                        created_at
                    FROM admissions
                    ORDER BY created_at DESC
                """)

                rows = cur.fetchall()

        admissions = []

        for row in rows:
            admissions.append({
                "id": row[0],
                "student_name": row[1],
                "date_of_birth": row[2],
                "grade": row[3],
                "parent_name": row[4],
                "email": row[5],
                "phone": row[6],
                "message": row[7],
                "status": row[8],
                "created_at": row[9]
            })

        return {
            "status": "success",
            "admissions": admissions
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# UPDATE ADMISSION STATUS
# =========================================================

@app.patch("/api/admissions/{admission_id}/status")
def update_admission_status(
    admission_id: int,
    status_update: StatusUpdate
):

    allowed_statuses = {
        "Pending",
        "Confirmed",
        "Completed"
    }

    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Allowed values are Pending, Confirmed, and Completed."
        )

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:

                cur.execute("""
                    UPDATE admissions
                    SET status = %s
                    WHERE id = %s
                    RETURNING id, status
                """, (
                    status_update.status,
                    admission_id
                ))

                updated_admission = cur.fetchone()

            conn.commit()

        if not updated_admission:
            raise HTTPException(
                status_code=404,
                detail="Admission application not found."
            )

        return {
            "status": "success",
            "message": "Admission status updated successfully.",
            "admission_id": updated_admission[0],
            "new_status": updated_admission[1]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )