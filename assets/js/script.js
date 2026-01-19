console.log("%cBUILD MODE ▸ ACTIVE", "color:#00ffd5; font-weight: bold;");

$(document).ready(function () {
  const navBtn = $(".nav-link");
  const upBtn = $("#backToTop");

  navBtn.on("click", function (e) {
    e.preventDefault();
    let section = $(this).attr("href");

    $("html, body").animate({ 
      scrollTop: $(section).offset().top - 70 }, 600);

    navBtn.removeClass("active");
    $(this).addClass("active");
  });

  $(window).on("scroll", function () {
    let position = $(this).scrollTop();

    if (position > 300) { upBtn.addClass("show"); } 
    else { upBtn.removeClass("show"); }

    navBtn.each(function () {
      let target = $(this).attr("href");
      let sectionTop = $(target).offset().top - 100;

      if (position >= sectionTop) {
        navBtn.removeClass("active");
        $(this).addClass("active");
      }
    });
  });
});