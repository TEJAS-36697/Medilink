# MediLink — Emergency Medical Access System
**Two Scan Interfaces: Front NFC Triage vs. Reverse QR Doctor Portal**

[![Medical Theme](https://img.shields.io/badge/Theme-Sky%20Blue%20%26%20Medical%20Green-0EA5E9?style=for-the-badge)](./index.html)
[![Two Scan Interfaces](https://img.shields.io/badge/Interfaces-Front%20NFC%20%2F%20Reverse%20QR-10B981?style=for-the-badge)](#1-two-distinct-scan-interfaces)
[![Local Encryption](https://img.shields.io/badge/Security-Client--Side%20AES--256%20Encryption-0284C7?style=for-the-badge)](#3-security-client-side-encryption--local-storage)
[![Zero Build Steps](https://img.shields.io/badge/Frontend-Pure%20HTML5%20%2F%20Vanilla%20JS-64748B?style=for-the-badge)](#4-how-to-run)
[![GitHub Pages Ready](https://img.shields.io/badge/Deployment-Static%20GitHub%20Pages-10B981?style=for-the-badge)](https://pages.github.com/)

> **"The tag stores the link — your data is securely encrypted in local storage."**  
> *A clean, user-friendly emergency healthcare system powered by dual-sided smart wristbands.*

---

## 1. Two Distinct Scan Interfaces

MediLink provides two clearly differentiated levels of access based on urgency and role:

```
                  ┌───────────────────────────────────────────────────────────┐
                  │                 PHYSICAL SMART WRISTBAND                  │
                  └─────────────────────────────┬─────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
        [BAND FRONT: PASSIVE NFC]                                     [BAND REVERSE: SECURE QR]
                 │                                                             │
                 ▼                                                             ▼
         Smartphone NFC Tap                                            Camera Optical Scan
                 │                                                             │
                 ▼                                                             ▼
     INTERFACE 1: EMERGENCY TRIAGE                                INTERFACE 2: DOCTOR PORTAL
                 │                                                             │
   • Immediate, zero-login display                               • Doctor / Paramedic License & PIN
   • Blood Group (O+ Rh Positive)                                • Decrypts full clinical history
   • Severe Allergies (Penicillin)                               • Past Surgeries & Prescriptions
   • Chronic Conditions (Asthma)                                 • Diagnostic Scans & Lab Baselines
   • Current Life-Sustaining Medications                         • Practitioner Access Audit Log
   • 1-Touch Emergency Contact Call
```

### Interface 1: Front NFC Tap (Emergency Triage View)
* **Intended For**: First Responders, Police, Good Samaritans, and Bystanders.
* **Access**: Tapping any modern smartphone to the front of the wristband. **Zero password required.**
* **Information Displayed**:
  * Full Name & Profile ID (`Aarav Sharma - ML-70821`).
  * High-visibility **Blood Group Badge** (`O+ Rh Positive`).
  * **Critical Allergy Warning** (Penicillin — High Anaphylaxis Risk).
  * **Chronic Condition Notes** (Severe Asthma — Rescue Inhaler in bag/pocket).
  * **Current Life-Sustaining Medications** (Albuterol Sulfate Inhaler 90mcg PRN, Budesonide 200mcg daily).
  * **One-Touch Emergency Phone Call Button** (Direct call to spouse: `+91 90000 00000`).
  * Immediate first-responder guidance and hospital preferences.
* **Privacy Boundary**: Full surgical records, diagnostic imaging, and physician notes are protected and omitted from Interface 1.

### Interface 2: Reverse QR Scan (Medical Personnel Portal)
* **Intended For**: Certified Physicians, Trauma Surgeons, and Paramedics.
* **Access**: Scanning the high-contrast QR code on the back of the wristband.
* **Security Barrier**: Requires practitioner role selection, Medical Council / Paramedic License ID (`MED-9942`), and Security PIN (`1234`).
* **Decrypted Clinical Records**:
  * Past Medical Diagnoses & Surgical History (Appendectomy 2018, Childhood Asthma 2006, Concussion 2021).
  * Complete Prescription Schedules with dosages and dosing frequencies.
  * Baseline Clinical Vitals (BP 118/76 mmHg, SpO2 98%, Heart Rate 68 bpm).
  * Uploaded Diagnostic Documents (PFT Report, Allergy Workup).
  * Practitioner Access Audit Log recording clinician ID, facility, and timestamp.

---

## 2. User-Friendly Medical Interface (Sky Blue, Green & Grey)

* **Sky Blue** (`#0EA5E9`, `#0284C7`, `#E0F2FE`): Primary medical identity, headers, buttons, and verified badges.
* **Medical Green** (`#10B981`, `#059669`, `#ECFDF5`): Verified status, one-touch emergency call button, and clinical confirmation markers.
* **Clean Greys & Slate** (`#F8FAFC`, `#F1F5F9`, `#E2E8F0`, `#64748B`, `#0F172A`): Neutral medical backgrounds, cards, borders, and high-contrast typography.
* **Emergency Alert** (`#EF4444`, `#FEF2F2`): High-visibility warning box for severe allergies and blood group.

---

## 3. Security: Client-Side Encryption & Local Storage

MediLink protects sensitive medical history directly on the user's device without requiring a remote client-server database:

1. **Client-Side Web Crypto AES-GCM (256-bit)**:
   * When a patient registers or edits their record in the Patient Portal, their full medical history is encrypted in memory using AES-GCM with a key derived from their PIN via PBKDF2 (100,000 iterations, SHA-256).
   * Only the public emergency triage information is stored as plain metadata; all sensitive surgical notes, detailed prescriptions, and documents are stored as ciphertext in `localStorage`.
2. **Practitioner Decryption**:
   * When certified medical personnel enter the PIN in the Doctor Portal, the browser decrypts the clinical record in memory.
   * If an incorrect PIN is entered, decryption fails and records remain locked.
3. **Audit Ledger**:
   * Every access to the decrypted clinical record is committed to a local audit trail with practitioner credentials, facility location, and timestamp.

---

## 4. How to Run

### Direct Browser Execution (Zero Dependencies)
Double-click `index.html` or open it in any web browser:
```
file:///c:/Users/Hp/OneDrive/Desktop/Medilink/index.html
```

### Optional Local Python Server
```bash
cd c:\Users\Hp\OneDrive\Desktop\Medilink
python -m http.server 8080
```
Open `http://localhost:8080` in your web browser.

---

## 5. Direct URL Parameter Routing

* **Direct Emergency NFC Tap**:
  ```
  https://<domain>/index.html?profile=ML-70821
  ```
  Immediately displays the emergency alert banner and scrolls to Interface 1 (Emergency Triage View).

* **Direct Doctor Portal Route**:
  ```
  https://<domain>/index.html#doctor-modal
  ```
  Directly opens Interface 2 (Doctor & Paramedic Portal).

---

*MediLink Emergency Healthcare Systems — Fast, accessible emergency medical access.*
