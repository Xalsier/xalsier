function showFormat(format) {

    document.getElementById("player-audiobook").style.display = "none";
    document.getElementById("player-visualnovel").style.display = "none";
    document.getElementById("player-shortstory").style.display = "none";
    document.getElementById("player-book").style.display = "none";

    document.getElementById("player-" + format).style.display = "block";

    document.querySelectorAll(".texas-btn").forEach(button => {
        button.classList.remove("active");
        button.classList.add("inactive");
    });

    document.getElementById("button-" + format).classList.remove("inactive");
    document.getElementById("button-" + format).classList.add("active");
}