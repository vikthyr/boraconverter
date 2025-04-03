$(document).ready(function () {
    if(localStorage.getItem("theme") == "dark"){
        $("body").addClass("dark-mode");
        $('#toggle-dark-mode').html(`<i class="bi bi-brightness-high-fill"></i>`);
    }else{
        $('#toggle-dark-mode').html(`<i class="bi bi-moon-fill"></i>`);
    }

    $('#toggle-dark-mode').on('click', function () {
        $('body').toggleClass('dark-mode');

        if($('body').hasClass('dark-mode')){
            $('#toggle-dark-mode').html(`<i class="bi bi-brightness-high-fill"></i>`);
            localStorage.setItem("theme", "dark");
        }else{
            $('#toggle-dark-mode').html(`<i class="bi bi-moon-fill"></i>`);
            localStorage.setItem("theme", "light");
        }
      });
});