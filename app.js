(function () {
   var u = "contact",
      d = "nextanalyticx",
      t = "com",
      e = u + "@" + d + "." + t;
   var a = document.getElementById("emailCta"),
      x = document.getElementById("emailText");
   if (a && x) {
      a.setAttribute("href", "mailto:" + e);
      x.textContent = e;
   }
})();

(function () {
   var t = document.getElementById("stackTrack");
   if (t) {
      t.innerHTML += t.innerHTML;
   }
})();

(function () {
   var form = document.getElementById("contactForm"),
      status = document.getElementById("formStatus"),
      btn = document.getElementById("submitBtn");
   if (!form) return;
   form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "";
      status.textContent = "";
      btn.disabled = true;
      btn.textContent = "Sending...";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
         .then(function (r) {
            return r.json();
         })
         .then(function (d) {
            if (d.success) {
               status.className = "form-status-success";
               status.textContent = "✓ Thanks — your message is on its way. We'll respond within 24 hours.";
               form.reset();
            } else {
               throw new Error(d.message || "fail");
            }
         })
         .catch(function () {
            status.className = "form-status-error";
            status.textContent = "Something went wrong. Please email us directly at contact@nextanalyticx.com.";
         })
         .finally(function () {
            btn.disabled = false;
            btn.textContent = "Send Message →";
         });
   });
})();
const accordion = document.getElementById("faq-accordion");

accordion.querySelectorAll(".faq-trigger").forEach((trigger) => {
   trigger.addEventListener("click", () => {
      const item = trigger.closest(".faq-item");
      const body = item.querySelector(".faq-body");
      const icon = item.querySelector(".faq-icon");
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      // Close all
      accordion.querySelectorAll(".faq-item").forEach((el) => {
         el.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
         el.querySelector(".faq-body").classList.remove("grid-rows-[1fr]");
         el.querySelector(".faq-body").classList.add("grid-rows-[0fr]");
         el.querySelector(".faq-icon").classList.remove("rotate-180");
         el.classList.remove("!border-[#1D9E75]", "!shadow-md");
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
         trigger.setAttribute("aria-expanded", "true");
         body.classList.remove("grid-rows-[0fr]");
         body.classList.add("grid-rows-[1fr]");
         icon.classList.add("rotate-180");
         item.classList.add("!border-[#1D9E75]", "!shadow-md");
      }
   });
});

const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");
const closeBtn = document.getElementById("sidebar-close");
const locationBadge = document.getElementById("location-badge");

// Location badge visibility at 1090px
function handleLocationBadge() {
   if (window.innerWidth >= 1090) {
      locationBadge.style.display = "flex";
   } else {
      locationBadge.style.display = "none";
   }
}
handleLocationBadge();
window.addEventListener("resize", handleLocationBadge);

function openSidebar() {
   sidebar.classList.remove("translate-x-full");
   overlay.classList.remove("opacity-0", "pointer-events-none");
   document.body.style.overflow = "hidden";
}

function closeSidebar() {
   sidebar.classList.add("translate-x-full");
   overlay.classList.add("opacity-0", "pointer-events-none");
   document.body.style.overflow = "";
}

hamburger.addEventListener("click", openSidebar);
closeBtn.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

// Close on ANY link inside sidebar (nav links + Get Started CTA)
sidebar.querySelectorAll("a").forEach((link) => {
   link.addEventListener("click", closeSidebar);
});
