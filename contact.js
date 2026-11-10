/* Eagle Web Creation: home page contact form.
   Messages are emailed through FormSubmit (no account needed). The first message ever
   sent triggers a one-time "activate this form" email to the inbox below;
   nothing is delivered until that link is clicked.
   FormSubmit sometimes delivers the email but answers the page very slowly, so after
   WAIT_MS the visitor gets a thank-you (with a backup way to reach me) instead of a
   stuck, greyed-out button. The slow request is then cancelled, because a hung
   request can get resent and land in the inbox more than once.
   Spam trap: FormSubmit's ajax endpoint ignores its _honey field, so the check is done
   here. If the hidden field is filled (a bot), nothing is sent and the bot just sees
   the normal thank-you. */
(function () {
  var ENDPOINT = "https://formsubmit.co/ajax/eaglewebcreation@gmail.com";
  var WAIT_MS = 12000;
  var BACKUP = "<a href=\"mailto:talon@eaglewebcreation.com\">talon@eaglewebcreation.com</a> or call <a href=\"tel:+13072548972\">307-254-8972</a>";
  var form = document.getElementById("contact-form");
  if (!form) return;
  var note = document.getElementById("contact-note");
  var sending = false;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var btn = form.querySelector("button[type=submit]");
    var trap = form.elements["_honey"];
    if (trap && trap.value) {
      form.reset();
      note.textContent = "Thanks! I'll get back to you within one business day.";
      note.hidden = false;
      return;
    }
    var data = new FormData(form);
    data.delete("_honey");
    var ctrl = window.AbortController ? new AbortController() : null;
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
      if (ctrl) ctrl.abort();
      finish("Thanks! Your message is on its way. If you don't hear back within one business day, email " + BACKUP + ".", true);
    }, WAIT_MS);

    fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" }, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        if (!r.ok) throw new Error();
        finish("Thanks! I'll get back to you within one business day.", true);
      })
      .catch(function () {
        finish("That didn't go through. Please email " + BACKUP + ".", false);
      });
  });
})();
