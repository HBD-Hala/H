/* ==========================================================================
   INTERACTIVE SCRIPT - HAPPY BIRTHDAY HALA
   Bear PIN • Capybara Calendar • Curtain Reveal • Rolling Reel • Lightbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. TEDDY BEAR SVG CONTROLLER & 3D TILT
     -------------------------------------------------------------------------- */
  const card = document.getElementById('card');
  const bear = document.getElementById('bear');
  const eyes = document.getElementById('eyes');
  const pupilL = document.getElementById('pupilL');
  const pupilR = document.getElementById('pupilR');
  const pawL = document.getElementById('pawL');
  const pawR = document.getElementById('pawR');
  const radar = document.getElementById('radar');
  const sparkles = document.getElementById('sparkles');
  const pinDigits = document.querySelectorAll('.pin-digit');
  const pinError = document.getElementById('pinError');
  const pinStage = document.getElementById('pinStage');
  const calendarStage = document.getElementById('calendarStage');
  const curtainStage = document.getElementById('curtainStage');
  const siteMain = document.getElementById('siteMain');

  const CORRECT_PIN = "8888";

  // Eye Coordinates
  const EYE_L = { cx: 72, cy: 92 };
  const EYE_R = { cx: 128, cy: 92 };
  const MAX_TRAVEL = 6;

  let trackingActive = true;
  let targetLx = 0, targetLy = 0, targetRx = 0, targetRy = 0;
  let currentLx = 0, currentLy = 0, currentRx = 0, currentRy = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateEyes() {
    currentLx = lerp(currentLx, targetLx, 0.14);
    currentLy = lerp(currentLy, targetLy, 0.14);
    currentRx = lerp(currentRx, targetRx, 0.14);
    currentRy = lerp(currentRy, targetRy, 0.14);

    pupilL.setAttribute('cx', EYE_L.cx + currentLx);
    pupilL.setAttribute('cy', EYE_L.cy + currentLy);
    pupilR.setAttribute('cx', EYE_R.cx + currentRx);
    pupilR.setAttribute('cy', EYE_R.cy + currentRy);

    requestAnimationFrame(animateEyes);
  }
  requestAnimationFrame(animateEyes);

  function updateEyeTarget(mouseX, mouseY) {
    if (!trackingActive) return;
    const rect = bear.getBoundingClientRect();
    const scaleX = rect.width / 200;
    const scaleY = rect.height / 180;

    function calcOffset(eye) {
      const eyeX = rect.left + eye.cx * scaleX;
      const eyeY = rect.top + eye.cy * scaleY;
      const dx = mouseX - eyeX;
      const dy = mouseY - eyeY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const travel = Math.min(dist / 40, 1) * MAX_TRAVEL;
      return { x: Math.cos(angle) * travel, y: Math.sin(angle) * travel };
    }

    const ol = calcOffset(EYE_L);
    const or = calcOffset(EYE_R);
    targetLx = ol.x; targetLy = ol.y;
    targetRx = or.x; targetRy = or.y;
  }

  window.addEventListener('mousemove', (e) => {
    if (bear.dataset.state !== 'covering') {
      updateEyeTarget(e.clientX, e.clientY);
    }
  });

  // Blinking timer
  function scheduleBlink() {
    const delay = 2200 + Math.random() * 3000;
    setTimeout(() => {
      if (bear.dataset.state !== 'covering') {
        eyes.classList.add('blink');
        setTimeout(() => {
          eyes.classList.remove('blink');
          scheduleBlink();
        }, 220);
      } else {
        scheduleBlink();
      }
    }, delay);
  }
  scheduleBlink();

  // Paws Positions
  const PAW_REST_L = { tx: 56, ty: 168, rot: -8, scale: 1 };
  const PAW_REST_R = { tx: 144, ty: 168, rot: 8, scale: 1 };
  const PAW_COVER_L = { tx: 72, ty: 92, rot: -6, scale: 1.18 };
  const PAW_COVER_R = { tx: 128, ty: 92, rot: 6, scale: 1.18 };
  const PAW_SHY_L = { tx: 80, ty: 108, rot: -2, scale: 1.25 };
  const PAW_SHY_R = { tx: 120, ty: 108, rot: 2, scale: 1.25 };
  const PAW_CHEER_L = { tx: 40, ty: 50, rot: -45, scale: 1.2 };
  const PAW_CHEER_R = { tx: 160, ty: 50, rot: 45, scale: 1.2 };

  function applyPaw(el, p) {
    el.setAttribute('transform', `translate(${p.tx},${p.ty}) rotate(${p.rot}) scale(${p.scale})`);
  }

  function movePaws(toL, toR, duration = 380) {
    const startL = getCurrentPawPos(pawL);
    const startR = getCurrentPawPos(pawR);
    let startTime = null;

    function anim(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      const curL = {
        tx: lerp(startL.tx, toL.tx, ease),
        ty: lerp(startL.ty, toL.ty, ease),
        rot: lerp(startL.rot, toL.rot, ease),
        scale: lerp(startL.scale, toL.scale, ease)
      };
      const curR = {
        tx: lerp(startR.tx, toR.tx, ease),
        ty: lerp(startR.ty, toR.ty, ease),
        rot: lerp(startR.rot, toR.rot, ease),
        scale: lerp(startR.scale, toR.scale, ease)
      };

      applyPaw(pawL, curL);
      applyPaw(pawR, curR);

      if (progress < 1) requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
  }

  function getCurrentPawPos(el) {
    const t = el.getAttribute('transform') || '';
    const trans = t.match(/translate\(([^)]+)\)/);
    const rot = t.match(/rotate\(([^)]+)\)/);
    const sc = t.match(/scale\(([^)]+)\)/);
    const [tx, ty] = trans ? trans[1].split(',').map(Number) : [56, 168];
    const r = rot ? parseFloat(rot[1]) : -8;
    const s = sc ? parseFloat(sc[1]) : 1;
    return { tx, ty, rot: r, scale: s };
  }

  function setPawState(state) {
    bear.dataset.state = state;
    switch (state) {
      case 'idle':
        movePaws(PAW_REST_L, PAW_REST_R, 450);
        trackingActive = true;
        break;
      case 'covering':
        movePaws(PAW_COVER_L, PAW_COVER_R, 350);
        trackingActive = false;
        targetLx = 0; targetLy = 0; targetRx = 0; targetRy = 0;
        break;
      case 'shy':
        movePaws(PAW_SHY_L, PAW_SHY_R, 300);
        trackingActive = false;
        break;
      case 'cheer':
        movePaws(PAW_CHEER_L, PAW_CHEER_R, 350);
        trackingActive = false;
        break;
    }
  }

  applyPaw(pawL, PAW_REST_L);
  applyPaw(pawR, PAW_REST_R);

  // 3D Card Tilt
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `rotateY(${x / 18}deg) rotateX(${-y / 18}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `rotateY(0deg) rotateX(0deg)`;
  });

  /* --------------------------------------------------------------------------
     2. PIN CODE INPUT LOGIC
     -------------------------------------------------------------------------- */
  pinDigits.forEach((input, index) => {
    input.addEventListener('focus', () => {
      setPawState('covering');
      pinError.textContent = '';
    });

    input.addEventListener('blur', () => {
      const anyFocused = Array.from(pinDigits).some(inp => inp === document.activeElement);
      if (!anyFocused && bear.dataset.state !== 'cheer') {
        setPawState('idle');
      }
    });

    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val ? val[val.length - 1] : '';

      if (e.target.value && index < pinDigits.length - 1) {
        pinDigits[index + 1].focus();
      }

      if (getFullPin().length === 4) {
        verifyPin();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        pinDigits[index - 1].focus();
      } else if (e.key === 'Enter') {
        verifyPin();
      }
    });
  });

  function getFullPin() {
    let pin = '';
    pinDigits.forEach(inp => pin += inp.value);
    return pin;
  }

  window.verifyPin = function() {
    const entered = getFullPin();
    if (entered === CORRECT_PIN) {
      // Correct PIN entered!
      pinError.textContent = '';
      setPawState('cheer');
      radar.classList.add('active');
      sparkles.classList.add('active');

      // Trigger Confetti
      fireConfetti(120);

      setTimeout(() => {
        pinStage.classList.add('hidden');
        calendarStage.classList.add('visible');
      }, 700);

    } else {
      // Wrong PIN
      card.classList.add('shake');
      setPawState('shy');
      pinError.textContent = 'Oops! Incorrect PIN code ♡';

      setTimeout(() => {
        card.classList.remove('shake');
        pinDigits.forEach(inp => inp.value = '');
        pinDigits[0].focus();
        setPawState('covering');
      }, 500);
    }
  };

  /* --------------------------------------------------------------------------
     3. CALENDAR SCREEN -> THEATER CURTAIN OPEN & AUDIO
     -------------------------------------------------------------------------- */
  const bgMusic = document.getElementById('bgMusic');
  const audioFab = document.getElementById('audioFab');
  const speakerIcon = document.getElementById('speakerIcon');

  window.openMainSite = function() {
    // Hide Calendar
    calendarStage.classList.add('hidden');

    // Trigger Theatrical Velvet Curtains
    setTimeout(() => {
      curtainStage.classList.add('open');
      fireConfetti(250);
      playMusic();
      siteMain.classList.add('revealed');
    }, 200);

    // Initialize Scroll Listeners
    initScrollEffects();
  };

  function playMusic() {
    bgMusic.play().then(() => {
      audioFab.classList.add('playing');
      updateSpeakerIcon(true);
    }).catch(err => {
      console.log('Audio autoplay prevented by browser policy:', err);
    });
  }

  window.toggleMusic = function() {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        audioFab.classList.add('playing');
        updateSpeakerIcon(true);
      });
    } else {
      bgMusic.pause();
      audioFab.classList.remove('playing');
      updateSpeakerIcon(false);
    }
  };

  function updateSpeakerIcon(isPlaying) {
    if (isPlaying) {
      speakerIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    } else {
      speakerIcon.innerHTML = '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>';
    }
  }

  /* --------------------------------------------------------------------------
     4. SCROLL REVEAL (IMAGE 5 WITH ROAA'S SIGNATURE)
     -------------------------------------------------------------------------- */
  function initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    const scrollElem = document.getElementById('sketchSection');
    if (scrollElem) observer.observe(scrollElem);
  }

  /* --------------------------------------------------------------------------
     5. THE ROLLING REEL (SPOOL & STRIP SCROLL)
     -------------------------------------------------------------------------- */
  const reelSection = document.getElementById('reelScrollSection');
  const spoolDisc = document.getElementById('spoolDisc');
  const reelTrack = document.getElementById('reelTrack');
  const reelDotsContainer = document.getElementById('reelDots');

  const totalCards = 8;
  let activeCardIndex = 0;

  // Build dots
  for (let i = 0; i < totalCards; i++) {
    const dot = document.createElement('span');
    dot.className = 'reel-dot' + (i === 0 ? ' active' : '');
    reelDotsContainer.appendChild(dot);
  }

  function updateReelProgress(progress) {
    if (!spoolDisc || !reelTrack) return;

    // Smooth Spool rotation
    const rotationDeg = progress * 720;
    spoolDisc.style.transform = `rotate(${rotationDeg}deg)`;

    // Horizontal sliding
    const maxSlide = reelTrack.scrollWidth - window.innerWidth + 120;
    const translateX = -(progress * Math.max(0, maxSlide));
    reelTrack.style.transform = `translateX(${translateX}px)`;

    // Dot indicators
    const currentCard = Math.min(Math.floor(progress * totalCards), totalCards - 1);
    if (currentCard !== activeCardIndex) {
      activeCardIndex = currentCard;
      const dots = document.querySelectorAll('.reel-dot');
      dots.forEach((d, idx) => d.classList.toggle('active', idx === activeCardIndex));
    }
  }

  function handleReelScroll() {
    if (!reelSection) return;
    const rect = reelSection.getBoundingClientRect();
    const sectionHeight = reelSection.offsetHeight;
    const windowHeight = window.innerHeight;
    const totalScroll = sectionHeight - windowHeight;
    if (totalScroll <= 0) return;

    const currentScroll = -rect.top;
    let progress = currentScroll / totalScroll;
    progress = Math.max(0, Math.min(1, progress));

    updateReelProgress(progress);
  }

  window.addEventListener('scroll', handleReelScroll, { passive: true });
  window.addEventListener('resize', handleReelScroll);

  window.slideReel = function(dir) {
    const newIdx = Math.max(0, Math.min(totalCards - 1, activeCardIndex + dir));
    const targetProgress = newIdx / (totalCards - 1);
    updateReelProgress(targetProgress);
  };

  /* --------------------------------------------------------------------------
     6. FULL PHOTO LIGHTBOX MODAL
     -------------------------------------------------------------------------- */
  const reelImages = [
    'assets/reel/01.jpg',
    'assets/reel/02.jpg',
    'assets/reel/03.jpg',
    'assets/reel/04.jpg',
    'assets/reel/05.jpg',
    'assets/reel/06.jpg',
    'assets/reel/07.jpg',
    'assets/reel/08.jpg'
  ];

  let currentLightboxIdx = 0;
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxIndex = document.getElementById('lightboxIndex');

  window.openLightbox = function(index) {
    currentLightboxIdx = index;
    lightboxImg.src = reelImages[currentLightboxIdx];
    lightboxIndex.textContent = `${currentLightboxIdx + 1} / ${reelImages.length}`;
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  window.navigateLightbox = function(dir) {
    currentLightboxIdx = (currentLightboxIdx + dir + reelImages.length) % reelImages.length;
    lightboxImg.src = reelImages[currentLightboxIdx];
    lightboxIndex.textContent = `${currentLightboxIdx + 1} / ${reelImages.length}`;
  };

  window.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  /* --------------------------------------------------------------------------
     7. CONFETTI PARTICLE SYSTEM
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const CONFETTI_COLORS = ['#DA8292', '#F5D6DC', '#ffd700', '#ff6b81', '#70a1ff', '#2ed573', '#ffffff'];

  function fireConfetti(count = 150) {
    resizeCanvas();
    confettiParticles = [];

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32; // Gravity
      p.vx *= 0.985;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.006;

      if (p.opacity > 0 && p.y < canvas.height + 50) {
        active = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    if (active) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

});
