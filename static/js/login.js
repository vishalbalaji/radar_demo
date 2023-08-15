let signin = document.getElementById("signin-button");
let back = document.getElementById("back-button");
let backUser = document.getElementById("back-user");
let info_container = document.getElementById("info-container");
let login_container = document.getElementById("login-container");

signin.addEventListener("click", function() {
  info_container.style.opacity = "0";
  login_container.style.opacity = "1";
  info_container.style.order = 2;
  login_container.style.order = 1;
});

back.addEventListener("click", function() {
  info_container.style.opacity = "1";
  login_container.style.opacity = "0";
  info_container.style.order = 1;
  login_container.style.order = 2;
});
