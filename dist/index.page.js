$(() => {
    $("#btnPrint").on("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const textForPrintStr = ($("#textForPrint").val()).trim();
        if (!textForPrintStr) {
            alert("Введите текст для печати!");
            return;
        }
        $.post("/print", { textForPrint: textForPrintStr }, (data) => {
            if (!data.success) {
                alert("Ошибка печати");
                return;
            }
            alert("Напечатано");
        }, "json");
    });
});