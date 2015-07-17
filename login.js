function clearErrors() {
  document.getElementById('login-error-report').textContent = "";
  document.getElementById('php-error-report').textContent = "";
  document.getElementById('signup-password-error').textContent = "";
  document.getElementById('signup-username-error').textContent = "";
}

function requestLogin() {
  clearErrors();
  
  var username = document.getElementById('login-username').value;
  var password = document.getElementById('login-password').value;
  
  if ((username == "") || (password == "")) {
    var target = document.getElementById('login-error-report');
    target.textContent = "You must enter a username and password to login."
    return;
  }
  
  var req = new XMLHttpRequest();
  if(!req){
    var target = document.getElementById('login-error-report');
    target.textContent = "Could Not make XMLHttpRequest";
    return;
  }
  var url = "login.php";
  
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      var response = JSON.parse(this.responseText);
      
      if (!(response.error === undefined)){
        document.getElementById('php-error-report').textContent = response.error;
        return;
      }
      
      //if successful login, forward user to calendar
      if (response.loginSuccess == 1) {
        window.location.assign('calendar.html');
        return;
      }
      
      //other
      if (response.loginSuccess == 0) {
        document.getElementById('login-error-report').textContent = "Could not find matching username and password.";
      }

    }
  };
  
  req.open('GET', url+"?action=login&username="+encodeURIComponent(username)+"&password="+encodeURIComponent(password));
  req.send();
}

function signUp() {
  
  var username = document.getElementById('signup-username').value;
  var password = document.getElementById('signup-password').value;
  var password2 = document.getElementById('signup-password-confirm').value;
  var error = false;
  
  clearErrors();
  
  if (password != password2) {
    error = true;
    target = document.getElementById('signup-password-error');
    target.textContent = "Passwords do no match.  Try again";
  }
  
  if (password.length == 0) {
    error = true;
    target = document.getElementById('signup-password-error');
    target.textContent = "You must choose a password.";
  }
  
  if (username.length == 0) {
    error = true;
    target = document.getElementById('signup-username-error');
    target.textContent = "You must choose a username";
  }
  
  if (error === true) {
    return;
  }
  
  var req = new XMLHttpRequest();
  
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      var response = JSON.parse(this.responseText);
      
      if (!(response.error === undefined)){
        target = document.getElementById('php-error-report');
        target.textContent = response.error;
        return;
      }
      
      //if successful login, forward user to calendar
      if (response.signupSuccess === 1) {
        window.location.assign('calendar.html');
        return;
      }
      
      if (response.usernameTaken === 1) {
        target = document.getElementById('signup-username-error');
        target.textContent = "Username is already taken. Please choose another.";
      }

    }
  }
    
  req.open('GET', 'login.php?action=signUp&username='+encodeURIComponent(username)+'&password='+encodeURIComponent(password));
  req.send();
}

window.onload = function () {
  //check the status of the session -- if logged in, forward to calendar.html
  var req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState === 4){
      var response = JSON.parse(this.responseText);
      
      if (response.loggedIn == 1) {
        window.location.assign('calendar.html');
        return;
      }
    }
  };
  
  req.open('GET', 'login.php?action=sessionStatus');
  req.send();
};