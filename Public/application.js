date = new Date().getFullYear();

const parent = document.getElementById("session");
const newChild1 = document.createElement("option");
const newChild2 = document.createElement("option");
const newChild3 = document.createElement("option");

newChild1.value = `${date - 3}-${date}`;
newChild2.value = `${date - 4}-${date - 1}`;
newChild3.value = `${date - 5}-${date - 2}`;

newChild1.textContent = `${date - 3}-${date}`;
newChild2.textContent = `${date - 4}-${date - 1}`;
newChild3.textContent = `${date - 5}-${date - 2}`;

parent.append(newChild1);
parent.append(newChild2);
parent.append(newChild3);
// ----------------------------------------------------------------------
const passYear = document.getElementById("passYear");
const pyChild1 = document.createElement("option");
const pyChild2 = document.createElement("option");
const pyChild3 = document.createElement("option");

pyChild1.value = `${date}`;
pyChild2.value = `${date - 1}`;
pyChild3value = `${date - 2}`;

pyChild1.textContent = `${date}`;
pyChild2.textContent = `${date - 1}`;
pyChild3.textContent = `${date - 2}`;

passYear.append(pyChild1);
passYear.append(pyChild2);
passYear.append(pyChild3);

// Multipart form start

const form = document.getElementById('application');
const fileInput = document.getElementById('file-upload');
const sigInput = document.getElementById('sig-upload');
const fileErr = document.getElementById('FileError');
const sigErr = document.getElementById('sigError');


let currentTab = 0;

showTab(currentTab);

function showTab(n) {
    let allTab = document.getElementsByClassName("tab");
    allTab[n].style.display = "block";

    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }

    if (n == (allTab.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Next";
    }
}

function nextPrev(n) {
    let allTab = document.getElementsByClassName("tab");

    if (n == 1 && !validateForm()) return false;

    allTab[currentTab].style.display = "none";

    currentTab = currentTab + n;

    if (currentTab >= allTab.length) {

        if (confirm("Do you really want to submit the application!<br/>Please Verify details before submit")) {
            alert("Your application submitted successfully!");
            document.getElementById("application").submit();
            return false;
        }
    }
    showTab(currentTab);
}

function validateForm() {

    let x, y, z, p, i, valid = true;
    x = document.getElementsByClassName("tab");

    // accessing current tab (input field )
    y = x[currentTab].getElementsByClassName("input");
    z = x[currentTab].getElementsByTagName("select");
    p = x[currentTab].getElementsByTagName("textarea");
    let allField = [...y, ...z, ...p];

    for (i = 0; i < allField.length; i++) {

        if (allField[i].value == "") {
            allField[i].className += " invalid";
            valid = false;
        }
    }

    return (valid) ? true : false;
}

// Multipart form end

function fileValidation(fileInp, errId) {

    const file = fileInp.files[0];
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const allowedSize = 1024 * 1024 * 2; // 2 MB

    if (!file) {
        showError('Please select a file.', errId);
        return false;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
        showError('Invalid file type. Allowed types: ' + allowedExtensions.join(', '), errId);
        return false;
    }

    if (file.size > allowedSize) {
        showError('File size exceeds limit of ' + (allowedSize / 1024 / 1024) + ' MB.', errId);
        return false;
    }

    showError("File successfully Uploaded....", errId);
    return true;
}

function showError(message, errId) {
    errId.innerText = message;
}

function handleChange(x) {
    fileValidation(x, fileErr);
}

function handleSignChange(x) {
    fileValidation(x, sigErr);
}

