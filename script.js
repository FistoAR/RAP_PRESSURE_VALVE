gsap.registerPlugin(ScrollTrigger);


// custom dropdown
const dd = document.getElementById('customDropdown');
const ddSel = document.getElementById('dropdownSelected');
const ddList = document.getElementById('dropdownList');
const ddOptions = ddList.querySelectorAll('.dropdown-option');

// Toggle dropdown open/close
ddSel.addEventListener('click', () => {
  const isOpen = ddList.style.display === 'block';
  ddList.style.display = isOpen ? 'none' : 'block';
  dd.classList.toggle('open', !isOpen);
});
// Option click event (close menu)
ddOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    // ddSel.innerHTML = `${opt.textContent}<span class="dropdown-chevron"></span>`;
    // chevron still included!
    // ddSel.insertAdjacentHTML('beforeend', '<span class="dropdown-chevron"></span>');
    ddOptions.forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    ddList.style.display = 'none';
    dd.classList.remove('open');
    scrollToSectionByNumber(parseInt(opt.dataset.page));
  });
});
// Optional: close if click outside
document.addEventListener('click', e => {
  if (!dd.contains(e.target)) ddList.style.display = 'none';
});

// --- Call this when updating the page/section number (in animateToIndex): ---
function updateCustomDropdown(newIndex) {
  ddOptions.forEach(opt => {
    if (parseInt(opt.dataset.page) === newIndex) {
      ddSel.innerHTML = `${opt.textContent}<span class="dropdown-chevron"></span>`;
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
}

const nextSections = gsap.utils.toArray("#contentSections > section");
const navCenter = document.querySelector(".nav-center");

const formatNumber = (n) => n.toString().padStart(2, '0');

const minPage = 1;
const maxPage = nextSections.length;
let current = 1;

nextSections.forEach((section, i) => {
  gsap.set(section, { opacity: i === 0 ? 1 : 0, display: "block" });
});

updateNavDisplay(current);

// Initial wrapper setup
const fadeDuration = (nextSections.length - 1) * window.innerHeight;

gsap.set(".sections-wrapper", {
  scale: 1,
  x: "-40vw",
  y: "-110vh",
  rotate: 0,
  transformOrigin: "center"
});
gsap.set(".sec", {
  margin: 0,
  width: "100vw",
  height: "100vh"
});

// Main timeline
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".main-container",
    start: "top top",
    end: "+=" + (4000 + fadeDuration),
    scrub: 1,
    pin: true,
  }
});

// 1. Zoom out + spacing
tl.to(".sections-wrapper", {
  scale: 0.5,
  rotate: 5,
  x: "-105vw",
  y: "-100vh",
  duration: 1,
  ease: "power2.inOut"
}, 0).to(".sec", {
  margin: "2vh 1.5vw",
  width: "calc(100vw - 3vw)",
  height: "calc(100vh - 4vh)",
  duration: 1,
  ease: "power2.inOut"
}, 0);

// 2. Drift
tl.to(".sections-wrapper", {
  x: "-230vw",
  y: "-120vh",
  duration: 1,
  ease: "power2.inOut"
});

// 3. Zoom in and center
tl.to(".sections-wrapper", {
  scale: 1,
  rotate: 0,
  x: "-280vw",
  y: "-110vh",
  duration: 1,
  ease: "power2.inOut"
}).to(".sec", {
  margin: 0,
  width: "100vw",
  height: "100vh",
  duration: 1,
  ease: "power2.inOut"
}, "-=1");

// Pause
tl.to(".sec", { duration: 0.5 });

// 4. Fade in sections and update nav both directions
nextSections.forEach((section, i) => {
  if (i === 0) return;
  tl.to(section, {
    opacity: 1,
    duration: 1,
    ease: "power2.out",
    onStart: () => {
      animateToIndex(i + 1); // Navigation update
      sectionRevealAnimation(section); // Run reveal effects!
    },
    onReverseComplete: () => {
      animateToIndex(i);
      sectionRevealAnimation(section); // Animate backward too!
    }
  }, "+=1");
});

