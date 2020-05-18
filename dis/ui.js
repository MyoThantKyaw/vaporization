var btnInfo = document.getElementById("btnInfo");
btnInfo.addEventListener("click", function (evt) {
    // threeD.pauseAnimation();
    $('.ui.modal').modal('show');
});

var btnHome = document.getElementById("btnHome");

btnHome.addEventListener("click", function (evt) {
    threeD.resetView();
});





