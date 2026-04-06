window.addEventListener("scroll", function () {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById("progressBar").style.width = (scrollTop / scrollHeight) * 100 + "%";
});