
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


