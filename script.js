/**
 * ============================================================================
 * MEDILINK — Emergency Medical Access System
 * Application Logic, Local Hardware Encryption & Dual-Scan Engine: script.js
 * Interface 1 (Front NFC Triage) vs. Interface 2 (Reverse QR Doctor Portal)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. DATA STORE & ENCRYPTION CONFIGURATION (LOCAL STORAGE SECURITY)
  // --------------------------------------------------------------------------
  const STORAGE_PATIENT_KEY = 'medilink_patient_record_v4';
  const STORAGE_ENCRYPTED_VAULT_KEY = 'medilink_encrypted_vault_v4';
  const STORAGE_AUDIT_KEY = 'medilink_audit_ledger_v4';

  // Default Patient Record (Interface 1 Public Triage Data)
  const DEFAULT_PATIENT_TRIAGE = {
    id: 'ML-70821',
    nfcId: 'NFC-70821-X9',
    name: 'Aarav Sharma',
    initials: 'AS',
    dob: '14/08/1996',
    age: 28,
    gender: 'Male',
    city: 'New Delhi, IN',
    bloodGroup: 'O+',
    bloodRh: 'Rh Positive',
    donor: 'Registered Organ Donor (Yes)',
    allergy: 'Penicillin (Severe Anaphylaxis Risk. Beta-lactam antibiotics strictly contraindicated)',
    condition: 'Severe Asthma: Uses Albuterol rescue inhaler. Keep upright. Inhaler in backpack/pocket.',
    lifeMeds: [
      { name: 'Albuterol Sulfate Inhaler', dose: '90 mcg / actuation (PRN for Bronchospasm)' },
      { name: 'Budesonide (Pulmicort)', dose: '200 mcg / daily (Airway Controller)' }
    ],
    contactName: 'Sunita Sharma (Spouse)',
    contactPhone: '+91 90000 00000',
    hospital: 'City Memorial Hospital & Trauma Center',
    insurance: 'MediShield National • Policy #ML-99824'
  };

  // Default Sensitive Clinical EHR (Encrypted for Interface 2 Doctor Portal)
  const DEFAULT_CLINICAL_EHR = {
    surgeries: [
      'Appendectomy (2018): Laparoscopic removal at City Memorial Hospital. Full recovery.',
      'Childhood Asthma (Diagnosed 2006): Moderate persistent bronchial asthma. Triggered by cold air and pollen allergens.',
      'Mild Concussion (2021): Sports injury. Brain CT normal; full cognitive resolution.'
    ],
    prescriptions: [
      { name: 'Albuterol Sulfate Inhaler', dose: '90 mcg / actuation', freq: '1–2 puffs Q4-6H PRN', ind: 'Acute Bronchospasm Rescue' },
      { name: 'Budesonide (Pulmicort)', dose: '200 mcg / inhalation', freq: 'Once daily (Morning)', ind: 'Airway Controller / Corticosteroid' },
      { name: 'Cetirizine HCl', dose: '10 mg tablet', freq: 'Once daily PRN', ind: 'Seasonal Allergic Rhinitis' }
    ],
    vitals: {
      bp: '118/76 mmHg',
      hr: '68 bpm (Sinus Rhythm)',
      spo2: '98% on room air',
      glucose: '92 mg/dL (Normal)'
    },
    documents: [
      { name: 'Pulmonary Function Test (PFT) Report (PDF)', meta: 'Uploaded by patient • FEV1/FVC Ratio: 82% • Verified' },
      { name: 'Penicillin Allergy Confirmation & Anaphylaxis Workup (PDF)', meta: 'Apollo Diagnostic Center • IgE RAST Positive • Verified' }
    ]
  };

  const DEFAULT_AUDIT_LOGS = [
    {
      id: 'AUD-882104',
      clinician: 'MED-9942 (Dr. V. Patel, MD)',
      role: 'Licensed Physician',
      facility: 'City Memorial Hospital — Trauma Bay 3',
      timestamp: '2026-09-18 14:22:10 IST',
      status: 'VERIFIED & COMMITTED'
    },
    {
      id: 'AUD-881920',
      clinician: 'EMT-881 (R. Sen, Paramedic)',
      role: 'Certified Paramedic',
      facility: 'Metro EMS Unit 12 — Rapid Dispatch',
      timestamp: '2026-09-15 09:14:45 IST',
      status: 'VERIFIED & COMMITTED'
    }
  ];

  // --------------------------------------------------------------------------
  // 2. WEB CRYPTO API AES-GCM ENCRYPTION ENGINE
  // --------------------------------------------------------------------------
  // Helper to convert buffers
  function bufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base64ToBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Derive AES-GCM key from PIN using PBKDF2
  async function deriveAesKey(pin, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(pin),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt JSON payload with PIN
  async function encryptClinicalRecord(dataObject, pin) {
    try {
      if (!window.crypto || !window.crypto.subtle) {
        // Fallback for non-https/incompatible environments
        return {
          fallback: true,
          payload: window.btoa(encodeURIComponent(JSON.stringify(dataObject)))
        };
      }

      const enc = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveAesKey(pin, salt);

      const encodedData = enc.encode(JSON.stringify(dataObject));
      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedData
      );

      return {
        ciphertext: bufferToBase64(ciphertext),
        iv: bufferToBase64(iv),
        salt: bufferToBase64(salt),
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      console.warn('Encryption fallback applied', e);
      return {
        fallback: true,
        payload: window.btoa(encodeURIComponent(JSON.stringify(dataObject)))
      };
    }
  }

  // Decrypt JSON payload with PIN
  async function decryptClinicalRecord(vaultObject, pin) {
    try {
      if (!vaultObject) return null;
      if (vaultObject.fallback) {
        return JSON.parse(decodeURIComponent(window.atob(vaultObject.payload)));
      }

      const salt = new Uint8Array(base64ToBuffer(vaultObject.salt));
      const iv = new Uint8Array(base64ToBuffer(vaultObject.iv));
      const ciphertext = base64ToBuffer(vaultObject.ciphertext);

      const key = await deriveAesKey(pin, salt);
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      return JSON.parse(dec.decode(decrypted));
    } catch (e) {
      throw new Error('Invalid Security PIN. Decryption authentication failed.');
    }
  }

  // --------------------------------------------------------------------------
  // 3. STORAGE HELPERS
  // --------------------------------------------------------------------------
  function loadTriageData() {
    try {
      const saved = localStorage.getItem(STORAGE_PATIENT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Triage store read error', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PATIENT_TRIAGE));
  }

  function saveTriageData(data) {
    try {
      localStorage.setItem(STORAGE_PATIENT_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Triage store write error', e);
    }
  }

  function loadEncryptedVault() {
    try {
      const saved = localStorage.getItem(STORAGE_ENCRYPTED_VAULT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Vault read error', e);
    }
    return null;
  }

  function saveEncryptedVault(vaultObj) {
    try {
      localStorage.setItem(STORAGE_ENCRYPTED_VAULT_KEY, JSON.stringify(vaultObj));
    } catch (e) {
      console.warn('Vault write error', e);
    }
  }

  function loadAuditLogs() {
    try {
      const saved = localStorage.getItem(STORAGE_AUDIT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Audit ledger read error', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_AUDIT_LOGS));
  }

  function recordAuditLog(entry) {
    const logs = loadAuditLogs();
    logs.unshift(entry);
    try {
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Audit ledger write error', e);
    }
    return logs;
  }

  // Seed default encrypted vault if not present
  async function seedInitialVault() {
    const existing = loadEncryptedVault();
    if (!existing) {
      const initialVault = await encryptClinicalRecord(DEFAULT_CLINICAL_EHR, '1234');
      saveEncryptedVault(initialVault);
    }
  }

  let activePatient = loadTriageData();
  let isHardwareBusy = false;
  let audioCtx = null;
  let activeClinicianSession = null;

  // --------------------------------------------------------------------------
  // 4. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  // Banner & Nav
  const directBanner = document.getElementById('direct-profile-banner');
  const bannerTitleText = document.getElementById('banner-title-text');
  const bannerDescText = document.getElementById('banner-desc-text');
  const btnBannerExit = document.getElementById('btn-banner-exit');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Video Tour
  const btnOpenVideoTour = document.getElementById('btn-open-video-tour');
  const videoTourModal = document.getElementById('video-tour-modal');
  const btnCloseVideoModal = document.getElementById('btn-close-video-modal');
  const btnVideoJumpSim = document.getElementById('btn-video-jump-simulator');

  // Wristband Scanner Elements
  const wristband3dCard = document.getElementById('wristband-3d-card');
  const wristbandFrontTarget = document.getElementById('wristband-front-target');
  const wristbandBackTarget = document.getElementById('wristband-back-target');
  const btnSimulateNfcTap = document.getElementById('btn-simulate-nfc-tap');
  const btnSimulateQrScan = document.getElementById('btn-simulate-qr-scan');
  const btnFlipWristband = document.getElementById('btn-flip-wristband');
  const flipBtnText = document.getElementById('flip-btn-text');
  const simHwStatus = document.getElementById('sim-hw-status');
  const simConsoleBody = document.getElementById('sim-console-body');
  const simQrScanHotspot = document.getElementById('sim-qr-scan-hotspot');
  const progStep1 = document.getElementById('prog-step-1');
  const progStep2 = document.getElementById('prog-step-2');
  const progStep3 = document.getElementById('prog-step-3');
  const progStep4 = document.getElementById('prog-step-4');

  // Interface 1: Emergency Triage Elements
  const patientProfileCard = document.getElementById('patient-profile-card');
  const patientAvatarInitials = document.getElementById('patient-avatar-initials');
  const patientProfileId = document.getElementById('patient-profile-id');
  const patientName = document.getElementById('patient-name');
  const patientDemographics = document.getElementById('patient-demographics');
  const patientBloodGroup = document.getElementById('patient-blood-group');
  const patientBloodRh = document.getElementById('patient-blood-rh');
  const patientAllergies = document.getElementById('patient-allergies');
  const patientMedicalNotes = document.getElementById('patient-medical-notes');
  const tier1LifeMedications = document.getElementById('tier1-life-medications');
  const patientContactName = document.getElementById('patient-contact-name');
  const patientContactPhone = document.getElementById('patient-contact-phone');
  const patientContactBtn = document.getElementById('patient-contact-btn');
  const patientHospital = document.getElementById('patient-hospital');
  const patientDonor = document.getElementById('patient-donor');
  const patientInsurance = document.getElementById('patient-insurance');
  const displayProfileUrl = document.getElementById('display-profile-url');
  const btnCopyProfileUrl = document.getElementById('btn-copy-profile-url');
  const btnDirectLink = document.getElementById('btn-direct-link');

  // Interface 2: Doctor & Paramedic Portal Elements
  const doctorModal = document.getElementById('doctor-modal');
  const btnHeaderDoctor = document.getElementById('btn-header-doctor');
  const navBtnDoctorLogin = document.getElementById('nav-btn-doctor-login');
  const btnOpenDoctorPortal = document.getElementById('btn-open-doctor-portal');
  const btnCloseDoctorModal = document.getElementById('btn-close-doctor-modal');
  const formDoctorLogin = document.getElementById('form-doctor-login');
  const doctorRole = document.getElementById('doctor-role');
  const doctorLicenseId = document.getElementById('doctor-license-id');
  const doctorFacility = document.getElementById('doctor-facility');
  const doctorPin = document.getElementById('doctor-pin');
  const btnFillDoctorCreds = document.getElementById('btn-fill-doctor-creds');
  const doctorLoginView = document.getElementById('doctor-login-view');
  const doctorUnlockedView = document.getElementById('doctor-unlocked-view');
  const btnDoctorLogout = document.getElementById('btn-doctor-logout');
  const sessionClinicianText = document.getElementById('session-clinician-text');
  const fullHistorySurgeries = document.getElementById('full-history-surgeries');
  const fullMedsTableBody = document.getElementById('full-meds-table-body');
  const fullHistoryDocs = document.getElementById('full-history-docs');
  const liveAuditTableBody = document.getElementById('live-audit-table-body');

  // Patient Portal Elements
  const patientModal = document.getElementById('patient-modal');
  const btnHeaderPatient = document.getElementById('btn-header-patient');
  const navBtnPatientPortal = document.getElementById('nav-btn-patient-portal');
  const btnClosePatientModal = document.getElementById('btn-close-patient-modal');
  const formPatientRecords = document.getElementById('form-patient-records');
  const formPatientName = document.getElementById('form-patient-name');
  const formPatientBlood = document.getElementById('form-patient-blood');
  const formPatientDob = document.getElementById('form-patient-dob');
  const formPatientGender = document.getElementById('form-patient-gender');
  const formPatientAllergy = document.getElementById('form-patient-allergy');
  const formPatientCondition = document.getElementById('form-patient-condition');
  const formContactName = document.getElementById('form-contact-name');
  const formContactPhone = document.getElementById('form-contact-phone');
  const formSurgeries = document.getElementById('form-surgeries');
  const formPrescriptions = document.getElementById('form-prescriptions');
  const formHospital = document.getElementById('form-hospital');
  const formInsurance = document.getElementById('form-insurance');
  const mockDropzone = document.getElementById('mock-dropzone');
  const patientDocUpload = document.getElementById('patient-doc-upload');
  const uploadStatusList = document.getElementById('upload-status-list');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // --------------------------------------------------------------------------
  // 5. AUDIO & HAPTIC FEEDBACK
  // --------------------------------------------------------------------------
  function playBeep(type = 'nfc') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'nfc') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(780, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1180, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'qr') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.22);
      }
    } catch (e) {
      // Audio skipped
    }
  }

  function triggerHaptics(pattern = [40, 30, 70]) {
    try {
      if ('vibrate' in navigator) navigator.vibrate(pattern);
    } catch (e) {
      // Vibration not supported
    }
  }

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function getFullProfileUrl(profileId) {
    const cleanBase = window.location.href.split('?')[0].split('#')[0];
    return `${cleanBase}?profile=${profileId}`;
  }

  // --------------------------------------------------------------------------
  // 6. RENDERING ENGINES
  // --------------------------------------------------------------------------
  // Render Interface 1: Emergency Triage Card
  function renderTriageProfile(data, shouldScroll = false) {
    if (!data) data = activePatient;

    const nameParts = (data.name || 'Patient').trim().split(/\s+/);
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();

    if (patientAvatarInitials) patientAvatarInitials.textContent = initials;
    if (patientProfileId) patientProfileId.textContent = `ID: ${data.id || 'ML-70821'}`;
    if (patientName) patientName.textContent = data.name;
    if (patientDemographics) {
      patientDemographics.textContent = `Age: ${data.age || 28} • ${data.gender || 'Male'} • DOB: ${data.dob || '14/08/1996'} • ${data.city || 'New Delhi, IN'}`;
    }

    if (patientBloodGroup) patientBloodGroup.textContent = data.bloodGroup;
    if (patientBloodRh) patientBloodRh.textContent = data.bloodRh || (data.bloodGroup.includes('+') ? 'Rh Positive' : 'Rh Negative');

    if (patientAllergies) {
      patientAllergies.innerHTML = `
        <div class="allergy-tag severe">
          <strong>${data.allergy}</strong>
        </div>
      `;
    }

    if (patientMedicalNotes) {
      patientMedicalNotes.innerHTML = `
        <div class="condition-item">
          <strong>${data.condition}</strong>
        </div>
      `;
    }

    if (tier1LifeMedications) {
      const meds = data.lifeMeds || [
        { name: 'Albuterol Sulfate Inhaler', dose: '90 mcg / actuation (PRN for Bronchospasm)' },
        { name: 'Budesonide (Pulmicort)', dose: '200 mcg / daily (Airway Controller)' }
      ];
      let medsHtml = '';
      meds.forEach(m => {
        medsHtml += `
          <div class="life-med-tag">
            <span class="med-name">${m.name}</span>
            <span class="med-dose">${m.dose}</span>
          </div>
        `;
      });
      tier1LifeMedications.innerHTML = medsHtml;
    }

    if (patientContactName) patientContactName.textContent = data.contactName;
    if (patientContactPhone) patientContactPhone.textContent = data.contactPhone;
    if (patientContactBtn) {
      const cleanPhone = (data.contactPhone || '').replace(/[^0-9+]/g, '');
      patientContactBtn.setAttribute('href', `tel:${cleanPhone}`);
    }

    if (patientHospital) patientHospital.textContent = data.hospital || 'City Memorial Hospital';
    if (patientDonor) patientDonor.textContent = data.donor || 'Registered Organ Donor (Yes)';
    if (patientInsurance) patientInsurance.textContent = data.insurance || 'MediShield National';

    const fullUrl = getFullProfileUrl(data.id || 'ML-70821');
    if (displayProfileUrl) displayProfileUrl.textContent = fullUrl;
    if (btnDirectLink) btnDirectLink.setAttribute('href', fullUrl);

    if (patientProfileCard) {
      patientProfileCard.style.transition = 'box-shadow 0.3s ease';
      patientProfileCard.style.boxShadow = '0 0 25px rgba(14, 165, 233, 0.35)';
      setTimeout(() => { patientProfileCard.style.boxShadow = ''; }, 700);
    }

    if (shouldScroll) {
      const profileEl = document.getElementById('profile');
      if (profileEl) profileEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Render Interface 2: Doctor Portal Decrypted View
  function renderDoctorUnlockedView(clinicalData) {
    if (!clinicalData) clinicalData = DEFAULT_CLINICAL_EHR;

    // Surgeries List
    if (fullHistorySurgeries) {
      let html = '<ul class="clinical-record-list">';
      if (Array.isArray(clinicalData.surgeries)) {
        clinicalData.surgeries.forEach(s => { html += `<li>${s}</li>`; });
      } else {
        html += `<li>${clinicalData.surgeries}</li>`;
      }
      html += '</ul>';
      fullHistorySurgeries.innerHTML = html;
    }

    // Prescription Table
    if (fullMedsTableBody) {
      let rows = '';
      if (Array.isArray(clinicalData.prescriptions)) {
        clinicalData.prescriptions.forEach(p => {
          rows += `
            <tr>
              <td><strong>${p.name}</strong></td>
              <td>${p.dose}</td>
              <td>${p.freq}</td>
              <td>${p.ind}</td>
            </tr>
          `;
        });
      } else {
        rows = `<tr><td colspan="4">${clinicalData.prescriptions}</td></tr>`;
      }
      fullMedsTableBody.innerHTML = rows;
    }

    // Diagnostic Documents
    if (fullHistoryDocs) {
      let docsHtml = '<ul class="uploaded-docs-list">';
      if (Array.isArray(clinicalData.documents)) {
        clinicalData.documents.forEach(d => {
          docsHtml += `
            <li class="doc-item">
              <span class="doc-icon">📄</span>
              <div class="doc-meta">
                <strong>${d.name}</strong>
                <small>${d.meta}</small>
              </div>
              <span class="doc-verified-badge">Verified EHR</span>
            </li>
          `;
        });
      }
      docsHtml += '</ul>';
      fullHistoryDocs.innerHTML = docsHtml;
    }

    // Render Real-time Audit Ledger
    renderAuditLedger();
  }

  function renderAuditLedger() {
    if (!liveAuditTableBody) return;
    const logs = loadAuditLogs();
    let rowsHtml = '';
    logs.forEach(log => {
      rowsHtml += `
        <tr>
          <td><code>${log.id}</code></td>
          <td><strong>${log.clinician}</strong></td>
          <td><span class="audit-status-badge">${log.role}</span></td>
          <td>${log.facility}</td>
          <td><small>${log.timestamp}</small></td>
          <td><span class="audit-status-badge">${log.status}</span></td>
        </tr>
      `;
    });
    liveAuditTableBody.innerHTML = rowsHtml;
  }

  // --------------------------------------------------------------------------
  // 7. DUAL SCANNER SIMULATION ENGINE
  // --------------------------------------------------------------------------
  function appendConsoleLog(message, type = 'info') {
    if (!simConsoleBody) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const line = document.createElement('div');
    line.className = `log-row ${type}`;
    line.textContent = `[${timeStr}] ${message}`;
    simConsoleBody.appendChild(line);
    simConsoleBody.scrollTop = simConsoleBody.scrollHeight;
  }

  function resetProgressSegments() {
    [progStep1, progStep2, progStep3, progStep4].forEach(step => {
      if (step) step.classList.remove('active', 'complete');
    });
  }

  function flipWristband(toBack = null) {
    if (!wristband3dCard) return;
    const isCurrentlyFlipped = wristband3dCard.classList.contains('flipped');
    const shouldFlipToBack = toBack !== null ? toBack : !isCurrentlyFlipped;

    if (shouldFlipToBack) {
      wristband3dCard.classList.add('flipped');
      if (flipBtnText) flipBtnText.textContent = 'Flip Wristband (Show Front NFC Side)';
      appendConsoleLog('Wristband flipped: Showing reverse QR face.', 'info');
    } else {
      wristband3dCard.classList.remove('flipped');
      if (flipBtnText) flipBtnText.textContent = 'Flip Wristband (Show Reverse QR Side)';
      appendConsoleLog('Wristband flipped: Showing front NFC face.', 'info');
    }
  }

  // INTERFACE 1 ACTION: Front NFC Tap
  function runFrontNfcTap() {
    if (isHardwareBusy) return;
    isHardwareBusy = true;

    flipWristband(false);

    if (btnSimulateNfcTap) btnSimulateNfcTap.disabled = true;
    if (simHwStatus) {
      simHwStatus.textContent = 'NFC SCANNING';
      simHwStatus.classList.add('scanning');
    }

    resetProgressSegments();
    appendConsoleLog('NFC transponder field active. Reading front tag...', 'rf');

    progStep1.classList.add('active');

    setTimeout(() => {
      progStep1.classList.remove('active');
      progStep1.classList.add('complete');
      progStep2.classList.add('active');
      appendConsoleLog('NFC tag detected: Loading verified emergency triage records...', 'ndef');
    }, 350);

    setTimeout(() => {
      progStep2.classList.remove('active');
      progStep2.classList.add('complete');
      progStep3.classList.add('active');
      appendConsoleLog(`Patient verified: ${activePatient.name} (Blood Group: ${activePatient.bloodGroup})`, 'ndef');
    }, 750);

    setTimeout(() => {
      progStep3.classList.remove('active');
      progStep3.classList.add('complete');
      progStep4.classList.add('active');

      playBeep('nfc');
      triggerHaptics([40, 30, 70]);

      appendConsoleLog('Displaying Interface 1: Emergency Triage View.', 'success');
    }, 1150);

    setTimeout(() => {
      progStep4.classList.remove('active');
      progStep4.classList.add('complete');

      if (simHwStatus) {
        simHwStatus.textContent = 'TRIAGE DISPLAYED';
        simHwStatus.classList.remove('scanning');
      }

      if (btnSimulateNfcTap) btnSimulateNfcTap.disabled = false;
      isHardwareBusy = false;

      renderTriageProfile(activePatient, true);
      showToast(`Emergency Triage: ${activePatient.name} (${activePatient.bloodGroup})`);
    }, 1500);
  }

  // INTERFACE 2 ACTION: Reverse QR Code Scan
  function runBackQrScan() {
    if (isHardwareBusy) return;
    isHardwareBusy = true;

    flipWristband(true);

    if (btnSimulateQrScan) btnSimulateQrScan.disabled = true;
    if (simQrScanHotspot) simQrScanHotspot.classList.add('scanning-laser');

    if (simHwStatus) {
      simHwStatus.textContent = 'QR SCANNING';
      simHwStatus.classList.add('scanning');
    }

    resetProgressSegments();
    appendConsoleLog('Optical scanner locked on reverse QR matrix.', 'rf');

    progStep1.classList.add('active');

    setTimeout(() => {
      progStep1.classList.remove('active');
      progStep1.classList.add('complete');
      progStep2.classList.add('active');
      appendConsoleLog('Decoded medical gateway link: Opening Doctor Portal...', 'ndef');
    }, 350);

    setTimeout(() => {
      progStep2.classList.remove('active');
      progStep2.classList.add('complete');
      progStep3.classList.add('active');
      appendConsoleLog('Security barrier presented: Practitioner authentication required.', 'ndef');
    }, 700);

    setTimeout(() => {
      progStep3.classList.remove('active');
      progStep3.classList.add('complete');
      progStep4.classList.add('active');

      playBeep('qr');
      triggerHaptics([80, 50, 80]);

      appendConsoleLog('Displaying Interface 2: Medical Personnel Portal.', 'success');
    }, 1050);

    setTimeout(() => {
      progStep4.classList.remove('active');
      progStep4.classList.add('complete');

      if (simQrScanHotspot) simQrScanHotspot.classList.remove('scanning-laser');
      if (simHwStatus) {
        simHwStatus.textContent = 'DOCTOR PORTAL ACTIVE';
        simHwStatus.classList.remove('scanning');
      }

      if (btnSimulateQrScan) btnSimulateQrScan.disabled = false;
      isHardwareBusy = false;

      openDoctorModal();
      showToast('QR Scanned: Opened Medical Personnel Portal');
    }, 1400);
  }

  // --------------------------------------------------------------------------
  // 8. DOCTOR & PARAMEDIC PORTAL (INTERFACE 2 DECRYPTION)
  // --------------------------------------------------------------------------
  function openDoctorModal() {
    if (!doctorModal) return;
    doctorModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeDoctorModal() {
    if (!doctorModal) return;
    doctorModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  async function handleDoctorLoginSubmit(e) {
    e.preventDefault();
    const role = (doctorRole ? doctorRole.value : 'ROLE_DOCTOR');
    const license = (doctorLicenseId ? doctorLicenseId.value : '').trim();
    const facility = (doctorFacility ? doctorFacility.value : 'City Memorial Hospital').trim();
    const pin = (doctorPin ? doctorPin.value : '').trim();

    if (!license || !pin) {
      showToast('Please enter your License ID and Security PIN.');
      return;
    }

    try {
      // 1. Decrypt Clinical Record using the PIN
      const vaultObj = loadEncryptedVault();
      let decryptedClinical = null;

      if (vaultObj) {
        decryptedClinical = await decryptClinicalRecord(vaultObj, pin);
      } else {
        // Fallback default if vault not yet initialized
        if (pin === '1234') {
          decryptedClinical = DEFAULT_CLINICAL_EHR;
        } else {
          throw new Error('Incorrect Security PIN. Decryption failed.');
        }
      }

      // 2. Log Access in Local Storage
      const now = new Date();
      const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} IST`;
      const auditId = 'AUD-' + Math.floor(100000 + Math.random() * 900000);

      const practitionerName = license === 'MED-9942' ? 'Dr. V. Patel, MD' : `Practitioner (${license})`;
      const newAudit = {
        id: auditId,
        clinician: `${license} (${practitionerName})`,
        role: role.replace('ROLE_', ''),
        facility: facility,
        timestamp: timestampStr,
        status: 'DECRYPTED & VERIFIED'
      };

      recordAuditLog(newAudit);

      // 3. Render Decrypted View
      if (sessionClinicianText) {
        sessionClinicianText.textContent = `AUTHENTICATED CLINICAL SESSION: ${practitionerName} (License #${license})`;
      }

      renderDoctorUnlockedView(decryptedClinical);

      if (doctorLoginView) doctorLoginView.classList.add('hidden');
      if (doctorUnlockedView) doctorUnlockedView.classList.remove('hidden');

      showToast(`Credentials verified: Access granted to ${practitionerName}. Record decrypted.`);
    } catch (err) {
      showToast(`Access Error: ${err.message}`);
    }
  }

  function handleDoctorLogout() {
    activeClinicianSession = null;
    if (doctorUnlockedView) doctorUnlockedView.classList.add('hidden');
    if (doctorLoginView) doctorLoginView.classList.remove('hidden');
    if (doctorPin) doctorPin.value = '';
    showToast('Clinical session locked. Records re-secured.');
  }

  // --------------------------------------------------------------------------
  // 9. PATIENT PORTAL (REGISTRATION & ENCRYPTION ENGINE)
  // --------------------------------------------------------------------------
  function openPatientModal() {
    if (!patientModal) return;
    populatePatientForm();
    patientModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closePatientModal() {
    if (!patientModal) return;
    patientModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  async function populatePatientForm() {
    if (formPatientName) formPatientName.value = activePatient.name || '';
    if (formPatientBlood) formPatientBlood.value = activePatient.bloodGroup || 'O+';
    if (formPatientDob) formPatientDob.value = activePatient.dob || '';
    if (formPatientGender) formPatientGender.value = activePatient.gender || 'Male';
    if (formPatientAllergy) formPatientAllergy.value = activePatient.allergy || '';
    if (formPatientCondition) formPatientCondition.value = activePatient.condition || '';
    if (formContactName) formContactName.value = activePatient.contactName || '';
    if (formContactPhone) formContactPhone.value = activePatient.contactPhone || '';

    // Load decrypted clinical data if available
    let clinical = DEFAULT_CLINICAL_EHR;
    try {
      const vault = loadEncryptedVault();
      if (vault) {
        clinical = await decryptClinicalRecord(vault, '1234') || DEFAULT_CLINICAL_EHR;
      }
    } catch (e) {
      // Keep default
    }

    if (formSurgeries) {
      if (Array.isArray(clinical.surgeries)) {
        formSurgeries.value = clinical.surgeries.join('; ');
      } else {
        formSurgeries.value = clinical.surgeries || '';
      }
    }

    if (formPrescriptions) {
      if (Array.isArray(clinical.prescriptions)) {
        formPrescriptions.value = clinical.prescriptions.map(p => `${p.name} ${p.dose} (${p.freq})`).join('; ');
      } else {
        formPrescriptions.value = clinical.prescriptions || '';
      }
    }

    if (formHospital) formHospital.value = activePatient.hospital || '';
    if (formInsurance) formInsurance.value = activePatient.insurance || '';
  }

  async function handlePatientSave(e) {
    e.preventDefault();

    // 1. Update Triage Data
    activePatient.name = formPatientName.value.trim();
    activePatient.bloodGroup = formPatientBlood.value;
    activePatient.bloodRh = activePatient.bloodGroup.includes('+') ? 'Rh Positive' : 'Rh Negative';
    activePatient.dob = formPatientDob.value.trim();
    activePatient.gender = formPatientGender.value;
    activePatient.allergy = formPatientAllergy.value.trim();
    activePatient.condition = formPatientCondition.value.trim();
    activePatient.contactName = formContactName.value.trim();
    activePatient.contactPhone = formContactPhone.value.trim();
    activePatient.hospital = formHospital.value.trim();
    activePatient.insurance = formInsurance.value.trim();

    saveTriageData(activePatient);

    // 2. Encrypt Sensitive Clinical Records with PIN (1234)
    const surgText = formSurgeries.value.trim();
    const updatedSurgeries = surgText.split(';').map(s => s.trim()).filter(s => s.length > 0);

    const presText = formPrescriptions.value.trim();
    const updatedPrescriptions = presText.split(';').map(item => {
      const parts = item.trim().split(/\s+(?=[0-9])/);
      return {
        name: parts[0] || item.trim(),
        dose: parts[1] || 'As directed',
        freq: 'Daily prescription',
        ind: 'Chronic management'
      };
    }).filter(p => p.name.length > 0);

    const clinicalToEncrypt = {
      surgeries: updatedSurgeries,
      prescriptions: updatedPrescriptions,
      vitals: DEFAULT_CLINICAL_EHR.vitals,
      documents: DEFAULT_CLINICAL_EHR.documents
    };

    const encryptedVault = await encryptClinicalRecord(clinicalToEncrypt, '1234');
    saveEncryptedVault(encryptedVault);

    // 3. Re-render
    renderTriageProfile(activePatient, true);
    closePatientModal();
    showToast('MediLink profile & encrypted records saved successfully!');
  }

  function handleFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const fileTag = document.createElement('div');
    fileTag.className = 'file-tag';
    fileTag.textContent = `✓ ${file.name} (Uploaded)`;
    if (uploadStatusList) uploadStatusList.appendChild(fileTag);

    showToast(`Medical record attached: ${file.name}`);
  }

  // --------------------------------------------------------------------------
  // 10. VIDEO TOUR MODAL
  // --------------------------------------------------------------------------
  function openVideoModal() {
    if (!videoTourModal) return;
    videoTourModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoTourModal) return;
    videoTourModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // --------------------------------------------------------------------------
  // 11. URL QUERY ROUTING (?profile=ML-70821)
  // --------------------------------------------------------------------------
  function handleUrlRouting() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileParam = urlParams.get('profile');

    if (profileParam) {
      if (directBanner) directBanner.classList.remove('hidden');
      if (bannerTitleText) bannerTitleText.textContent = 'SMART WRISTBAND SCANNED';
      if (bannerDescText) bannerDescText.textContent = `Displaying emergency triage for ${activePatient.name}.`;
      document.title = `EMERGENCY TRIAGE: ${activePatient.name} — MediLink`;
      setTimeout(() => {
        const profileSec = document.getElementById('profile');
        if (profileSec) profileSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);
    } else {
      if (directBanner) directBanner.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // 12. COPY PROFILE LINK
  // --------------------------------------------------------------------------
  function copyProfileUrl() {
    const fullUrl = getFullProfileUrl(activePatient.id);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl)
        .then(() => showToast(`Profile URL copied: ${fullUrl}`))
        .catch(() => fallbackCopy(fullUrl));
    } else {
      fallbackCopy(fullUrl);
    }
  }

  function fallbackCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand('copy');
      showToast(`URL copied: ${text}`);
    } catch (err) {
      showToast('Copy failed. Please manually select the URL.');
    }
    document.body.removeChild(el);
  }

  // --------------------------------------------------------------------------
  // 13. EVENT LISTENERS INITIALIZATION
  // --------------------------------------------------------------------------
  function initEventListeners() {
    // Banner Exit
    if (btnBannerExit) {
      btnBannerExit.addEventListener('click', () => {
        if (directBanner) directBanner.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Mobile Navigation
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('open');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Dual Scanner Triggers
    if (btnSimulateNfcTap) btnSimulateNfcTap.addEventListener('click', runFrontNfcTap);
    if (wristbandFrontTarget) wristbandFrontTarget.addEventListener('click', runFrontNfcTap);
    if (btnSimulateQrScan) btnSimulateQrScan.addEventListener('click', runBackQrScan);
    if (wristbandBackTarget) wristbandBackTarget.addEventListener('click', runBackQrScan);
    if (btnFlipWristband) btnFlipWristband.addEventListener('click', () => flipWristband());

    // Video Tour Modal
    if (btnOpenVideoTour) btnOpenVideoTour.addEventListener('click', openVideoModal);
    if (btnCloseVideoModal) btnCloseVideoModal.addEventListener('click', closeVideoModal);
    if (videoTourModal) {
      videoTourModal.addEventListener('click', (e) => {
        if (e.target === videoTourModal) closeVideoModal();
      });
    }
    if (btnVideoJumpSim) {
      btnVideoJumpSim.addEventListener('click', () => {
        closeVideoModal();
        const scannerSec = document.getElementById('scanner');
        if (scannerSec) scannerSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Copy URL
    if (btnCopyProfileUrl) btnCopyProfileUrl.addEventListener('click', copyProfileUrl);

    // Doctor Portal Openers & Closers
    if (btnHeaderDoctor) btnHeaderDoctor.addEventListener('click', openDoctorModal);
    if (navBtnDoctorLogin) navBtnDoctorLogin.addEventListener('click', (e) => { e.preventDefault(); openDoctorModal(); });
    if (btnOpenDoctorPortal) btnOpenDoctorPortal.addEventListener('click', openDoctorModal);
    if (btnCloseDoctorModal) btnCloseDoctorModal.addEventListener('click', closeDoctorModal);
    if (doctorModal) {
      doctorModal.addEventListener('click', (e) => {
        if (e.target === doctorModal) closeDoctorModal();
      });
    }

    // Doctor Credentials Pre-fill & Submit
    if (btnFillDoctorCreds) {
      btnFillDoctorCreds.addEventListener('click', () => {
        if (doctorRole) doctorRole.value = 'ROLE_DOCTOR';
        if (doctorLicenseId) doctorLicenseId.value = 'MED-9942';
        if (doctorFacility) doctorFacility.value = 'City Memorial Hospital — Trauma Bay 3';
        if (doctorPin) doctorPin.value = '1234';
      });
    }

    if (formDoctorLogin) formDoctorLogin.addEventListener('submit', handleDoctorLoginSubmit);
    if (btnDoctorLogout) btnDoctorLogout.addEventListener('click', handleDoctorLogout);

    // Patient Portal Openers & Closers
    if (btnHeaderPatient) btnHeaderPatient.addEventListener('click', openPatientModal);
    if (navBtnPatientPortal) navBtnPatientPortal.addEventListener('click', (e) => { e.preventDefault(); openPatientModal(); });
    if (btnClosePatientModal) btnClosePatientModal.addEventListener('click', closePatientModal);
    if (patientModal) {
      patientModal.addEventListener('click', (e) => {
        if (e.target === patientModal) closePatientModal();
      });
    }

    // Patient Form Save & Upload
    if (formPatientRecords) formPatientRecords.addEventListener('submit', handlePatientSave);
    if (mockDropzone && patientDocUpload) {
      mockDropzone.addEventListener('click', () => patientDocUpload.click());
      patientDocUpload.addEventListener('change', handleFileUpload);
    }

    // Keyboard Escape Key for Modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDoctorModal();
        closePatientModal();
        closeVideoModal();
      }
    });

    // Scroll-Spy for Navigation Links
    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollY = window.pageYOffset;

      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 120;
        const sectionId = current.getAttribute('id');
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (activeLink) {
          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            activeLink.classList.add('active');
          } else {
            activeLink.classList.remove('active');
          }
        }
      });
    }, { passive: true });
  }

  // Initial Load
  document.addEventListener('DOMContentLoaded', async () => {
    await seedInitialVault();
    renderTriageProfile(activePatient, false);
    renderAuditLedger();
    initEventListeners();
    handleUrlRouting();
  });

})();
