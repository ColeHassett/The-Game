/**
 * LOGIN JS FUNCTIONS
 */

var username_input;
var password_input;
var login_button;

function loadPage() {

  var container_div = document.createElement("div");
  container_div.id = "login_div";

  var login_header_text = document.createElement("h1");
  login_header_text.innerHTML = "Login";

  username_input = document.createElement("input");
  username_input.type = "text";
  username_input.placeholder = "Username";
  username_input.id = "username_input";

  password_input = document.createElement("input")
  password_input.type = "password";
  password_input.placeholder = "Password";
  password_input.id = "password_input";

  login_button = document.createElement("input");
  login_button.type = "button";
  login_button.value = "Login";
  login_button.id = "login_button";
  login_button.addEventListener("click", function() {
    doLogin();
  });

  container_div.appendChild(login_header_text);
  container_div.appendChild(username_input);
  container_div.appendChild(document.createElement("br"));
  container_div.appendChild(password_input);
  container_div.appendChild(document.createElement("br"));
  container_div.appendChild(document.createElement("br"));
  container_div.appendChild(login_button);

  document.body.appendChild(container_div);

}
