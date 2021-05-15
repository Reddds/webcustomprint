$(() => {
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