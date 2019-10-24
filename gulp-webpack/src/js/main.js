$(document).ready(function(){
    let arrBlock = [
        "page-block-dlpoy9btuh",
        "page-block-0bykj43wzzkh",
        "page-block-fkq4lu6p1vn",
        "page-block-1wzfnor0ak6"
    ]
    let cursl = 0;
    var endsl = arrBlock.length - 1;

    $(".sl-content div").each(function (i) {
        $('#' + arrBlock[i]).detach().prependTo($(this));
    });

    function showSlItem(delay = 67) {
        var itemDelay = delay || 1000;
        $(".sl-content>div").fadeOut(itemDelay);
        $("#item-sl" + cursl).fadeIn(itemDelay);
        $(".sl-control>div").removeClass("active");
        $("[data-itemsl='" + cursl + "']").addClass("active");
    }

    showSlItem(0);

    $("#slider-land .sl-control div").click(function(){
        cursl = parseInt($(this).attr("data-itemsl"), 10);
        showSlItem()
    });

    $("#sl-left").click(function(){
        cursl = (cursl === 0 ? endsl : cursl - 1);
        showSlItem()
    });

    $("#sl-right").click(function(){
        cursl = (cursl === endsl ? 0 : cursl + 1);
        showSlItem()
    });
});