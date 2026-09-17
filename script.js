/**
 * ============================================================================
 * MEDILINK — Emergency Medical Access, One Tap Away
 * Application Logic & State Engine: script.js
 * Clean White Theme • Flash Emergency Display • Doctor Access • Patient Portal
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. DEFAULT PATIENT CLINICAL DATA & LOCAL STORAGE MANAGEMENT
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'medilink_patient_record_v2';

  const DEFAULT_PATIENT = {
    id: 'ML-70821',
    name: 'Aarav Sharma',
    initials: 'AS',
    dob: '14/08/1996',
    gender: 'Male',
    city: 'New Delhi, IN',
    bloodGroup: 'O+',
    bloodRh: 'Rh Positive',
    allergy: 'Penicillin (Severe Anaphylaxis Risk. Beta-lactams contraindicated)',
    condition: 'Severe Asthma: Uses Albuterol rescue inhaler. Keep upright. Inhaler in backpack/pocket.',
    contactName: 'Sunita Sharma (Spouse)',
    contactPhone: '+91 90000 00000',
    hospital: 'City Memorial Hospital & Trauma Center',
    donor: 'Registered Organ Donor (Yes)',
    insurance: 'MediShield National • Policy #ML-99824',
    surgeries: [
      'Appendectomy (2018): Laparoscopic removal at City Memorial Hospital. Full recovery.',
      'Childhood Asthma (Diagnosed 2006): Moderate persistent. Triggered by cold air and pollen.',
      'Sports Concussion (2021): Brain CT normal. Full cognitive recovery.'
    ],
    prescriptions: [
      { name: 'Albuterol Sulfate Inhaler', dose: '90 mcg / actuation', freq: '1–2 puffs Q4-6H PRN', ind: 'Acute Bronchospasm' },
      { name: 'Budesonide (Pulmicort)', dose: '200 mcg / inhalation', freq: 'Once daily (Morning)', ind: 'Asthma Controller' },
      { name: 'Cetirizine HCl', dose: '10 mg tablet', freq: 'Once daily PRN', ind: 'Seasonal Allergies' }
    ],
    vitals: {
      bp: '118/76 mmHg',
      hr: '68 bpm (Sinus Rhythm)',
      spo2: '98% on room air',
      glucose: '92 mg/dL (Fasting Normal)'
    },
    documents: [
      { name: 'Pulmonary Function Test (PFT) Report (PDF)', meta: 'Uploaded by patient • FEV1/FVC Ratio: 82%' },
      { name: 'Penicillin Allergy Confirmation Workup (PDF)', meta: 'Apollo Diagnostic Center • IgE RAST Positive' }
    ]
  };

  // Load from localStorage or seed with default
  function loadPatientData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('localStorage read error; using default profile', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PATIENT));
  }

  function savePatientData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage save error', e);
    }
  }

  let activePatient = loadPatientData();
  let isScanning = false;
  let audioCtx = null;

  // --------------------------------------------------------------------------
  // 2. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const directBanner = document.getElementById('direct-profile-banner');
  const btnBannerExit = document.getElementById('btn-banner-exit');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scanner Elements
  const btnSimulateTap = document.getElementById('btn-simulate-tap');
  const simBtnText = document.getElementById('sim-btn-text');
  const wristbandTarget = document.getElementById('wristband-target');
  const simConsoleBody = document.getElementById('sim-console-body');
  const simHwStatus = document.getElementById('sim-hw-status');
  const progStep1 = document.getElementById('prog-step-1');
  const progStep2 = document.getElementById('prog-step-2');
  const progStep3 = document.getElementById('prog-step-3');
  const progStep4 = document.getElementById('prog-step-4');

  // Profile Elements (Flash Emergency Display)
  const patientProfileCard = document.getElementById('patient-profile-card');
  const patientAvatarInitials = document.getElementById('patient-avatar-initials');
  const patientProfileId = document.getElementById('patient-profile-id');
  const patientName = document.getElementById('patient-name');
  const patientDemographics = document.getElementById('patient-demographics');
  const patientBloodGroup = document.getElementById('patient-blood-group');
  const patientBloodRh = document.getElementById('patient-blood-rh');
  const patientAllergies = document.getElementById('patient-allergies');
  const patientMedicalNotes = document.getElementById('patient-medical-notes');
  const patientContactName = document.getElementById('patient-contact-name');
  const patientContactPhone = document.getElementById('patient-contact-phone');
  const patientContactBtn = document.getElementById('patient-contact-btn');
  const patientHospital = document.getElementById('patient-hospital');
  const patientDonor = document.getElementById('patient-donor');
  const patientInsurance = document.getElementById('patient-insurance');

  // Attached URL Elements (Bottom of Emergency Card)
  const displayProfileUrl = document.getElementById('display-profile-url');
  const btnCopyProfileUrl = document.getElementById('btn-copy-profile-url');
  const btnDirectLink = document.getElementById('btn-direct-link');

  // Hero Preview Elements
  const previewPhoneName = document.getElementById('preview-phone-name');
  const previewPhoneBlood = document.getElementById('preview-phone-blood');
  const previewPhoneAllergy = document.getElementById('preview-phone-allergy');
  const previewPhoneCondition = document.getElementById('preview-phone-condition');

  // Doctor Portal Elements
  const doctorModal = document.getElementById('doctor-modal');
  const btnHeaderDoctor = document.getElementById('btn-header-doctor');
  const navBtnDoctorLogin = document.getElementById('nav-btn-doctor-login');
  const btnOpenDoctorPortal = document.getElementById('btn-open-doctor-portal');
  const btnCloseDoctorModal = document.getElementById('btn-close-doctor-modal');
  const formDoctorLogin = document.getElementById('form-doctor-login');
  const doctorLicenseId = document.getElementById('doctor-license-id');
  const doctorPin = document.getElementById('doctor-pin');
  const btnFillDoctorCreds = document.getElementById('btn-fill-doctor-creds');
  const doctorLoginView = document.getElementById('doctor-login-view');
  const doctorUnlockedView = document.getElementById('doctor-unlocked-view');
  const btnDoctorLogout = document.getElementById('btn-doctor-logout');
  const auditTimestamp = document.getElementById('audit-timestamp');
  const fullHistorySurgeries = document.getElementById('full-history-surgeries');
  const fullMedsTableBody = document.getElementById('full-meds-table-body');
  const fullHistoryDocs = document.getElementById('full-history-docs');

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
  // 3. SOUND & HAPTIC FEEDBACK
  // --------------------------------------------------------------------------
  function playScanBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // Audio playback skipped
    }
  }

  function triggerHaptics() {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([40, 30, 70]);
      }
    } catch (e) {
      // Vibration not supported
    }
  }

  // --------------------------------------------------------------------------
  // 4. TOAST NOTIFICATION HELPER
  // --------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // 5. PROFILE RENDERING ENGINE & URL ATTACHMENT
  // --------------------------------------------------------------------------
  function getFullProfileUrl(profileId) {
    const cleanBase = window.location.href.split('?')[0].split('#')[0];
    return `${cleanBase}?profile=${profileId}`;
  }

  function renderProfile(data, shouldScroll = false) {
    if (!data) data = activePatient;

    // Compute Initials
    const nameParts = (data.name || 'Patient').trim().split(/\s+/);
    const initials = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();

    // 1. Top Identity
    if (patientAvatarInitials) patientAvatarInitials.textContent = initials;
    if (patientProfileId) patientProfileId.textContent = `ID: ${data.id || 'ML-70821'}`;
    if (patientName) patientName.textContent = data.name;
    if (patientDemographics) {
      patientDemographics.textContent = `Age: 28 • ${data.gender || 'Male'} • DOB: ${data.dob || '14/08/1996'} • ${data.city || 'New Delhi, IN'}`;
    }

    // 2. Blood Group Card
    if (patientBloodGroup) patientBloodGroup.textContent = data.bloodGroup;
    if (patientBloodRh) patientBloodRh.textContent = data.bloodRh || (data.bloodGroup.includes('+') ? 'Rh Positive' : 'Rh Negative');

    // 3. Critical Health Alerts
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

    // 4. Primary Emergency Contact Bar
    if (patientContactName) patientContactName.textContent = data.contactName;
    if (patientContactPhone) patientContactPhone.textContent = data.contactPhone;
    if (patientContactBtn) {
      const cleanPhone = (data.contactPhone || '').replace(/[^0-9+]/g, '');
      patientContactBtn.setAttribute('href', `tel:${cleanPhone}`);
    }

    // 5. Logistics
    if (patientHospital) patientHospital.textContent = data.hospital || 'City Memorial Hospital';
    if (patientDonor) patientDonor.textContent = data.donor || 'Registered Organ Donor (Yes)';
    if (patientInsurance) patientInsurance.textContent = data.insurance || 'MediShield National';

    // 6. Hero Visual Preview Sync
    if (previewPhoneName) previewPhoneName.textContent = data.name;
    if (previewPhoneBlood) previewPhoneBlood.textContent = `${data.bloodGroup} POSITIVE`;
    if (previewPhoneAllergy) {
      const shortAllergy = data.allergy.split('.')[0].substring(0, 26);
      previewPhoneAllergy.textContent = shortAllergy;
    }
    if (previewPhoneCondition) {
      const shortCond = data.condition.split(':')[0].substring(0, 20);
      previewPhoneCondition.textContent = shortCond;
    }

    // 7. Attached Emergency Profile URL Section (Bottom of Card)
    const fullUrl = getFullProfileUrl(data.id || 'ML-70821');
    if (displayProfileUrl) {
      displayProfileUrl.textContent = fullUrl;
    }
    if (btnDirectLink) {
      btnDirectLink.setAttribute('href', fullUrl);
    }

    // 8. Flash Card Animation
    if (patientProfileCard) {
      patientProfileCard.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      patientProfileCard.style.boxShadow = '0 0 25px rgba(220, 38, 38, 0.35)';
      setTimeout(() => {
        patientProfileCard.style.boxShadow = '';
      }, 700);
    }

    if (shouldScroll) {
      const targetElement = document.getElementById('profile');
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 6. SCANNER SIMULATION ENGINE
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

  function runNfcScan() {
    if (isScanning) return;
    isScanning = true;

    if (btnSimulateTap) btnSimulateTap.disabled = true;
    if (simBtnText) simBtnText.textContent = 'Reading Wristband...';
    if (simHwStatus) {
      simHwStatus.textContent = 'CONNECTING TO NFC...';
      simHwStatus.classList.add('scanning');
    }

    resetProgressSegments();
    appendConsoleLog('13.56 MHz carrier wave energized. Smartphone antenna active.', 'rf');

    // Step 1: RF Field Detected (0ms)
    progStep1.classList.add('active');

    // Step 2: Tag Read (350ms)
    setTimeout(() => {
      progStep1.classList.remove('active');
      progStep1.classList.add('complete');
      progStep2.classList.add('active');

      appendConsoleLog('NFC wristband detected (ISO/IEC 14443-A Type 2 / NTAG213).', 'ndef');
      appendConsoleLog('Reading passive NDEF URI record payload...', 'ndef');
    }, 400);

    // Step 3: NDEF Parsed (850ms)
    setTimeout(() => {
      progStep2.classList.remove('active');
      progStep2.classList.add('complete');
      progStep3.classList.add('active');

      const fullUrl = getFullProfileUrl(activePatient.id);
      appendConsoleLog(`NDEF URI record extracted: ${fullUrl}`, 'ndef');
      appendConsoleLog(`Record verified: ${activePatient.name} (Blood: ${activePatient.bloodGroup})`, 'success');
    }, 900);

    // Step 4: Flash Ready (1400ms)
    setTimeout(() => {
      progStep3.classList.remove('active');
      progStep3.classList.add('complete');
      progStep4.classList.add('active');

      playScanBeep();
      triggerHaptics();

      appendConsoleLog('Displaying Emergency Medical Flash Message for first responders...', 'action');
    }, 1450);

    // Step 5: Finished (1900ms)
    setTimeout(() => {
      progStep4.classList.remove('active');
      progStep4.classList.add('complete');

      if (simHwStatus) {
        simHwStatus.textContent = 'FLASH MESSAGE DISPLAYED';
        simHwStatus.classList.remove('scanning');
      }

      if (btnSimulateTap) btnSimulateTap.disabled = false;
      if (simBtnText) simBtnText.textContent = 'Tap to Read NFC Band';

      isScanning = false;

      renderProfile(activePatient, true);
      showToast(`Flash Emergency Info: Loaded ${activePatient.name}`);
    }, 1950);
  }

  // --------------------------------------------------------------------------
  // 7. DOCTOR & PARAMEDIC PORTAL (FULL CLINICAL HISTORY ACCESS)
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

  function populateDoctorUnlockedView() {
    if (auditTimestamp) {
      const now = new Date();
      auditTimestamp.textContent = now.toLocaleDateString() + ' at ' + now.toLocaleTimeString();
    }

    // 1. Surgeries List
    if (fullHistorySurgeries) {
      let html = '<ul class="clinical-record-list">';
      if (Array.isArray(activePatient.surgeries)) {
        activePatient.surgeries.forEach(s => {
          html += `<li>${s}</li>`;
        });
      } else {
        html += `<li>${activePatient.surgeries}</li>`;
      }
      html += '</ul>';
      fullHistorySurgeries.innerHTML = html;
    }

    // 2. Medications Table
    if (fullMedsTableBody) {
      let rows = '';
      if (Array.isArray(activePatient.prescriptions)) {
        activePatient.prescriptions.forEach(p => {
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
        rows = `<tr><td colspan="4">${activePatient.prescriptions}</td></tr>`;
      }
      fullMedsTableBody.innerHTML = rows;
    }

    // 3. Uploaded Documents
    if (fullHistoryDocs) {
      let docsHtml = '<ul class="uploaded-docs-list">';
      if (Array.isArray(activePatient.documents)) {
        activePatient.documents.forEach(d => {
          docsHtml += `
            <li class="doc-item">
              <span class="doc-icon">📄</span>
              <div class="doc-meta">
                <strong>${d.name}</strong>
                <small>${d.meta}</small>
              </div>
              <span class="doc-verified-badge">Verified</span>
            </li>
          `;
        });
      }
      docsHtml += '</ul>';
      fullHistoryDocs.innerHTML = docsHtml;
    }
  }

  function handleDoctorLogin(e) {
    e.preventDefault();
    const license = (doctorLicenseId ? doctorLicenseId.value : '').trim();
    const pin = (doctorPin ? doctorPin.value : '').trim();

    if (!license || !pin) {
      showToast('Please enter your License ID and Security PIN.');
      return;
    }

    // Populate data & switch views
    populateDoctorUnlockedView();
    if (doctorLoginView) doctorLoginView.classList.add('hidden');
    if (doctorUnlockedView) doctorUnlockedView.classList.remove('hidden');

    showToast('Doctor credentials verified. Full medical history unlocked.');
  }

  function handleDoctorLogout() {
    if (doctorUnlockedView) doctorUnlockedView.classList.add('hidden');
    if (doctorLoginView) doctorLoginView.classList.remove('hidden');
    if (doctorPin) doctorPin.value = '';
    showToast('Doctor session locked.');
  }

  // --------------------------------------------------------------------------
  // 8. PATIENT PORTAL (REGISTRATION & MEDICAL RECORD UPLOADS)
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

  function populatePatientForm() {
    if (formPatientName) formPatientName.value = activePatient.name || '';
    if (formPatientBlood) formPatientBlood.value = activePatient.bloodGroup || 'O+';
    if (formPatientDob) formPatientDob.value = activePatient.dob || '';
    if (formPatientGender) formPatientGender.value = activePatient.gender || 'Male';
    if (formPatientAllergy) formPatientAllergy.value = activePatient.allergy || '';
    if (formPatientCondition) formPatientCondition.value = activePatient.condition || '';
    if (formContactName) formContactName.value = activePatient.contactName || '';
    if (formContactPhone) formContactPhone.value = activePatient.contactPhone || '';

    if (formSurgeries) {
      if (Array.isArray(activePatient.surgeries)) {
        formSurgeries.value = activePatient.surgeries.join('; ');
      } else {
        formSurgeries.value = activePatient.surgeries || '';
      }
    }

    if (formPrescriptions) {
      if (Array.isArray(activePatient.prescriptions)) {
        formPrescriptions.value = activePatient.prescriptions.map(p => `${p.name} ${p.dose} (${p.freq})`).join('; ');
      } else {
        formPrescriptions.value = activePatient.prescriptions || '';
      }
    }

    if (formHospital) formHospital.value = activePatient.hospital || '';
    if (formInsurance) formInsurance.value = activePatient.insurance || '';
  }

  function handlePatientSave(e) {
    e.preventDefault();

    activePatient.name = formPatientName.value.trim();
    activePatient.bloodGroup = formPatientBlood.value;
    activePatient.bloodRh = activePatient.bloodGroup.includes('+') ? 'Rh Positive' : 'Rh Negative';
    activePatient.dob = formPatientDob.value.trim();
    activePatient.gender = formPatientGender.value;
    activePatient.allergy = formPatientAllergy.value.trim();
    activePatient.condition = formPatientCondition.value.trim();
    activePatient.contactName = formContactName.value.trim();
    activePatient.contactPhone = formContactPhone.value.trim();

    // Surgeries
    const surgText = formSurgeries.value.trim();
    activePatient.surgeries = surgText.split(';').map(s => s.trim()).filter(s => s.length > 0);

    // Prescriptions text
    const presText = formPrescriptions.value.trim();
    activePatient.prescriptions = presText.split(';').map(item => {
      const parts = item.trim().split(/\s+(?=[0-9])/);
      return {
        name: parts[0] || item.trim(),
        dose: parts[1] || 'As directed',
        freq: 'Daily prescription',
        ind: 'Chronic management'
      };
    }).filter(p => p.name.length > 0);

    activePatient.hospital = formHospital.value.trim();
    activePatient.insurance = formInsurance.value.trim();

    // Save to localStorage
    savePatientData(activePatient);

    // Re-render
    renderProfile(activePatient, true);
    closePatientModal();
    showToast('Patient profile & medical history saved successfully!');
  }

  // File Upload Simulation in Patient Portal
  function handleFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const fileTag = document.createElement('div');
    fileTag.className = 'file-tag';
    fileTag.textContent = `✓ ${file.name} (Uploaded)`;
    if (uploadStatusList) {
      uploadStatusList.appendChild(fileTag);
    }

    // Add to patient documents
    if (!Array.isArray(activePatient.documents)) activePatient.documents = [];
    activePatient.documents.push({
      name: `${file.name} (Patient Upload)`,
      meta: `Uploaded on ${new Date().toLocaleDateString()} • Ready for Doctor Review`
    });
    savePatientData(activePatient);

    showToast(`Medical record attached: ${file.name}`);
  }

  // --------------------------------------------------------------------------
  // 9. COPY & SHARE TOOLS
  // --------------------------------------------------------------------------
  function copyProfileUrl() {
    const fullUrl = getFullProfileUrl(activePatient.id);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl)
        .then(() => showToast(`Emergency URL copied: ${fullUrl}`))
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
  // 10. URL QUERY ROUTING (?profile=ML-70821)
  // --------------------------------------------------------------------------
  function handleUrlRouting() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileParam = urlParams.get('profile');

    if (profileParam) {
      if (directBanner) directBanner.classList.remove('hidden');
      document.title = `EMERGENCY PROFILE: ${activePatient.name} — Medilink`;
      setTimeout(() => {
        const profileSec = document.getElementById('profile');
        if (profileSec) profileSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);
    } else {
      if (directBanner) directBanner.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // 11. EVENT LISTENERS INITIALIZATION
  // --------------------------------------------------------------------------
  function initEventListeners() {
    // Top Banner Exit
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

    // Scanner
    if (btnSimulateTap) btnSimulateTap.addEventListener('click', runNfcScan);
    if (wristbandTarget) wristbandTarget.addEventListener('click', runNfcScan);

    // Attached Profile URL Copy
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

    // Doctor Form Credentials Auto-fill & Submit
    if (btnFillDoctorCreds) {
      btnFillDoctorCreds.addEventListener('click', () => {
        if (doctorLicenseId) doctorLicenseId.value = 'MED-9942';
        if (doctorPin) doctorPin.value = '1234';
      });
    }
    if (formDoctorLogin) formDoctorLogin.addEventListener('submit', handleDoctorLogin);
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

    // Patient Form Submit & File Upload
    if (formPatientRecords) formPatientRecords.addEventListener('submit', handlePatientSave);
    if (mockDropzone && patientDocUpload) {
      mockDropzone.addEventListener('click', () => patientDocUpload.click());
      patientDocUpload.addEventListener('change', handleFileUpload);
    }

    // Footer shortcuts
    const footerDocLink = document.querySelector('.footer-doc-link');
    if (footerDocLink) footerDocLink.addEventListener('click', (e) => { e.preventDefault(); openDoctorModal(); });
    const footerPatLink = document.querySelector('.footer-pat-link');
    if (footerPatLink) footerPatLink.addEventListener('click', (e) => { e.preventDefault(); openPatientModal(); });

    // Keyboard Escape to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDoctorModal();
        closePatientModal();
      }
    });

    // Scroll-Spy
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
  document.addEventListener('DOMContentLoaded', () => {
    renderProfile(activePatient, false);
    initEventListeners();
    handleUrlRouting();
  });

})();