function sectionRevealAnimation(section) {
  const revealLeft = section.querySelectorAll('.reveal-left');
  const revealRight = section.querySelectorAll('.reveal-right');
  const fadeUp = section.querySelectorAll('.fade-up');
  const popIn = section.querySelectorAll('.pop-in');

  // Reset
  gsap.set(revealLeft, { x: -180, opacity: 0 });
  gsap.set(revealRight, { x: 180, opacity: 0 });
  gsap.set(fadeUp, { y: 140, opacity: 0 });
  gsap.set(popIn, { scale: 0.5, opacity: 0 });

  // Animate
  gsap.to(revealLeft, { x: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out', overwrite:'auto' });
  gsap.to(revealRight, { x: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out', overwrite:'auto' });
  gsap.to(fadeUp, { y: 0, opacity: 1, duration: 0.7, stagger: 0.10, ease: 'power2.out', overwrite:'auto' });
  gsap.to(popIn, { scale: 1, opacity: 1, duration: 0.75, stagger: 0.12, ease: 'power2.out', overwrite: 'auto' });
}



// NAVIGATION FUNCTIONS

function animateToIndex(newIndex) {
  const select = document.getElementById('sectionsUpdate');
  if (select) {
    for (let opt of select.options) {
      if (opt.dataset.page == newIndex) {
        select.value = opt.value;
        break;
      }
    }
  }

  if (typeof updateCustomDropdown === 'function') {
    updateCustomDropdown(newIndex);
  }

  newIndex = Math.max(minPage, Math.min(maxPage, newIndex));
  if (current === newIndex) return;

  // Animate all number spans out
  const prevSpan = document.getElementById("navPrevNumber");
  const currentSpan = document.getElementById("currentNumber");
  const nextSpan = document.getElementById("navNextNumber");

  const direction = newIndex > current ? "down" : "up";
  const outClass = direction === "down" ? "anim-out-up" : "anim-out-down";

  [prevSpan, currentSpan, nextSpan].forEach(span => {
    if (span) {
      span.classList.remove("anim-in", "anim-out-up", "anim-out-down");
      span.classList.add(outClass);
    }
  });

  // Update sections
  nextSections.forEach((section, i) => {
    if (i === newIndex - 1) {
      gsap.set(section, { autoAlpha: 1, display: "block" });
    } else {
      gsap.set(section, { autoAlpha: 0, display: "none" });
    }
  });

  // After the transition, update and slide all numbers in
  setTimeout(() => {
    current = newIndex;
    updateNavDisplay(current);

    document.getElementById("navPrevNumber")?.classList.add("anim-in");
    document.getElementById("currentNumber")?.classList.add("anim-in");
    document.getElementById("navNextNumber")?.classList.add("anim-in");
  }, 300); // match transition in CSS
}



// document.getElementById('sectionsUpdate').addEventListener('change', function() {
//   const page = parseInt(this.selectedOptions[0].dataset.page);
//   scrollToSectionByNumber(page);
// });


function updateNavDisplay(current) {
  navCenter.innerHTML = "";

  const prev = Math.max(0, current - 1);
  const next = current < maxPage ? current + 1 : null;

  const prevEl = document.createElement("div");
  prevEl.className = "nav-item nav-no-top-fade";
  prevEl.innerHTML = `<span class="sansation" id="navPrevNumber">${formatNumber(prev)}</span>`;
  navCenter.appendChild(prevEl);

  const currentEl = document.createElement("div");
  currentEl.className = "nav-item";
  currentEl.innerHTML = `
    <span class="sansation" id="currentNumber">${formatNumber(current)}</span>
    <img src="../nav/page_no_container.svg" alt="page no container">
  `;
  navCenter.appendChild(currentEl);

  const nextEl = document.createElement("div");
  nextEl.className = "nav-item nav-no-bottom-fade";
  nextEl.innerHTML = `<span class="sansation" id="navNextNumber">${next !== null ? formatNumber(next) : ""}</span>`;
  navCenter.appendChild(nextEl);

  // Optionally, add the 'anim-in' class to fade and slide in as soon as they're inserted
  document.getElementById("navPrevNumber")?.classList.add("anim-in");
  document.getElementById("currentNumber")?.classList.add("anim-in");
  document.getElementById("navNextNumber")?.classList.add("anim-in");
}


function scrollToSectionByNumber(pageNumber, forceInstant = true) {
  pageNumber = Math.max(1, Math.min(nextSections.length, pageNumber));
  const triggers = ScrollTrigger.getAll().filter(st => st.animation && st.vars.pin);
  if (triggers.length) {
    const st = triggers[0];
    const totalSections = nextSections.length;
    const fadeStart = 4.5;
    const fadeStep = 1;
    const idx = pageNumber - 1;
    const totalDuration = st.animation.duration();

    let progress;
    if (pageNumber === totalSections) {
      progress = 1;
    } else {
      const seekTime = fadeStart + idx * fadeStep;
      progress = Math.min(1, Math.max(0, seekTime / totalDuration));
    }

    const { start, end } = st;
    const targetScroll = start + (end - start) * progress;

    const currentScroll = window.scrollY;
    const scrollDistance = Math.abs(currentScroll - targetScroll);

    // Decide when to "force instant" (customize: 1 for dropdowns, or any far jump)
    if (forceInstant || scrollDistance > window.innerHeight * 1.1) {
      // Instant skip for far jumps (e.g. About <-> Animations)
      gsap.set(window, {
        scrollTo: { y: targetScroll, autoKill: false }
      });
      // Immediately update sections and navbar UI
      if (typeof animateToIndex === "function") animateToIndex(pageNumber);
    } else {
      // Animate as usual for near jumps
      let duration = Math.max(0.6, Math.min(1.2, scrollDistance / 2000));
      gsap.to(window, {
        scrollTo: { y: targetScroll, autoKill: false },
        duration: duration,
        ease: "power2.out"
      });
    }
  }
}




// Optional product bounce
window.animateValve = function(element) {
  element.style.transform = 'translateY(-5px) scale(1.1) rotateY(180deg)';
  setTimeout(() => {
    element.style.transform = 'translateY(0) scale(1) rotateY(0deg)';
  }, 600);
};
