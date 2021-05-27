$(() => {
    /*
    
    Для минимального шрифта 56 символов

    
    */

    Date.prototype.yyyymmdd = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();

        return [this.getFullYear(),
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
        ].join('');
    };

    Date.prototype.dd_mm_yy = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();

        return [(dd > 9 ? '' : '0') + dd,
            (mm > 9 ? '' : '0') + mm,
            this.getFullYear() % 100,
        ].join('.');
    };

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
            let content = $("p.print-content", $cardForPrint).text();

            var date = new Date();
            content = content.replace("##DATA##", date.dd_mm_yy())

            $("#textForPrint").val(content);

            const printMode = $cardForPrint.data("printMode");
            const lineSpacing = $cardForPrint.data("lineSpacing");
            const charFont = $cardForPrint.data("charFont");
            const cpiMode = $cardForPrint.data("cpiMode");

            if (printMode !== null && printMode !== undefined) {
                $(`input[name="printMode"][value="${printMode}"]`).prop('checked', true);
            }
            if (printMode !== null && printMode !== undefined) {
                $(`input[name="lineSpacing"]`).val(lineSpacing);
            }
            if (charFont !== null && charFont !== undefined) {
                $(`input[name="charFont"][value="${charFont}"]`).prop('checked', true);
            }
            if (cpiMode !== null && cpiMode !== undefined) {
                $(`input[name="cpiMode"][value="${cpiMode}"]`).prop('checked', true);
            }
        });
    });


    function Send(action) {
        const textForPrintStr = ($("#textForPrint").val());
        if (!textForPrintStr) {
            alert("Введите текст для печати!");
            return;
        }

        const printModeStr = $('input[name="printMode"]:checked').val();
        const lineSpacingStr = $('input[name=lineSpacing]').val();
        const charFontStr = $('input[name=charFont]:checked').val();
        const cpiModeStr = $('input[name=cpiMode]:checked').val();

        const title = $('input[name=title]').val();

        $.post("/print", {
            action,
            title,
            textForPrint: textForPrintStr,
            printMode: printModeStr,
            lineSpacing: lineSpacingStr,
            charFont: charFontStr,
            cpiMode: cpiModeStr,
        }, (data) => {
            console.log("data", data);
            if (!data.success) {
                alert(`Ошибка печати\n${data.message}`);
                return;
            }
            alert("Готово");
        }, "json");
    }

    $("#btnPrint").on("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        Send("print");
    });

    $("#btnSave").on("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        Send("save");
    });

    $("#btnSaveAward").on("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        Send("saveAward");
    });

    $(".delete-file").on("click", function() {
        const $cardForPrint = $(this).closest("div.card.for-print");
        const fileName = $cardForPrint.data("fileName");
        if (!fileName) {
            return;
        }

        if (!confirm("Действительно удалить?")) {
            return;
        }

        $.ajax({
            url: '/',
            type: 'DELETE',
            data: { fileName },
            success: function(data) {
                // Do something with the result
                console.log("data", data);
                // const data = JSON.parse(result);
                if (!data.success) {
                    alert(data.message);
                    return;
                }

                $cardForPrint.closest("div.col").remove();
            }
        });

    })
});