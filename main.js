/* ==========================================================================
   MAIN APPLICATION LOGIC & INTERACTION CONTROLLERS
   ========================================================================== */

import confetti from 'canvas-confetti';
import { ParticleEngine } from './particles.js';
import { RomanticAudioEngine } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Particles Engine
  const particleEngine = new ParticleEngine('bg-canvas');

  // 2. Initialize Audio Synthesizer
  const audioEngine = new RomanticAudioEngine();

  // 3. User Data & Customizer State
  const defaultData = {
    gfName: "Shreya",
    heroTitle: "Happy birthday meri Sohna, baki sab thik h ❤️✨",
    letterText: "Dearest Shreya (meri Sohna), Happy birthday! Baki sab thik h, bas tum mere paas ho to meri duniya poori h. From the moment you entered my life, everything became brighter, sweeter, and infinitely more meaningful. Your laughter is my favorite song, your smile is my daily inspiration, and your hand is the only one I ever want to hold. You are my life, my happiness, and my entire world. On your special birthday, I want you to know how deeply and truly I love you. Happy Birthday, my sunshine! Here's to making countless more breathtaking memories together!"
  };

  let userData = { ...defaultData };

  const loadUserData = () => {
    const saved = localStorage.getItem('birthday_gf_data');
    if (saved) {
      try {
        userData = { ...defaultData, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error loading saved data', e);
      }
    }
    updateDOMWithUserData();
  };

  const updateDOMWithUserData = () => {
    document.querySelectorAll('.gf-name-display').forEach(el => {
      el.textContent = userData.gfName;
    });

    const letterContent = document.getElementById('letter-content-text');
    if (letterContent) {
      letterContent.textContent = userData.letterText;
    }
  };

  loadUserData();

  // 4. Gift Unboxing Flow
  const unboxingScreen = document.getElementById('unboxing-screen');
  const mainApp = document.getElementById('main-app');
  const giftBoxBtn = document.getElementById('gift-box-btn');
  const openGiftTrigger = document.getElementById('open-gift-trigger');

  const handleUnbox = () => {
    giftBoxBtn.classList.add('open');
    audioEngine.playUnboxSound();
    
    // Confetti explosion
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      unboxingScreen.classList.add('fade-out');
      mainApp.classList.remove('hidden');
      audioEngine.toggleMusic(); // Start soft background melody
      
      setTimeout(() => {
        unboxingScreen.classList.add('hidden');
      }, 800);
    }, 900);
  };

  if (giftBoxBtn) giftBoxBtn.addEventListener('click', handleUnbox);
  if (openGiftTrigger) openGiftTrigger.addEventListener('click', handleUnbox);

  // 5. Navigation & Music Control
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const isPlaying = audioEngine.toggleMusic();
      audioToggleBtn.classList.toggle('playing', isPlaying);
    });
  }

  // 6. 3D Tilt Effect on Polaroid Memory Cards
  const polaroids = document.querySelectorAll('.polaroid-card');
  polaroids.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (y / (rect.height / 2)) * -12;
      const rotateY = (x / (rect.width / 2)) * 12;

      const inner = card.querySelector('.polaroid-inner');
      if (inner) {
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      const inner = card.querySelector('.polaroid-inner');
      if (inner) {
        inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      }
    });

    // Lightbox modal trigger
    card.addEventListener('click', () => {
      const img = card.querySelector('.polaroid-img');
      const caption = card.querySelector('.polaroid-caption h3');
      const date = card.querySelector('.polaroid-date');

      if (img && caption) {
        document.getElementById('lightbox-img').src = img.src;
        document.getElementById('lightbox-title').textContent = caption.textContent;
        document.getElementById('lightbox-desc').textContent = date ? date.textContent : '';
        document.getElementById('lightbox-modal').classList.remove('hidden');
        audioEngine.playSparkleChime();
      }
    });
  });

  // Lightbox Close
  const closeLightboxBtn = document.getElementById('close-lightbox-btn');
  const lightboxModal = document.getElementById('lightbox-modal');
  if (closeLightboxBtn && lightboxModal) {
    closeLightboxBtn.addEventListener('click', () => lightboxModal.classList.add('hidden'));
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.add('hidden');
    });
  }

  // 7. "Reasons Why I Love You" 3D Flip Deck
  const flipCards = document.querySelectorAll('.flip-card');
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      audioEngine.playSparkleChime();
    });
  });

  // 8. Interactive Birthday Cake & Candle Blowing
  const flames = document.querySelectorAll('.flame');
  const blowBtn = document.getElementById('blow-candle-btn');
  const micBlowBtn = document.getElementById('mic-blow-btn');
  const wishStatus = document.getElementById('wish-status-msg');

  const extrapolateBlowOut = () => {
    flames.forEach(f => f.classList.add('extinguished'));
    wishStatus.innerHTML = "🎉 Your wish has been sent to the stars! Happy Birthday! 🎉";
    wishStatus.style.color = "#ffe5a3";

    // Launch heavy confetti and sound chime
    audioEngine.playSparkleChime();
    particleEngine.triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2);

    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.5 }
    });
  };

  if (blowBtn) blowBtn.addEventListener('click', extrapolateBlowOut);

  // Microphone blow detection
  if (micBlowBtn) {
    micBlowBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const mediaStreamSource = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        mediaStreamSource.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        wishStatus.textContent = "🎙️ Listening... Blow loudly into your microphone!";

        const checkVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;

          if (average > 45) { // Threshold for blow
            extrapolateBlowOut();
            stream.getTracks().forEach(track => track.stop());
          } else if (!flames[0].classList.contains('extinguished')) {
            requestAnimationFrame(checkVolume);
          }
        };
        checkVolume();
      } catch (err) {
        alert('Microphone access was denied or not supported. Use the blow button instead!');
      }
    });
  }

  // 9. Wax-Sealed Secret Love Letter
  const waxSealBtn = document.getElementById('wax-seal-btn');
  const envelopeClosed = document.getElementById('envelope-closed');
  const letterOpen = document.getElementById('letter-open');
  const recloseLetterBtn = document.getElementById('reclose-letter-btn');

  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', () => {
      audioEngine.playSparkleChime();
      envelopeClosed.classList.add('hidden');
      letterOpen.classList.remove('hidden');
    });
  }

  if (recloseLetterBtn) {
    recloseLetterBtn.addEventListener('click', () => {
      letterOpen.classList.add('hidden');
      envelopeClosed.classList.remove('hidden');
    });
  }

  // 10. Live Customizer Modal Panel
  const customizerModal = document.getElementById('customizer-modal');
  const customizerToggleBtn = document.getElementById('customizer-toggle-btn');
  const closeCustomizerBtn = document.getElementById('close-customizer-btn');
  const customizerForm = document.getElementById('customizer-form');
  const resetCustomizerBtn = document.getElementById('reset-customizer-btn');

  const inputGfName = document.getElementById('input-gf-name');
  const inputHeroTitle = document.getElementById('input-hero-title');
  const inputLetter = document.getElementById('input-letter');

  if (customizerToggleBtn) {
    customizerToggleBtn.addEventListener('click', () => {
      inputGfName.value = userData.gfName;
      inputHeroTitle.value = userData.heroTitle;
      inputLetter.value = userData.letterText;
      customizerModal.classList.remove('hidden');
    });
  }

  if (closeCustomizerBtn) {
    closeCustomizerBtn.addEventListener('click', () => customizerModal.classList.add('hidden'));
  }

  if (customizerForm) {
    customizerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      userData.gfName = inputGfName.value.trim() || defaultData.gfName;
      userData.heroTitle = inputHeroTitle.value.trim() || defaultData.heroTitle;
      userData.letterText = inputLetter.value.trim() || defaultData.letterText;

      localStorage.setItem('birthday_gf_data', JSON.stringify(userData));
      updateDOMWithUserData();
      customizerModal.classList.add('hidden');
      audioEngine.playSparkleChime();
    });
  }

  if (resetCustomizerBtn) {
    resetCustomizerBtn.addEventListener('click', () => {
      userData = { ...defaultData };
      localStorage.removeItem('birthday_gf_data');
      updateDOMWithUserData();
      customizerModal.classList.add('hidden');
    });
  }
});
