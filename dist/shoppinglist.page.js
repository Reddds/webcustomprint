// const Cookies = require("js-cookie");

const selectionDataKey = "selectionData";

Date.prototype.dd_mm_yy = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [(dd > 9 ? '' : '0') + dd,
    (mm > 9 ? '' : '0') + mm,
    this.getFullYear() % 100,
    ].join('.');
};

/** Сколько символов в одной строке */
const charsInStroke = 33;
/** Сколько символов отведено под количество */
const quantityFieldWidth = 8;

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

    function NormalizeWeight(weightGr) {
        if (weightGr < 1000) {
            return `${weightGr} гр`;
        }
        return `${weightGr / 1000} кг`;
    }

    /** Запись в куки */
    function SyncToCookies() {

        const prodSelectList = [];
        const $selectedButtons = GetSelected();
        if ($selectedButtons.length === 0) {
            return;
        }

        $selectedButtons.each((i, el) => {
            const $btn = $(el);
            const id = $btn.attr('id');
            const curQuantity = $btn.data("quantity");
            if (!curQuantity) {
                return;
            }
            const name = el.dataset["name"];
            const quantityStr = $btn.data("quantityStr");
            prodSelectList.push({
                id,
                name,
                quantity: curQuantity,
                quantityStr
            });
        });

        Cookies.set(selectionDataKey, JSON.stringify(prodSelectList, undefined, 4));

        // alert(JSON.stringify(prodSelectList, undefined, 4));
    }

    /** Загрузка из куков */
    function SyncFromCookies() {
        const prodSelectListCookie = Cookies.get(selectionDataKey);
        if(!prodSelectListCookie) {
            return;
        }
        const prodSelectList = JSON.parse(prodSelectListCookie);
        if(!prodSelectList || prodSelectList.length === 0) {
            return;
        }

        prodSelectList.forEach(prodSel => {
            const $btn = $(`#${prodSel.id}`);
            // const curQuantity = $btn.data("quantity");
            SelectProd($btn);
            SetQuantity($btn, prodSel.quantity);
        });

        // alert(JSON.stringify(prodSelectList, undefined, 4));
    }

    function SetQuantity($btn, curQuantity) {
        const $prodQuantity = $(".prod-quantity", $btn);
        const addCountType = $btn.data("addCountType") ?? 0;
        switch (addCountType) {
            case 0:
                $btn.data("quantity", curQuantity);
                $btn.data("quantityStr", `${curQuantity} шт`);
                $prodQuantity.text(`${curQuantity} шт`);
                break;
            case 1:
                {
                    $btn.data("quantity", curQuantity);
                    const weight = NormalizeWeight(curQuantity);
                    $btn.data("quantityStr", weight);
                    $prodQuantity.text(weight);
                }
                break;
            case 2:
                {
                    $btn.data("quantity", curQuantity);
                    const weight = NormalizeWeight(curQuantity);
                    $btn.data("quantityStr", weight);
                    $prodQuantity.text(weight);
                }
                break;
        }
    }

    function SelectProd($btn) {
        const $butDelete = $btn.siblings(".prod-del");
        $butDelete.removeClass("d-none");
        $btn.removeClass("btn-outline-primary").addClass("btn-primary");
    }

    $("body").on("click", ".prod-add", function () {
        //console.log("prod-add click");
        const $btn = $(this);
        SelectProd($btn);
        // const $butDelete = $btn.siblings(".prod-del");
        const addCountType = $btn.data("addCountType") ?? 0;
        // const $prodQuantity = $(".prod-quantity", $btn);
        let curQuantity = $btn.data("quantity") ?? 0;
        //$btn.data("selected", 1);
        // $butDelete.removeClass("d-none");
        // $btn.removeClass("btn-outline-primary").addClass("btn-primary");
        switch (addCountType) {
            case 0:
                curQuantity++;
                // $btn.data("quantity", curQuantity);
                // $btn.data("quantityStr", `${curQuantity} шт`);
                // $prodQuantity.text(`${curQuantity} шт`);
                break;
            case 1:
                {
                    curQuantity += 100;
                    // $btn.data("quantity", curQuantity);
                    // const weight = NormalizeWeight(curQuantity);
                    // $btn.data("quantityStr", weight);
                    // $prodQuantity.text(weight);
                }
                break;
            case 2:
                {
                    curQuantity += 500;
                    // $btn.data("quantity", curQuantity);
                    // const weight = NormalizeWeight(curQuantity);
                    // $btn.data("quantityStr", weight);
                    // $prodQuantity.text(weight);
                }
                break;
        }
        SetQuantity($btn, curQuantity);
        SyncToCookies();
        //const 
    });

    function ClearButton($btn) {
        const $butDelete = $btn.siblings(".prod-del");
        const $prodQuantity = $(".prod-quantity", $btn);
        $btn.data("quantity", 0);
        //$btn.data("selected", undefined);
        $prodQuantity.empty();
        $butDelete.addClass("d-none");
        $btn.removeClass("btn-primary").addClass("btn-outline-primary");
    }

    $("body").on("click", ".prod-del", function () {
        //console.log("prod-del click");
        const $butDelete = $(this);
        const $btn = $butDelete.siblings(".prod-add");

        ClearButton($btn);

        SyncToCookies();

        // //const addCountType = $btn.data("addCountType") ?? 0;
        // const $prodQuantity = $(".prod-quantity", $btn);
        // $btn.data("quantity", 0);
        // $prodQuantity.empty();
        // $butDelete.addClass("d-none");
        // $btn.removeClass("btn-primary").addClass("btn-outline-primary");
    });

    function GetSelected() {
        const $selectedButtons = $(".prod-add").filter(function () {
            return ($(this).data("quantity") ?? 0) > 0;
        });
        return $selectedButtons;
    }

    $("#clearBtn").on("click", () => {
        //$("input.prod-btn:checked").prop("checked", false);
        const $selectedButtons = GetSelected();
        //console.log("$selectedButtons", $selectedButtons);
        $selectedButtons.each(function () {
            ClearButton($(this));
        });
    });

    $("#editBtn").on("click", () => {
        $("body").toggleClass("edit");
    });

    $("#printBtn").on("click", () => {
        const $selectedButtons = GetSelected();
        if ($selectedButtons.length === 0) {
            alert("Ни один продукт не выбран_");
            return;
        }

        const date = new Date();
        const title = `Надо купить ${date.dd_mm_yy()}`;
        let msg = `${title}\n\n`;
        let curGroupId = -1;
        $selectedButtons.each((i, el) => {
            const $btn = $(el);
            //console.log("$btn", $btn);
            const groupId = el.dataset["groupId"];
            if (curGroupId != groupId) {
                curGroupId = groupId;
                msg += `${el.dataset["groupName"]}:\n`;
            }
            const name = el.dataset["name"];
            const quantity = $btn.data("quantityStr");

            if (2 + name.length + quantityFieldWidth > charsInStroke) {
                msg += `  ${name} ${quantity}\n`;
            } else {
                const nameWithDotsLen = charsInStroke - (quantityFieldWidth + 2);
                msg += `  ${name.padEnd(nameWithDotsLen, '.')} ${quantity}\n`;
            }
        });

        // const selectedProds = $("input.prod-btn:checked");
        // if (selectedProds.length == 0) {
        //     alert("Ни один продукт не выбран");
        //     return;
        // }

        // const date = new Date();
        // const title = `Надо купить ${date.dd_mm_yy()}`;
        // let msg = `${title}\n\n`;
        // let curGroupId = -1;
        // selectedProds.each((i, el) => {
        //     const groupId = el.dataset["groupId"];
        //     if (curGroupId != groupId) {
        //         curGroupId = groupId;
        //         msg += `${el.dataset["groupName"]}:\n`;
        //     }
        //     msg += `  ${el.dataset["name"]}\n`;
        // });
        //alert(msg);


        Send("print", title, msg);

    });



    SyncFromCookies();

    $(".loading-container").remove();
});