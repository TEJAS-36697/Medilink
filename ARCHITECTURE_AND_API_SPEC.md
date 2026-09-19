# MediLink System Architecture & REST API Specification
**Dual-Tiered Healthcare Data Access System: NFC Quick Triage vs. Authenticated QR Clinical Access**

*Document Version: 2.4.0 — Enterprise Health-Tech Architecture*  
*Target Compliance: HIPAA Security Rule (§ 164.312), HL7 FHIR R4, GDPR Article 9*

---

## 1. Executive Summary & Dual-Tier Paradigm

MediLink addresses the critical emergency medicine paradox: **Immediate life-saving triage data must be accessible instantly without authentication friction**, while **comprehensive electronic health records (EHR) must remain strictly protected under zero-trust credentialing and real-time audit compliance**.

To resolve this, MediLink establishes a strict physical and logical **Two-Tiered Data Access Architecture**:

```
                  ┌───────────────────────────────────────────────────────────┐
                  │                 PHYSICAL SMART WRISTBAND                  │
                  └─────────────────────────────┬─────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
        [BAND FRONT: PASSIVE NFC]                                     [BAND REVERSE: HIGH-CONTRAST QR]
                 │                                                             │
                 ▼                                                             ▼
       13.56 MHz RF Field Tap                                      Optical 2D Matrix Scan
   (ISO/IEC 14443-A / NDEF Type 2)                                (Directed to /auth/clinical-access)
                 │                                                             │
                 ▼                                                             ▼
     TIER 1: PUBLIC QUICK TRIAGE                                  TIER 2: CLINICAL EHR GATEWAY
                 │                                                             │
   • Instant, zero-authentication                                • Strict RBAC & Credential Check
   • Vital metadata only (Blood, Allergies,                       • Doctor/Paramedic Council License + PIN
     Chronic Conditions, Life-Sustaining Meds)                   • Facility Verification & Audit Entry
   • 1-Tap Emergency Family Calling                               • Full EHR, Surgeries, Scans & Labs
                 │                                                             │
                 ▼                                                             ▼
    GET /api/v1/triage/{nfc_id}                                 POST /api/v1/auth/clinical-login
          (Public Payload)                                     GET /api/v1/clinical/{patient_id}
                                                               (Bearer JWT Authenticated Payload)
```

---

## 2. Tech Stack Hierarchy

