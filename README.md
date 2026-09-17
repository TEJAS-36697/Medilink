# MEDILINK — Emergency Medical Access, One Tap Away

[![Static Site](https://img.shields.io/badge/Architecture-Static%20Frontend-0284C7?style=for-the-badge)](./index.html)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages%20Ready-10B981?style=for-the-badge)](https://pages.github.com/)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Vanilla)-F59E0B?style=for-the-badge)](#technology-stack)
[![Hackathon Prototype](https://img.shields.io/badge/Status-Ideathon%20%2F%20Hackathon%20Demo-EF4444?style=for-the-badge)](#prototype-limitations--medical-disclaimer)

> **"The tag stores the link — the server stores the profile."**  
> *A friction-free, battery-less, NFC-enabled emergency medical information access prototype.*

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Concept & Architecture](#key-concept--architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [How NFC Works in Medilink](#how-nfc-works-in-medilink)
6. [How to Run Locally](#how-to-run-locally)
7. [How to Deploy Using GitHub Pages](#how-to-deploy-using-github-pages)
8. [Demo URLs & Query Parameter Routing](#demo-urls--query-parameter-routing)
9. [Prototype Limitations & Medical Disclaimer](#prototype-limitations--medical-disclaimer)
10. [Future Roadmap & Improvements](#future-roadmap--improvements)

---

## 1. Project Overview

**Medilink** is an emergency medical information access system engineered for critical situations (the clinical "Golden Hour"). 

Traditional medical alert bracelets suffer from major vulnerabilities:
* Metal engraved bracelets contain static, outdated information and cannot be updated when prescriptions change.
* Smartwatches and fitness trackers require daily charging and can die during accidents.
* Proprietary medical alert mobile apps require responders to unlock the phone, download an app, and create an account before viewing records.

Medilink solves this through a **hybrid physical-digital architecture**:
A passive, battery-free silicone wristband containing an NFC (Near Field Communication) microchip stores a short, immutable HTTPS URL. When any modern smartphone (iOS or Android) is tapped against the wristband, the phone automatically parses the NDEF record and opens the patient's verified emergency profile in the native web browser—**in under 2 seconds, with zero applications to install.**

---

## 2. Key Concept & Architecture

```
+------------------+          13.56 MHz RF          +---------------------+
|   PASSIVE NFC    | -----------------------------> |     SMARTPHONE      |
|    WRISTBAND     |    Passive Inductive Read      |  (iOS / Android)    |
| (NXP NTAG213/215)|                                | Native NFC Subsystem|
+------------------+                                +---------------------+
         |                                                     |
Stores short HTTPS URI:                                        | Launches native browser
"medilink.app?profile=ML-DEMO-001"                             | without app download
                                                               v
                                                    +---------------------+
                                                    |  MEDILINK WEB APP   |
                                                    |   (HTML5/CSS3/JS)   |
                                                    +---------------------+
                                                               |
                                                    Renders prioritized
                                                    clinical vital cards
                                                               v
                                                    +---------------------+
                                                    |  EMERGENCY PROFILE  |
                                                    | Blood, Allergies,   |
                                                    | 1-Touch Call Button |
                                                    +---------------------+
```

### Core Tenet
| Wearable NFC Tag | Secure Web Server |
| :--- | :--- |
| **STORES THE LINK** | **STORES THE PROFILE** |
| Passive, lightweight, zero battery consumption | Encrypted, dynamic, remotely updatable |
| Write-protected against physical tampering | Centralized access control & audit logging |
| Cost: < \$0.25 per silicone band | Instant remote profile revocation if lost |

---

## 3. Features

* **Instant Zero-Friction Emergency Access**:
  Paramedics and bystanders simply tap the wristband. No app install, no account setup, and no Bluetooth pairing needed.
* **Prioritized Clinical Interface**:
  High-contrast emergency dashboard highlighting life-or-death data:
  * High-visibility **Blood Group Card** (`O+`, `B+`, `A-` with Rh factor).
  * **Severe Allergies Box** (e.g., Penicillin anaphylaxis alert).
  * **Chronic Medical Conditions & Notes** (Asthma rescue inhaler notes, Type 1 Diabetes, Cardiac Pacemaker).
  * **Current Medications & Dosages**.
* **One-Touch Emergency Calling**:
  Direct `tel:` integration to immediately call designated primary contacts and attending physicians.
* **Interactive NFC Tap Simulation Engine**:
  A built-in software simulation demonstrating the 13.56 MHz RF proximity scan, NDEF parsing, and profile loading sequence with realistic audio-haptic feedback.
* **Multi-Profile Test Switcher**:
  Pre-loaded with 3 diverse clinical cases (`ML-DEMO-001`, `ML-DEMO-002`, `ML-DEMO-003`) to demonstrate system versatility to hackathon judges.
* **Paramedic Responder Tools**:
  * **Copy Summary**: One-click formatting of clinical data for rapid ER intake reports.
  * **Share Profile Link**: Native Web Share API integration with clipboard fallback.
* **Mobile-First Responsive Layout**:
  Engineered specifically for handheld paramedic and smartphone screens, with fluid scaling for desktop and tablet evaluation.

---

## 4. Technology Stack

Medilink was intentionally designed with **pure, native web standards** to eliminate dependency friction, build steps, and server prerequisites:

* **HTML5**: Semantic markup, ARIA accessibility attributes, and high-performance SVG iconography.
* **CSS3**: Modern custom properties (design tokens), CSS Grid, Flexbox, keyframe animations, and glassmorphism styling.
* **Vanilla JavaScript (ES6+)**: Zero framework overhead; pure native DOM manipulation, Web Audio API synthesis for scan chimes, Web Vibration API, and URL query parameter routing.
* **Zero Build Pipeline**: No `npm`, `vite`, `webpack`, `react`, or `node_modules` required.
* **Static Hosting Ready**: 100% compatible with GitHub Pages, Cloudflare Pages, Vercel, or raw local file execution.

---

## 5. How NFC Works in Medilink

1. **Hardware Selection**:
   The wristband incorporates an **NXP NTAG213 or NTAG215** integrated circuit. These operate at **13.56 MHz** conforming to the **ISO/IEC 14443 Type A** international standard.
2. **Inductive Magnetic Coupling**:
   The tag is completely passive (contains 0 batteries). When a smartphone’s NFC coil enters a 2–4 cm radius, the alternating magnetic field induces a small electric current in the tag’s antenna, powering the tag's microchip.
3. **NDEF (NFC Data Exchange Format)**:
   The tag’s EEPROM memory stores a standardized NDEF message containing a single **URI Record Type Definition (RTD)**:
   ```
   URI Record: https://[your-username].github.io/Medilink/index.html?profile=ML-DEMO-001
   ```
4. **OS Background Tag Reading**:
   * **iOS (iPhone XS and later)**: Native Background Tag Reading detects the URL automatically and presents a top notification banner without requiring any scanning app.
   * **Android**: The Android NFC service reads the NDEF record and broadcasts an `android.nfc.action.NDEF_DISCOVERED` intent, opening the URL directly in Chrome or the default browser.

---

## 6. How to Run Locally

Because Medilink is built with vanilla web technologies, running it locally requires **no build commands or package managers**:

### Option A: Double-Click (Zero Setup)
1. Clone or download this repository.
2. Navigate to the project directory:
   ```
   c:/Users/Hp/OneDrive/Desktop/Medilink/
   ```
3. Double-click **`index.html`** to open it directly in your web browser.

### Option B: Local HTTP Server (Recommended)
Running through an HTTP server ensures full URL query parameter and Web Audio API capabilities:

* **Using Python 3**:
  ```bash
  python -m http.server 8000
  ```
  Open your browser at `http://localhost:8000`.

* **Using VS Code Live Server**:
  Right-click `index.html` and select **"Open with Live Server"**.

---

## 7. How to Deploy Using GitHub Pages

Deploying Medilink live takes less than 2 minutes:

1. **Initialize Git & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of Medilink prototype"
   git branch -M main
   git remote add origin https://github.com/[YOUR-USERNAME]/[YOUR-REPO-NAME].git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   * Go to your repository on GitHub.
   * Click **Settings** (gear icon) > **Pages** (in the left sidebar).
   * Under **Build and deployment** > **Branch**:
     * Select `main` from the dropdown.
     * Select `/ (root)` folder.
     * Click **Save**.

3. **Access Your Live Site**:
   GitHub will provide your live deployment URL within 60 seconds:
   ```
   https://[YOUR-USERNAME].github.io/[YOUR-REPO-NAME]/
   ```

> [!NOTE]
> All asset paths in Medilink (`./style.css`, `./script.js`) use **relative syntax**, ensuring flawless operation across custom sub-paths on GitHub Pages without broken styling.

---

## 8. Demo URLs & Query Parameter Routing

Medilink's routing engine listens to the `profile` query parameter in the URL. You can directly demonstrate specific patient wristbands to judges using these links:

| Profile ID | Patient Name | Blood Group | Critical Clinical Indicator | Demo Link |
| :--- | :--- | :---: | :--- | :--- |
| **`ML-DEMO-001`** | Aarav Sharma | **O+** | Severe Penicillin Allergy • Asthma | `index.html?profile=ML-DEMO-001` |
| **`ML-DEMO-002`** | Priya Verma | **B+** | Type 1 Diabetes Mellitus (Insulin Dependent) | `index.html?profile=ML-DEMO-002` |
| **`ML-DEMO-003`** | David Miller | **A-** | Cardiac Pacemaker (MRI Contraindication) • Blood Thinners | `index.html?profile=ML-DEMO-003` |

### Live Demo URL Placeholder
```
https://[ADD-GITHUB-URL-HERE]/index.html?profile=ML-DEMO-001
```

*When accessed with a `?profile=` parameter, Medilink displays a prominent **Emergency Direct Access Banner** and focuses straight onto the verified clinical profile card.*

---

## 9. Prototype Limitations & Medical Disclaimer

> [!CAUTION]
> ### STRICT MEDICAL & HACKATHON DISCLAIMER
> Medilink is an academic engineering demonstration prototype developed exclusively for college hackathon and ideathon competitions.
> 
> * All names, clinical diagnoses, blood groups, medications, and phone numbers in this prototype are **entirely fictional**.
> * This prototype is **not connected to live electronic health records (EHR) or hospital databases**.
> * In a real medical emergency, bystanders must immediately contact certified local emergency medical services (e.g., 911 / 112 / 108 / 999).

### Current Prototype Limitations
1. **Client-Side Simulation**: Physical NFC writing and encrypted backend token handshakes are simulated on the client side.
2. **Open Access Demo**: All demo profiles are public without biometric or SMS PIN gates for presentation accessibility.
3. **No Real SMS Dispatch**: In this static prototype, emergency contact notifications are logged locally rather than dispatched via cellular gateways.

---

## 10. Future Roadmap & Improvements

For a commercial or clinical production deployment, Medilink will introduce:

1. **Tiered Access Control**:
   * *Public Emergency Layer*: Blood group, severe allergies, and primary contact phone number (accessible by any bystander).
   * *Restricted Paramedic Layer*: Full clinical history, surgical records, and prescription dosages unlocked only via verified EMT digital credentials or emergency SMS PIN.
2. **Real-Time Geostamped Alerting**:
   Trigger an automated SMS/WhatsApp alert with GPS coordinates to the patient's family whenever their wristband is scanned.
3. **Hardware Write-Protection & Anti-Cloning**:
   Lock NDEF memory pages using AES-128 cryptographic authentication (e.g., NXP NTAG 424 DNA chips) to prevent unauthorized tag duplication.
4. **Offline Progressive Web App (PWA) Caching**:
   Enable service worker caching for responder devices operating in subterranean or remote environments with intermittent cell reception.
5. **Regulatory Compliance Review**:
   Full architectural certification under **HIPAA (Health Insurance Portability and Accountability Act)**, **GDPR Article 9 (Special category health data)**, and India's **ABDM (Ayushman Bharat Digital Mission)**.

---

## Hackathon Team & Acknowledgments

* **Project**: Medilink
* **Category**: Healthcare IoT & Emergency Response Systems
* **Event**: College Engineering IDEATHON / Hackathon 2026
* **Repository**: `https://github.com/[ADD-GITHUB-URL-HERE]`

*Crafted with precision for rapid emergency medical intervention.*
