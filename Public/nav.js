
// navbar toggle
$(document).ready(function () {
    $("#icon").click(function () {
        $("#navToggle").slideToggle(500)
    });
});


const navLink = document.getElementsByClassName("link");
// console.log(navLink);

// console.log(navLink[0]);

function handleOnclick(x) {
    console.groupCollapsed(x);
    for (let i = 0; i < navLink.length; i++) {
        navLink[i].classList.remove("active");
    }
    navLink[x].classList.add("active");

}