/* Eagle Web Creation: home page contact form.
   Messages are emailed through FormSubmit (no account needed). The first message ever
   sent triggers a one-time "activate this form" email to eaglewebcreation@gmail.com;
   nothing is delivered until that link is clicked.
   FormSubmit sometimes delivers the email but answers the page very slowly, so after
   WAIT_MS the visitor gets a thank-you (with a backup way to reach me) instead of a
   stuck, greyed-out button. */
(function () {
  var ENDPOINT = "https://formsubmit.co/ajax/eaglewebcreation@gmail.com";
  var WAIT_MS = 12000;
  var BACKUP = "<a href=\"mailto:eaglewebcreation@gmail.com\">eaglewebcreation@gmail.com</a> or call <a href=\"tel:+13072548972\">307-254-8972</a>";
  var form = document.getElementById("contact-form");
  if (!form) return;
  var note = document.getElementById("contact-note");
  var sending = false;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var btn = form.querySelector("button[type=submit]");
    var data = new FormData(form);
    var settled = false;
    sending = true;
    btn.disabled = true;

    function finish(html, clear) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (clear) form.reset();
      note.innerHTML = html;
      note.hidden = false;
      btn.disabled = false;
      sending = false;
    }

    var timer = setTimeout(function () {
      finish("Thanks! Your message is on its way. If you don't hear back within one business day, email " + BACKUP + ".", true);
    }, WAIT_MS);

    fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error();
        finish("Thanks! I'll get back to you within one business day.", true);
      })
      .catch(function () {
        finish("That didn't go through. Please email " + BACKUP + ".", false);
      });
  });
})();
