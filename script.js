/**
 * ============================================================================
 * MEDILINK — Emergency Medical Access, One Tap Away
 * Application Logic & State Engine: script.js
 * Vanilla JavaScript • Zero Dependencies • Static Deployment Ready
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. FICTIONAL CLINICAL DATA MODEL (Strictly simulated demo records)
  // --------------------------------------------------------------------------
  const PROFILES_DATA = {
    'ML-DEMO-001': {
      id: 'ML-DEMO-001',
      name: 'Aarav Sharma',
      initials: 'AS',
      demographics: 'Age: 28 • Male • DOB: 14/08/1996 • New Delhi, IN',
      bloodGroup: 'O+',
      bloodRh: 'Rh Positive',
      isSevereAllergy: true,
      allergiesHtml: `
        <div class="allergy-tag severe">
          <strong>Penicillin</strong> — High Anaphylaxis Risk. Beta-lactam antibiotics strictly contraindicated.
        </div>
      `,
      medicalNotesHtml: `
        <div class="condition-item">
          <strong>Asthma:</strong> Uses rescue inhaler (Albuterol) for acute bronchial distress. Patient carries inhaler in backpack/pocket. Keep patient in upright sitting posture.
        </div>
      `,
      contactName: 'Demo Contact (Sunita Sharma)',
      contactRelation: 'Relationship: Spouse',
      contactPhone: '+91 90000 00000',
      contactTelHref: 'tel:+919000000000',
      medications: [
        'Albuterol Inhaler (90mcg): 1–2 inhalations PRN for sudden shortness of breath.',
        'Budesonide (200mcg): Once daily morning maintenance inhalation.'
      ],
      hospital: 'City Memorial Hospital & Trauma Center',
      donor: 'Registered Organ Donor (Yes)',
      insurance: 'MediShield National • Policy #ML-99824',
      instructions: `
        1. Maintain patent airway. Sit patient upright if breathing is labored.<br>
        2. DO NOT administer penicillin or related cephalosporin antibiotics.<br>
        3. Notify emergency contact immediately upon transit to emergency department.
      `
    },

    'ML-DEMO-002': {
      id: 'ML-DEMO-002',
      name: 'Priya Verma',
      initials: 'PV',
      demographics: 'Age: 32 • Female • DOB: 03/11/1992 • Bengaluru, IN',
      bloodGroup: 'B+',
      bloodRh: 'Rh Positive',
      isSevereAllergy: false,
      allergiesHtml: `
        <div class="allergy-tag none">
          <strong>No Known Drug Allergies (NKDA)</strong> — Tolerates penicillin, sulfa, and NSAIDs.
        </div>
      `,
      medicalNotesHtml: `
        <div class="condition-item">
          <strong>Type 1 Diabetes Mellitus:</strong> Insulin dependent. If patient is confused, sweating, or unresponsive, assume acute hypoglycemia and test capillary blood glucose immediately.
        </div>
      `,
      contactName: 'Demo Contact (Rohan Verma)',
      contactRelation: 'Relationship: Brother',
      contactPhone: '+91 98888 77777',
      contactTelHref: 'tel:+919888877777',
      medications: [
        'Insulin Glargine (Lantus): 18 units subcutaneous injection at bedtime.',
        'Insulin Lispro (Humalog): 4–6 units subcutaneous with meals based on carb count.'
      ],
      hospital: 'Apollo Regional Healthcare & Trauma Center',
      donor: 'Registered Organ Donor (Yes)',
      insurance: 'Star Health Care Comprehensive • Policy #ST-44102',
      instructions: `
        1. Check fingerstick blood glucose immediately (target > 70 mg/dL).<br>
        2. If conscious and hypoglycemic: Administer 15–20 grams fast-acting oral carbohydrates.<br>
        3. If unconscious: Administer Glucagon 1mg IM/SQ or IV Dextrose 50%. Call emergency contact.
      `
    },

    'ML-DEMO-003': {
      id: 'ML-DEMO-003',
      name: 'David Miller',
      initials: 'DM',
      demographics: 'Age: 59 • Male • DOB: 22/04/1965 • Mumbai, IN',
      bloodGroup: 'A-',
      bloodRh: 'Rh Negative',
      isSevereAllergy: true,
      allergiesHtml: `
        <div class="allergy-tag severe">
          <strong>Aspirin & NSAIDs</strong> — Severe gastrointestinal intolerance, acute bronchospasm & hives.
        </div>
      `,
      medicalNotesHtml: `
        <div class="condition-item">
          <strong>Cardiac Pacemaker:</strong> Implanted dual-chamber Medtronic device (2022). DO NOT place in MRI machine or expose to strong electromagnetic fields.
        </div>
        <div class="condition-item" style="margin-top: 0.5rem;">
          <strong>Anticoagulation Therapy:</strong> Patient is taking prescription blood thinners. High hemorrhage risk.
        </div>
      `,
      contactName: 'Demo Contact (Clara Miller)',
      contactRelation: 'Relationship: Daughter',
      contactPhone: '+91 97777 66666',
      contactTelHref: 'tel:+919777766666',
      medications: [
        'Warfarin (Coumadin) 5mg: Daily evening dose (Therapeutic INR range: 2.0–3.0).',
        'Metoprolol Succinate 50mg: Once daily morning dose for arrhythmia management.',
        'Atorvastatin 20mg: Once daily evening dose.'
      ],
      hospital: 'Fortis Heart & Vascular Institute',
      donor: 'Registered Organ Donor (Yes)',
      insurance: 'Care Global Health Plan • Policy #CG-10928',
      instructions: `
        1. PACEMAKER PRECAUTIONS: Strict MRI contraindication. Avoid diathermy.<br>
        2. HIGH BLEEDING RISK: Apply firm, prolonged direct pressure to any bleeding wounds.<br>
        3. Notify on-call hospital cardiologist immediately upon patient intake.
      `
    }
  };

  // State
  let currentActiveProfileId = 'ML-DEMO-001';
  let isSimulating = false;
  let audioCtx = null;

  // --------------------------------------------------------------------------
  // 2. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const directBanner = document.getElementById('direct-profile-banner');
  const btnBannerExit = document.getElementById('btn-banner-exit');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Simulation DOM elements
  const btnSimulateTap = document.getElementById('btn-simulate-tap');
  const simBtnText = document.getElementById('sim-btn-text');
  const wristbandTarget = document.getElementById('wristband-target');
  const simProfileSelect = document.getElementById('sim-profile-select');
  const simConsoleBody = document.getElementById('sim-console-body');
  const btnClearConsole = document.getElementById('btn-clear-console');
  const simHwStatus = document.getElementById('sim-hw-status');
  const progStep1 = document.getElementById('prog-step-1');
  const progStep2 = document.getElementById('prog-step-2');
  const progStep3 = document.getElementById('prog-step-3');
  const progStep4 = document.getElementById('prog-step-4');

  // Profile DOM elements
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
  const patientContactRelation = document.getElementById('patient-contact-relation');
  const patientContactPhone = document.getElementById('patient-contact-phone');
  const patientContactBtn = document.getElementById('patient-contact-btn');
  const patientMedications = document.getElementById('patient-medications');
  const patientHospital = document.getElementById('patient-hospital');
  const patientDonor = document.getElementById('patient-donor');
  const patientInsurance = document.getElementById('patient-insurance');
  const patientInstructions = document.getElementById('patient-instructions');

  // Action Buttons
  const btnProfileTabs = document.querySelectorAll('.btn-profile-tab');
  const btnCopySummary = document.getElementById('btn-copy-summary');
  const btnShareProfile = document.getElementById('btn-share-profile');
  const btnDirectLink = document.getElementById('btn-direct-link');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // --------------------------------------------------------------------------
  // 3. SOUND SYNTHESIS & HAPTIC UTILITIES (Subtle Medical Beep)
  // --------------------------------------------------------------------------
  function playNfcBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      // Pleasant dual tone chirp: 880Hz -> 1320Hz
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (err) {
      // Audio autoplay policy or lack of sound card; silently skip
    }
  }

  function triggerHaptics() {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([40, 30, 70]);
      }
    } catch (err) {
      // Haptics unavailable; silently skip
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
  // 5. PROFILE RENDERING ENGINE
  // --------------------------------------------------------------------------
  function renderProfile(profileId, shouldScroll = false) {
    const data = PROFILES_DATA[profileId] || PROFILES_DATA['ML-DEMO-001'];
    currentActiveProfileId = data.id;

    // 1. Update text & metadata
    if (patientAvatarInitials) patientAvatarInitials.textContent = data.initials;
    if (patientProfileId) patientProfileId.textContent = `ID: ${data.id}`;
    if (patientName) patientName.textContent = data.name;
    if (patientDemographics) patientDemographics.textContent = data.demographics;

    // 2. Blood group badge
    if (patientBloodGroup) patientBloodGroup.textContent = data.bloodGroup;
    if (patientBloodRh) patientBloodRh.textContent = data.bloodRh;

    // 3. Allergies & Medical notes
    if (patientAllergies) patientAllergies.innerHTML = data.allergiesHtml;
    if (patientMedicalNotes) patientMedicalNotes.innerHTML = data.medicalNotesHtml;

    // 4. Contact info
    if (patientContactName) patientContactName.textContent = data.contactName;
    if (patientContactRelation) patientContactRelation.textContent = data.contactRelation;
    if (patientContactPhone) patientContactPhone.textContent = data.contactPhone;
    if (patientContactBtn) patientContactBtn.setAttribute('href', data.contactTelHref);

    // 5. Medications list
    if (patientMedications) {
      let medsHtml = '<ul class="medication-list">';
      data.medications.forEach(med => {
        medsHtml += `<li>${med}</li>`;
      });
      medsHtml += '</ul>';
      patientMedications.innerHTML = medsHtml;
    }

    // 6. Logistics & Protocol
    if (patientHospital) patientHospital.textContent = data.hospital;
    if (patientDonor) patientDonor.textContent = data.donor;
    if (patientInsurance) patientInsurance.textContent = data.insurance;
    if (patientInstructions) patientInstructions.innerHTML = `<p class="protocol-text">${data.instructions}</p>`;

    // 7. Update direct link button URL
    if (btnDirectLink) {
      btnDirectLink.setAttribute('href', `./index.html?profile=${data.id}`);
    }

    // 8. Sync switcher tabs
    btnProfileTabs.forEach(tab => {
      const tabId = tab.getAttribute('data-profile-id');
      const isActive = tabId === data.id;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // 9. Sync simulator dropdown selector
    if (simProfileSelect && simProfileSelect.value !== data.id) {
      simProfileSelect.value = data.id;
    }

    // 10. Flash highlight animation on card
    if (patientProfileCard) {
      patientProfileCard.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      patientProfileCard.style.borderColor = '#38bdf8';
      patientProfileCard.style.boxShadow = '0 0 32px rgba(56, 189, 248, 0.4)';
      setTimeout(() => {
        patientProfileCard.style.borderColor = '';
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
  // 6. SIMULATION LOGGING & STATE MACHINE
  // --------------------------------------------------------------------------
  function appendConsoleLog(message, type = 'info') {
    if (!simConsoleBody) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;

    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[${timeStr}] ${message}`;
    simConsoleBody.appendChild(line);
    simConsoleBody.scrollTop = simConsoleBody.scrollHeight;
  }

  function resetProgressSegments() {
    [progStep1, progStep2, progStep3, progStep4].forEach(step => {
      if (step) {
        step.classList.remove('active', 'complete');
      }
    });
  }

  function runNfcSimulation() {
    if (isSimulating) return;
    isSimulating = true;

    const selectedProfileId = simProfileSelect ? simProfileSelect.value : 'ML-DEMO-001';
    const profileObj = PROFILES_DATA[selectedProfileId] || PROFILES_DATA['ML-DEMO-001'];

    // UI Updates
    if (btnSimulateTap) btnSimulateTap.disabled = true;
    if (simBtnText) simBtnText.textContent = 'Scanning NFC Tag...';
    if (simHwStatus) {
      simHwStatus.textContent = 'TRANSMITTING 13.56 MHz RF...';
      simHwStatus.classList.add('scanning');
    }

    resetProgressSegments();
    appendConsoleLog('=== INITIATING PROXIMITY NFC INTERACTION ===', 'rf');

    // Stage 1: RF Field Detection (0ms)
    progStep1.classList.add('active');
    appendConsoleLog('Smartphone NFC antenna energized: 13.56 MHz carrier wave active.', 'rf');

    // Stage 2: Tag Detected (350ms)
    setTimeout(() => {
      progStep1.classList.remove('active');
      progStep1.classList.add('complete');
      progStep2.classList.add('active');

      appendConsoleLog('NFC tag detected', 'ndef');
      appendConsoleLog('Hardware IC: ISO/IEC 14443-A Type 2 (NXP NTAG213) in proximity (~2.5 cm).', 'info');
      appendConsoleLog('Reading NDEF record...', 'ndef');
    }, 400);

    // Stage 3: Read NDEF Record (850ms)
    setTimeout(() => {
      progStep2.classList.remove('active');
      progStep2.classList.add('complete');
      progStep3.classList.add('active');

      const fullUrl = `${window.location.origin}${window.location.pathname}?profile=${selectedProfileId}`;
      appendConsoleLog(`NDEF URI record extracted: ${fullUrl}`, 'ndef');
      // Outputs: Profile identified: ML-DEMO-001
      appendConsoleLog(`Profile identified: ${selectedProfileId}`, 'success');
      appendConsoleLog(`Patient match: ${profileObj.name} (Blood: ${profileObj.bloodGroup})`, 'info');
    }, 900);

    // Stage 4: Profile Identification & Browser Launch (1400ms)
    setTimeout(() => {
      progStep3.classList.remove('active');
      progStep3.classList.add('complete');
      progStep4.classList.add('active');

      playNfcBeep();
      triggerHaptics();

      appendConsoleLog('NDEF URL parsed successfully. Directing to Emergency Profile...', 'action');
    }, 1450);

    // Stage 5: Complete & Scroll to Profile (1950ms)
    setTimeout(() => {
      progStep4.classList.remove('active');
      progStep4.classList.add('complete');

      if (simHwStatus) {
        simHwStatus.textContent = 'SESSION COMPLETED';
        simHwStatus.classList.remove('scanning');
      }

      if (btnSimulateTap) btnSimulateTap.disabled = false;
      if (simBtnText) simBtnText.textContent = 'Simulate NFC Tap';

      isSimulating = false;

      // Render the selected profile and smoothly bring it into view
      renderProfile(selectedProfileId, true);
      showToast(`NFC Tag Read: Loaded ${profileObj.name} (${selectedProfileId})`);
    }, 2000);
  }

  // --------------------------------------------------------------------------
  // 7. RESPONDER ACTION TOOLBAR HANDLERS
  // --------------------------------------------------------------------------
  function copyEmergencySummary() {
    const data = PROFILES_DATA[currentActiveProfileId];
    if (!data) return;

    const summaryText = [
      '========================================',
      '   MEDILINK EMERGENCY MEDICAL SUMMARY   ',
      '========================================',
      `Profile ID:       ${data.id}`,
      `Patient Name:     ${data.name}`,
      `Demographics:     ${data.demographics}`,
      `Blood Group:      ${data.bloodGroup} (${data.bloodRh})`,
      '----------------------------------------',
      `Allergies:        ${data.isSevereAllergy ? 'SEVERE ALERT' : 'None Reported'}`,
      `Conditions:       ${data.name === 'Aarav Sharma' ? 'Severe Asthma' : data.name === 'Priya Verma' ? 'Type 1 Diabetes' : 'Cardiac Pacemaker / Blood Thinners'}`,
      `Emergency Phone:  ${data.contactPhone} (${data.contactName})`,
      `Preferred Hosp:   ${data.hospital}`,
      `Insurance:        ${data.insurance}`,
      '----------------------------------------',
      'NOTE: Fictional data for hackathon presentation.',
      `Direct URL:       ${window.location.origin}${window.location.pathname}?profile=${data.id}`,
      '========================================'
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summaryText)
        .then(() => {
          showToast('Emergency medical summary copied to clipboard!');
        })
        .catch(() => {
          fallbackCopyText(summaryText);
        });
    } else {
      fallbackCopyText(summaryText);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Emergency summary copied to clipboard!');
    } catch (err) {
      showToast('Copy failed. Please manually select the summary.');
    }
    document.body.removeChild(textArea);
  }

  function shareProfileLink() {
    const data = PROFILES_DATA[currentActiveProfileId];
    if (!data) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}?profile=${data.id}`;
    const shareData = {
      title: `Medilink Emergency Profile — ${data.name}`,
      text: `Access emergency medical info for ${data.name} (Blood: ${data.bloodGroup})`,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {
        // User canceled or failed; fallback to copy
        copyUrlToClipboard(shareUrl);
      });
    } else {
      copyUrlToClipboard(shareUrl);
    }
  }

  function copyUrlToClipboard(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          showToast(`Direct profile link copied: index.html?profile=${currentActiveProfileId}`);
        })
        .catch(() => {
          fallbackCopyText(url);
        });
    } else {
      fallbackCopyText(url);
    }
  }

  // --------------------------------------------------------------------------
  // 8. URL QUERY PARAMETER ROUTING (index.html?profile=ML-DEMO-001)
  // --------------------------------------------------------------------------
  function handleUrlRouting() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileParam = urlParams.get('profile');

    if (profileParam) {
      const sanitizedId = profileParam.trim().toUpperCase();
      if (PROFILES_DATA[sanitizedId]) {
        currentActiveProfileId = sanitizedId;
      } else {
        // Fallback default if unknown profile ID given
        currentActiveProfileId = 'ML-DEMO-001';
      }

      // Render the matched profile immediately
      renderProfile(currentActiveProfileId, false);

      // Show top emergency alert banner
      if (directBanner) {
        directBanner.classList.remove('hidden');
      }

      // Update page title with emergency context
      document.title = `EMERGENCY PROFILE: ${PROFILES_DATA[currentActiveProfileId].name} (${currentActiveProfileId}) — Medilink`;

      // Smooth scroll directly to the profile card after layout paint
      setTimeout(() => {
        const profileSec = document.getElementById('profile');
        if (profileSec) {
          profileSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
    } else {
      // Default initial view: ML-DEMO-001 loaded, banner hidden
      renderProfile('ML-DEMO-001', false);
      if (directBanner) {
        directBanner.classList.add('hidden');
      }
    }
  }

  // --------------------------------------------------------------------------
  // 9. EVENT LISTENERS & INITIALIZATION
  // --------------------------------------------------------------------------
  function initEventListeners() {
    // Top banner exit button
    if (btnBannerExit) {
      btnBannerExit.addEventListener('click', () => {
        if (directBanner) directBanner.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Mobile nav toggle
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    // Close mobile nav on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('open');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Profile switcher tabs
    btnProfileTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-profile-id');
        if (id && PROFILES_DATA[id]) {
          renderProfile(id, false);
        }
      });
    });

    // Simulator profile selector change
    if (simProfileSelect) {
      simProfileSelect.addEventListener('change', (e) => {
        const newId = e.target.value;
        if (PROFILES_DATA[newId]) {
          appendConsoleLog(`Virtual tag swapped to: ${newId} (${PROFILES_DATA[newId].name})`, 'info');
        }
      });
    }

    // Simulator button & wristband hotspot click
    if (btnSimulateTap) {
      btnSimulateTap.addEventListener('click', runNfcSimulation);
    }
    if (wristbandTarget) {
      wristbandTarget.addEventListener('click', runNfcSimulation);
    }

    // Simulator clear console
    if (btnClearConsole) {
      btnClearConsole.addEventListener('click', () => {
        if (simConsoleBody) {
          simConsoleBody.innerHTML = `
            <div class="console-line info">[System]: Log cleared.</div>
            <div class="console-line info">[System]: Ready for NFC scan interaction.</div>
          `;
        }
        resetProgressSegments();
      });
    }

    // Action buttons
    if (btnCopySummary) {
      btnCopySummary.addEventListener('click', copyEmergencySummary);
    }
    if (btnShareProfile) {
      btnShareProfile.addEventListener('click', shareProfileLink);
    }

    // Active navigation scroll spy
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

  // DOM Content Loaded Execution
  document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    handleUrlRouting();
  });

})();
