# MEDILINK — Emergency Medical Access, One Tap Away

[![Clean Healthcare UI](https://img.shields.io/badge/Theme-Clean%20White%20UI-0284C7?style=for-the-badge)](./index.html)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Pure%20Vanilla%20JS-16A34A?style=for-the-badge)](#technology-stack)
[![Static Ready](https://img.shields.io/badge/Deploy-GitHub%20Pages%20Ready-DC2626?style=for-the-badge)](https://pages.github.com/)

> **"The tag stores the link — the server stores the profile."**  
> *A simple, accessible, high-contrast emergency healthcare web system powered by passive NFC wearables.*

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Three-Tier Architecture](#2-three-tier-architecture)
   * [Tier 1: Emergency Flash Message (NFC Tap)](#tier-1-emergency-flash-display-message)
   * [Tier 2: Doctor / Paramedic Full Medical History Portal](#tier-2-doctor--paramedic-access-portal)
   * [Tier 3: Patient Registration & Upload Portal](#tier-3-patient-registration--record-upload-portal)
3. [Technology Stack](#3-technology-stack)
4. [How NFC Works in Medilink](#4-how-nfc-works-in-medilink)
5. [How to Run Locally](#5-how-to-run-locally)
6. [How to Deploy to GitHub Pages](#6-how-to-deploy-to-github-pages)
7. [Direct Profile URLs & NFC Parameter Routing](#7-direct-profile-urls--nfc-parameter-routing)

---

## 1. System Overview

**Medilink** is designed with a **clean white, simple, accessible interface** optimized for high-stress outdoor, roadside, and ambulance scenarios. 

To ensure strict patient privacy, the application **never displays other patients' data publicly**. Only the individual patient whose wristband is scanned (or whose ID is specified in the URL) is displayed.

---

## 2. Three-Tier Architecture

Medilink separates data access into three distinct layers based on clinical urgency and patient confidentiality:

```
                                  NFC WRISTBAND TAP
                                         |
                                         v
               +---------------------------------------------------+
               |    TIER 1: EMERGENCY FLASH MESSAGE (PUBLIC)       |
               |  • No login required                              |
               |  • High-visibility Blood Group (O+ Rh Positive)   |
               |  • Critical Allergies (e.g. Penicillin Anaphylaxis|
               |  • Immediate Conditions (e.g. Asthma Inhaler)     |
               |  • 1-Touch Call Button to Emergency Contact       |
               |  • First-Responder Triage Instructions            |
               +---------------------------------------------------+
                                         |
                       +-----------------+-----------------+
                       |                                   |
                       v                                   v
+------------------------------------+  +------------------------------------+
|  TIER 2: DOCTOR / PARAMEDIC ACCESS |  |     TIER 3: PATIENT PORTAL         |
|  • Requires Doctor ID & PIN        |  |  • Patient Sign In / Register      |
|  • Past Surgeries & Diagnoses      |  |  • Edit Emergency Flash Information|
|  • Full Prescription Schedule      |  |  • Upload Full Medical History     |
|  • Baseline Vitals & Lab Reports   |  |  • Attach Document PDFs / Reports  |
|  • Uploaded Patient Documents      |  |  • Generates NFC Wristband Link    |
+------------------------------------+  +------------------------------------+
```

### Tier 1: Emergency Flash Display Message
* **Triggered upon tapping the physical NFC wristband** with any modern smartphone.
* **Instant Life-Saving Data**: Displays immediate vital information for an injured or unconscious person:
  * Patient Name & Verified Profile ID (`ML-70821`).
  * Giant high-contrast **Blood Group Card** (`O+ Rh Positive`).
  * **Severe Allergies Alert** in high-contrast red warning box.
  * **Critical Chronic Condition Notes** (e.g., location of rescue inhaler or EpiPen).
  * **Large One-Touch Call Button** to primary emergency contact.
  * **Attached Profile URL** displayed permanently at the bottom of the card for easy copying or link sharing.

### Tier 2: Doctor & Paramedic Access Portal
* Certified doctors or paramedics can click **"Unlock Full Medical History"** or **"Doctor Login"**.
* Authenticate with Medical License ID & Security PIN (sample quick-access preset provided: Dr. V. Patel, License `MED-9942`, PIN `1234`).
* **Unlocks Comprehensive Records**:
  * Past Medical & Surgical History (e.g., Appendectomy, childhood asthma).
  * Complete Prescription Schedule, dosages, and dosing frequencies.
  * Clinical Baseline Vitals & Lab Norms (Resting BP, Heart Rate, SpO2, Blood Glucose).
  * Uploaded Diagnostic Documents (e.g., PFT reports, lab confirmations).
  * Automated access audit timestamp for patient security.

### Tier 3: Patient Registration & Record Upload Portal
* Accessible via **"Patient Sign In"** in the top navigation.
* Allows patients to create an account, register their profile, and manage their records:
  * **Part 1 (Public Flash Info)**: Full Name, Blood Group, Severe Allergies, Immediate Resuscitation Notes, Emergency Contact Phone.
  * **Part 2 (Doctor History)**: Past Surgeries, Current Prescriptions, Hospital Preference, Insurance ID, and Document/Report File Upload.
  * **Persistent Storage**: Changes are saved directly to browser `localStorage` and take effect immediately.
  * **Wristband Link**: Automatically generates their personal NFC URL (`index.html?profile=ML-70821`) ready to be written to any passive NTAG213/215 chip.

---

## 3. Technology Stack

Medilink requires **zero backend servers, zero build steps, and zero npm packages**:
* **HTML5**: Semantic, accessible markup with clean dialog modals and SVG medical iconography.
* **CSS3**: Clean white healthcare design system, high-contrast typography, mobile-first responsive layout.
* **Vanilla JavaScript (ES6+)**: `localStorage` data store, Web Audio API scan chimes, Web Vibration API haptics, dynamic URL parameter router, and clipboard integration.

---

## 4. How NFC Works in Medilink

1. **Passive Wristband Tag**: A waterproof silicone band containing an **NXP NTAG213** chip operates at **13.56 MHz** (ISO/IEC 14443 Type A) with **zero batteries**.
2. **Inductive Scan**: When an NFC smartphone approaches within 2–4 cm, inductive magnetic coupling energizes the tag.
3. **NDEF URI Record**: The phone's native operating system (iOS or Android) reads the stored HTTPS URL:
   ```
   https://[your-domain]/index.html?profile=ML-70821
   ```
4. **Native Browser Launch**: Opens directly in Safari, Chrome, or Edge without requiring any app download, instantly displaying the Tier 1 Flash message.

---

## 5. How to Run Locally

1. Navigate to the project directory:
   ```
   c:/Users/Hp/OneDrive/Desktop/Medilink/
   ```
2. Double-click **`index.html`** to open it directly in any web browser.
3. Or run with a local HTTP server:
   ```bash
   python -m http.server 8000
   ```
   Open `http://localhost:8000`.

---

## 6. How to Deploy to GitHub Pages

1. Push this directory to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: clean white UI with flash message and doctor portal"
   git branch -M main
   git remote add origin https://github.com/[YOUR-USERNAME]/[YOUR-REPO].git
   git push -u origin main
   ```
2. In GitHub, go to **Settings > Pages > Branch: main / (root)** and click **Save**.
3. Your application is live worldwide within 60 seconds.

---

## 7. Direct Profile URLs & NFC Parameter Routing

You can open the emergency flash card directly using the `?profile=` parameter:

* **Direct Emergency Flash URL**:
  ```
  index.html?profile=ML-70821
  ```
* When opened with a query parameter, Medilink displays the **Emergency Direct Access Bar** and smoothly focuses on the verified emergency flash card.

---

&copy; 2026 Medilink Emergency Healthcare Systems. All rights reserved.
