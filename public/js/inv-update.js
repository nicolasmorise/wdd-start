document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#updateForm");

  form.addEventListener("change", function () {
    const updateBtn = form.querySelector("button[type='submit']");
    if (updateBtn) {
      updateBtn.removeAttribute("disabled");
    }
  });
});
