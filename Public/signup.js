let Name = document.getElementById("name");
let Email = document.getElementById("email");
let Mobile = document.getElementById("mobile");
let password = document.getElementById("inputPassword");
let cpassword = document.getElementById("cpass");
let error = document.getElementById("serror");
// handleOnsunmitEvent();

const isError = '<%= message %>';
console.log(isError);

function isValid() {
    if (Name.value == "" || Email.value == "" || Mobile.value == "" || Mobile.value == "") {
        error.innerHTML = "All field are required!";
        error.style.backgroundColor = "#F2DEDE";
        return false;
    }
    else if (Name.value.length < 3) {
        error.innerHTML = "User Name require minimum 3 character";
        error.style.backgroundColor = "#F2DEDE";
        Name.focus();
        return false;
    }
    else if (Email.value.length < 12) {
        error.innerHTML = "Please enter valid email";
        error.style.backgroundColor = "#F2DEDE";
        Email.focus();
        return false;
    }
    else if (Mobile.value.length < 10) {
        error.innerHTML = "please enter valid mobile no!";
        error.style.backgroundColor = "#F2DEDE";
        Mobile.focus();
        return false;
    }
    else if (password.value.length < 8) {
        error.innerHTML = "Password must be minimum 8 character!";
        error.style.backgroundColor = "#F2DEDE";
        password.focus();
        return false;
    }
    else if (password.value != cpassword.value) {
        error.innerHTML = "Password are not matched!";
        error.style.backgroundColor = "#F2DEDE";
        cpassword.focus();
        return false
    }
    else if (isError) {
        error.innerText = isError;
        error.style.backgroundColor = "#F2DEDE";
    }
    else {
        return true
    }
}

function handleOnsunmitEvent() {
    if (isValid()) {
        return true;
    }
    else {
        return false
    }
}