/* Eagle Web Creation: home page contact form.
   Messages are emailed through FormSubmit (no account needed). The first message ever
   sent triggers a one-time "activate this form" email to eaglewebcreation@gmail.com;
   nothing is delivered until that link is clicked. */
(function () {
  var ENDPOINT = "https://formsubmit.co/ajax/eaglewebcreation@gmail.com";
  var form = document.getElementById("contact-form");
  if (!form) return;
  var note = document.getElementById("contact-note");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    fetch(ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error();
        form.reset();
        note.textContent = "Thanks! I'll get back to you within one business day.";
      })
      .catch(function () {
        note.innerHTML = "That didn't go through. Please email <a href=\"mailto:eaglewebcreation@gmail.com\">eaglewebcreation@gmail.com</a> or call <a href=\"tel:+13072548972\">307-254-8972</a>.";
      })
      .then(function () { note.hidden = false; btn.disabled = false; });
  });
})();
