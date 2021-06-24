Date.prototype.dd_mm_yy = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [(dd > 9 ? '' : '0') + dd,
        (mm > 9 ? '' : '0') + mm,
        this.getFullYear() % 100,
    ].join('.');
};

$(() => {
    function Send(action, title, txt) {
        // const action = "print";
        $("#busyIndicatorLabel, #busyIndicatorAltLabel").text(action === "print" ? "Печать" : "Обработка");
        const busyIndicator = new bootstrap.Modal(document.getElementById('busyIndicator'), {
            keyboard: false
        });
        busyIndicator.show();
        $.post("/print", {
            action,
            title,
            textForPrint: txt,
            printMode: 0,
            lineSpacing: 64,
            charFont: 0,
            cpiMode: 0
        }, (data) => {
            console.log("data", data);
            if (!data.success) {
                alert(`Ошибка печати\n${data.message}`);
                return;
            }
            // console.log("busyIndicator", busyIndicator);
            busyIndicator.hide();
            // if (action !== "print") {
            //     alert("Готово");
            // }
        }, "json");
    };

    $("#clearBtn").on("click", () => {
        $("input.prod-btn:checked").prop("checked", false);
    });

    $("#printBtn").on("click", () => {
        const selectedProds = $("input.prod-btn:checked");
        if (selectedProds.length == 0) {
            alert("Ни один продукт не выбран");
            return;
        }

        const date = new Date();
        const title = `Надо купить ${date.dd_mm_yy()}`;
        let msg = `${title}\n\n`;
        let curGroupId = -1;
        selectedProds.each((i, el) => {
            const groupId = el.dataset["groupId"];
            if (curGroupId != groupId) {
                curGroupId = groupId;
                msg += `${el.dataset["groupName"]}:\n`;
            }
            msg += `  ${el.dataset["name"]}\n`;
        });
        // alert(msg);


        Send("print", title, msg);

    });
});