$(() => {
    /*
    
    Для минимального шрифта 56 символов

    
    */

    const $bgTextForPrint = $("#bgTextForPrint");
    let bgText = "";
    const rows = 20;
    for (let i = 0; i < rows; i++) {
        for (let c = 0; c < 56; c++) {
            bgText += " ";
        }
        bgText += "|";
        if (i < rows - 1) {
            bgText += "\n";
        }
    }
    $bgTextForPrint.val(bgText);



    $("div.card.for-print a.open-content").each(function() {
        $(this).on("click", function() {
            const $cardForPrint = $(this).closest("div.card.for-print");
            const content = $("p.print-content", $cardForPrint).text();
            $("#textForPrint").val(content);

        });
    });




    $("#btnPrint").on("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const textForPrintStr = ($("#textForPrint").val());
        if (!textForPrintStr) {
            alert("Введите текст для печати!");
            return;
        }
        $.post("/print", { textForPrint: textForPrintStr }, (data) => {
            console.log("data", data);
            if (!data.success) {
                alert(`Ошибка печати\n${data.message}`);
                return;
            }
            alert("Напечатано");
        }, "json");
    });
});