MediLink is engineered with a modular, 3-tier architectural stack:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. BASE TIER: PRESENTATION & ACCESSIBILITY                                  │
│    • Semantic HTML5: W3C / WAI-ARIA compliant clinical triage structures    │
│    • Modular CSS3: Custom properties, CSS Grid, Flexbox, 3D CSS transforms   │
│    • Health-Tech Color Palette: Deep Navy (#0B132B), Medical Blue (#0284C7), │
│      Mint Green (#10B981), Alert Red (#DC2626), Charcoal (#0F172A)         │
│    • Zero heavy JS framework bloat; 100% lightweight static deployment      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. LOGIC TIER: CLIENT-SIDE REACTION & HARDWARE SIMULATION                   │
│    • Vanilla JavaScript (ES6+): Zero runtime dependencies                   │
│    • Web Audio API & Vibration API: Tactile haptic & sound feedback         │
│    • Client-side Route Dispatcher: (?profile=..., /auth/clinical-access)    │
│    • LocalStorage State Engine: Instant profile persistence & cache         │
│    • Web Crypto API: Client-side cryptographic signature validation         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. BACKEND & SERVICES TIER: ENTERPRISE SPRING BOOT 3.x & DATA LAYER         │
│    • Application Framework: Java 17+ / Spring Boot 3.2.x (Spring MVC)       │
│    • Security: Spring Security 6, Stateless JWT Bearer Token validation     │
│    • RBAC Enforcement: ROLE_DOCTOR, ROLE_PARAMEDIC, ROLE_ER_STAFF           │
│    • Database: PostgreSQL 16 (JSONB for FHIR clinical data, ACID schemas)   │
│    • Caching & Rate Limiting: Redis 7.2 (Token bucket for triage endpoints)  │
│    • Audit Trail: Immutable PostgreSQL audit ledger (Clinician ID, Lat/Long)│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Schema & REST API Endpoint Design

### 3.1. Tier 1: Public Quick Triage Endpoint
- **HTTP Method**: `GET`
- **Path**: `/api/v1/triage/{nfc_id}`
- **Authentication**: `None` (Public Rate-Limited, max 30 req/min per IP)
- **Response Format**: `application/json`
- **Security Guardrail**: Strips all surgical histories, clinical notes, past consultations, and diagnostic attachments.

#### Request Example
```http
GET /api/v1/triage/NFC-70821-X9 HTTP/1.1
Host: api.medilink.health
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)
Accept: application/json
```

#### Response Payload (`200 OK`)
```json
{
  "status": "SUCCESS",
  "tier": 1,
  "access_type": "PUBLIC_EMERGENCY_TRIAGE",
  "timestamp": "2026-09-20T02:15:30Z",
  "data": {
    "triage_id": "TRG-70821",
    "patient_ref": "ML-70821",
    "demographics": {
      "full_name": "Aarav Sharma",
      "age": 28,
      "biological_sex": "Male",
      "date_of_birth_year": 1996,
      "city": "New Delhi, IN"
    },
    "critical_badges": {
      "blood_group": "O+",
      "blood_rh": "Rh Positive",
      "organ_donor": true
    },
    "critical_alerts": [
      {
        "category": "SEVERE_ALLERGY",
        "allergen": "Penicillin",
        "severity": "HIGH_ANAPHYLAXIS_RISK",
        "contraindication": "Beta-lactam antibiotics strictly contraindicated."
      },
      {
        "category": "CHRONIC_CONDITION",
        "condition": "Severe Persistent Asthma",
        "severity": "ACUTE_BRONCHOSPASM_RISK",
        "emergency_instructions": "Uses Albuterol rescue inhaler. Keep in upright sitting posture. Inhaler stored in backpack/pocket."
      }
    ],
    "life_sustaining_medications": [
      {
        "drug_name": "Albuterol Sulfate Inhaler",
        "dose": "90 mcg / actuation",
        "route": "Inhalation PRN",
        "indication": "Acute Bronchospasm Rescue"
      },
      {
        "drug_name": "Budesonide (Pulmicort)",
        "dose": "200 mcg",
        "route": "Inhalation Daily",
        "indication": "Airway Inflammation Controller"
      }
    ],
    "emergency_contacts": [
      {
        "name": "Sunita Sharma",
        "relationship": "Spouse",
        "telephone": "+919000000000",
        "priority": 1,
        "is_primary": true
      },
      {
        "name": "Emergency Dispatch",
        "relationship": "Trauma Hotline",
        "telephone": "112",
        "priority": 2,
        "is_primary": false
      }
    ],
    "preferred_facility": {
      "facility_name": "City Memorial Hospital & Trauma Center",
      "location": "New Delhi"
    }
  },
  "security_scope": {
    "phi_exposed": "MINIMAL_NECESSARY",
    "full_record_access": "REQUIRES_TIER_2_AUTHENTICATION",
    "qr_gateway_url": "https://medilink.health/auth/clinical-access?patient=ML-70821"
  }
}
```

---

### 3.2. Tier 2: Clinician Authentication Gateway
- **HTTP Method**: `POST`
- **Path**: `/api/v1/auth/clinical-login`
- **Authentication**: Validated against Medical Council Registry / EMS Authority
- **Request Format**: `application/json`

#### Request Payload
```json
{
  "license_id": "MED-9942",
  "pin": "1234",
  "role_requested": "ROLE_DOCTOR",
  "facility_id": "FAC-DELHI-004",
  "facility_name": "City Memorial Hospital - Trauma Bay 3",
  "patient_target": "ML-70821",
  "access_reason": "EMERGENCY_TRAUMA_EVALUATION"
}
```

#### Response Payload (`200 OK`)
```json
{
  "status": "AUTHENTICATED",
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1800,
  "clinician": {
    "license_id": "MED-9942",
    "full_name": "Dr. V. Patel, MD",
    "role": "ROLE_DOCTOR",
    "specialty": "Emergency Medicine & Critical Care",
    "facility": "City Memorial Hospital - Trauma Bay 3"
  },
  "audit_ticket": {
    "audit_id": "AUD-2026-992014-X1",
    "timestamp": "2026-09-20T02:15:35Z",
    "patient_notified": true
  }
}
```

---

### 3.3. Tier 2: Comprehensive Clinical EHR Endpoint
- **HTTP Method**: `GET`
- **Path**: `/api/v1/clinical/{patient_id}`
- **Authentication**: `Bearer <JWT>` (Requires `ROLE_DOCTOR`, `ROLE_PARAMEDIC`, or `ROLE_ER_STAFF`)
- **Headers**:
  - `Authorization: Bearer <JWT>`
  - `X-Facility-ID: FAC-DELHI-004`
- **Response Format**: `application/json`

#### Response Payload (`200 OK`)
```json
{
  "status": "SUCCESS",
  "tier": 2,
  "access_type": "AUTHENTICATED_CLINICAL_EHR",
  "patient_id": "ML-70821",
  "patient_profile": {
    "demographics": {
      "full_name": "Aarav Sharma",
      "dob": "1996-08-14",
      "age": 28,
      "gender": "Male",
      "blood_group": "O+",
      "insurance_provider": "MediShield National",
      "policy_id": "ML-99824"
    },
    "surgical_history": [
      {
        "procedure": "Laparoscopic Appendectomy",
        "date": "2018-04-12",
        "facility": "City Memorial Hospital",
        "surgeon": "Dr. S. Mehta, MS",
        "outcome": "Complete recovery without adhesions"
      },
      {
        "procedure": "Sports Concussion Management & CT Scan",
        "date": "2021-11-03",
        "facility": "Apollo Sports Care",
        "outcome": "Brain CT normal; zero lingering deficits"
      }
    ],
    "comprehensive_medication_schedule": [
      {
        "name": "Albuterol Sulfate Inhaler",
        "dosage": "90 mcg / actuation",
        "frequency": "1–2 puffs Q4-6H PRN",
        "indication": "Acute Bronchospasm Rescue",
        "prescribing_doctor": "Dr. R. Kapoor, Pulmonology"
      },
      {
        "name": "Budesonide (Pulmicort Turbuhaler)",
        "dosage": "200 mcg / inhalation",
        "frequency": "Once daily (Morning)",
        "indication": "Asthma Airway Controller",
        "prescribing_doctor": "Dr. R. Kapoor, Pulmonology"
      },
      {
        "name": "Cetirizine Hydrochloride",
        "dosage": "10 mg tablet",
        "frequency": "Once daily PRN",
        "indication": "Seasonal Allergic Rhinitis",
        "prescribing_doctor": "Dr. V. Patel, General Medicine"
      }
    ],
    "baseline_clinical_vitals": {
      "resting_blood_pressure": "118/76 mmHg",
      "resting_heart_rate": "68 bpm (Sinus Rhythm)",
      "baseline_spo2": "98% on room air",
      "fasting_blood_glucose": "92 mg/dL (Normoglycemic)",
      "last_recorded": "2026-01-14"
    },
    "diagnostic_documents": [
      {
        "doc_id": "DOC-PFT-2026-01",
        "title": "Pulmonary Function Test (PFT) Report",
        "file_type": "PDF",
        "size_kb": 842,
        "date_uploaded": "2026-01-12",
        "summary": "FEV1/FVC Ratio: 82%. Mild reversible airway obstruction responsive to bronchodilators.",
        "verified_by": "Dr. R. Kapoor, MD"
      },
      {
        "doc_id": "DOC-ALGY-2025-09",
        "title": "Penicillin Allergy IgE RAST Confirmation",
        "file_type": "PDF",
        "size_kb": 415,
        "date_uploaded": "2025-09-20",
        "summary": "High circulating IgE to Penicilloyl G & V. Severe anaphylactic reaction probability.",
        "verified_by": "Apollo Diagnostic Laboratory"
      }
    ]
  },
  "audit_compliance_entry": {
    "audit_id": "AUD-2026-992014-X1",
    "accessed_by_license": "MED-9942",
    "accessed_by_name": "Dr. V. Patel, MD",
    "role": "ROLE_DOCTOR",
    "facility": "City Memorial Hospital - Trauma Bay 3",
    "timestamp": "2026-09-20T02:15:35Z",
    "logged_to_immutable_ledger": true
  }
}
```

---

## 4. Spring Boot 3.x Implementation Architecture

### 4.1. Security Configuration (`SecurityConfig.java`)
```java
package health.medilink.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Tier 1: Public Triage endpoints (NFC access)
                .requestMatchers("/api/v1/triage/**").permitAll()
                // Authentication Gateway
                .requestMatchers("/api/v1/auth/**").permitAll()
                // Static Assets
                .requestMatchers("/", "/index.html", "/style.css", "/script.js", "/assets/**").permitAll()
                // Tier 2: Authenticated Clinical EHR (QR Code routes)
                .requestMatchers("/api/v1/clinical/**").hasAnyRole("DOCTOR", "PARAMEDIC", "ER_STAFF")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### 4.2. Dual-Tier Controller Implementation
```java
package health.medilink.controller;

import health.medilink.dto.PublicTriageDto;
import health.medilink.dto.FullClinicalEhrDto;
import health.medilink.service.TriageService;
import health.medilink.service.ClinicalEhrService;
import health.medilink.service.AuditLoggingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class MediLinkDualTierController {

    private final TriageService triageService;
    private final ClinicalEhrService ehrService;
    private final AuditLoggingService auditService;

    public MediLinkDualTierController(TriageService triageService,
                                      ClinicalEhrService ehrService,
                                      AuditLoggingService auditService) {
        this.triageService = triageService;
        this.ehrService = ehrService;
        this.auditService = auditService;
    }

    /**
     * TIER 1: Public Quick Triage (NFC Tap)
     * No credentials required. Returns vital triage metadata only.
     */
    @GetMapping("/triage/{nfcId}")
    public ResponseEntity<PublicTriageDto> getTriageMetadata(@PathVariable String nfcId) {
        PublicTriageDto triage = triageService.resolveByNfcTag(nfcId);
        return ResponseEntity.ok(triage);
    }

    /**
     * TIER 2: Full Clinical Records (Authenticated QR Access)
     * Strictly protected by JWT RBAC. Logs real-time audit record.
     */
    @GetMapping("/clinical/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PARAMEDIC', 'ER_STAFF')")
    public ResponseEntity<FullClinicalEhrDto> getFullClinicalRecords(
            @PathVariable String patientId,
            @AuthenticationPrincipal ClinicianUserDetails clinician,
            HttpServletRequest request) {

        // 1. Log Real-time Access Audit Event
        auditService.recordAccessEvent(
            clinician.getLicenseId(),
            clinician.getRole(),
            clinician.getFacilityName(),
            patientId,
            request.getRemoteAddr()
        );

        // 2. Fetch and return comprehensive EHR
        FullClinicalEhrDto ehr = ehrService.getClinicalRecord(patientId);
        return ResponseEntity.ok(ehr);
    }
}
```

---

## 5. PostgreSQL HIPAA Audit Ledger Schema

Every access to Tier 2 clinical data is committed to an immutable append-only audit table:

```sql
-- PostgreSQL Audit Ledger Schema
CREATE TABLE IF NOT EXISTS audit_access_logs (
    audit_id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(32) NOT NULL,
    clinician_id VARCHAR(32) NOT NULL,
    clinician_role VARCHAR(32) NOT NULL,
    facility_id VARCHAR(64) NOT NULL,
    facility_name VARCHAR(128) NOT NULL,
    access_reason VARCHAR(255) DEFAULT 'EMERGENCY_ACCESS',
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    access_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    security_signature VARCHAR(256) NOT NULL
);

CREATE INDEX idx_audit_patient_time ON audit_access_logs(patient_id, access_timestamp DESC);
CREATE INDEX idx_audit_clinician ON audit_access_logs(clinician_id);
```

---

## 6. Physical Wristband Hardware Specification

| Attribute | Front Face (Tier 1) | Reverse Face (Tier 2) |
|---|---|---|
| **Primary Technology** | High-frequency NFC Transponder (13.56 MHz) | High-contrast 2D QR Matrix (Optical) |
| **Standard / Chip** | ISO/IEC 14443-A • NXP NTAG213 / NTAG216 | ISO/IEC 18004 (Model 2, ECC Level H - 30% recovery) |
| **Energy Source** | Passive RF Induction (No Battery Required) | Passive Optical (Zero Power Required) |
| **Data Stored On Tag** | Short URI (`https://medilink.health/triage/NFC-70821`) | Gateway URI (`https://medilink.health/auth/clinical-access?p=ML-70821`) |
| **Target User** | First Responders, Police, Good Samaritans | Licensed ER Physicians, Trauma Surgeons, Paramedics |
| **Durability** | IP68 Waterproof, Medical-grade Hypoallergenic Silicone | Laser-etched high contrast, Scratch-resistant coating |

---

*MediLink — The tag stores the link; the secure server stores the profile.*
