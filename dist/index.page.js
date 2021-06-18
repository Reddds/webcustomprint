$(() => {
    /*
    
    Для минимального шрифта 56 символов

    
    */
    let rowWidth = 56;

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




    function DrawRightBorder() {
        // const $areas = $("textarea.bg-text-for-print, textarea.text-for-print");
        // $areas.prop("cols", rowWidth + 4);

        // switch (rowWidth) {
        //     case 33:
        //         $areas.removeClass("print-row-len-42 print-row-len-56").addClass("print-row-len-33");
        //         break;
        //     case 42:
        //         $areas.removeClass("print-row-len-33 print-row-len-56").addClass("print-row-len-42");
        //         break;
        //     case 56:
        //         $areas.removeClass("print-row-len-42 print-row-len-33").addClass("print-row-len-56");
        //         break;
        // }


        const $bgTextForPrint = $("#bgTextForPrint");
        let bgText = "";
        const rows = 20;
        for (let i = 0; i < rows; i++) {
            for (let c = 0; c < rowWidth; c++) {
                bgText += " ";
            }
            bgText += "|";
            if (i < rows - 1) {
                bgText += "\n";
            }
        }
        $bgTextForPrint.val(bgText);
    }
    DrawRightBorder();

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
            CheckSettings();
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
        const raw = $('input[name=raw]').val();

        const title = $('input[name=title]').val();

        // console.log("raw", raw);

        $("#busyIndicatorLabel, #busyIndicatorAltLabel").text(action === "print" ? "Печать" : "Обработка");
        const busyIndicator = new bootstrap.Modal(document.getElementById('busyIndicator'), {
            keyboard: false
        });
        busyIndicator.show();
        $.post("/print", {
            action,
            title,
            textForPrint: textForPrintStr,
            printMode: printModeStr,
            lineSpacing: lineSpacingStr,
            charFont: charFontStr,
            cpiMode: cpiModeStr,
            raw
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
    }

    function Print() {
        Send("print");
    }

    $("#btnPrint").on("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        Print();
    });

    $(document).on("keypress", function(event) {
        if (event.which == 13) {
            event.preventDefault();
            Print();
        }
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

    });

    function CheckSettings() {

        const sets = [{
                rowLen: 33,
                printMode: 0,
                charFont: 0,
                cpiMode: 0
            },
            {
                rowLen: 42,
                printMode: 0,
                charFont: 0,
                cpiMode: 1
            },
            {
                rowLen: 42,
                printMode: 0,
                charFont: 0,
                cpiMode: 2
            },
            {
                rowLen: 42,
                printMode: 0,
                charFont: 1,
                cpiMode: 0
            },
            {
                rowLen: 56,
                printMode: 0,
                charFont: 1,
                cpiMode: 1
            },
            {
                rowLen: 56,
                printMode: 0,
                charFont: 1,
                cpiMode: 2
            },
            {
                rowLen: 33,
                printMode: 1,
                charFont: 0,
                cpiMode: 0
            },
            {
                rowLen: 42,
                printMode: 1,
                charFont: 0,
                cpiMode: 1
            },
            {
                rowLen: 56,
                printMode: 1,
                charFont: 0,
                cpiMode: 2
            },
            {
                rowLen: 33,
                printMode: 1,
                charFont: 1,
                cpiMode: 0
            },
            {
                rowLen: 56,
                printMode: 1,
                charFont: 1,
                cpiMode: 1
            },
            {
                rowLen: 56,
                printMode: 1,
                charFont: 1,
                cpiMode: 2
            },
        ];

        const printMode = parseInt($('input[name="printMode"]:checked').val());
        const charFont = parseInt($('input[name=charFont]:checked').val());
        const cpiMode = parseInt($('input[name=cpiMode]:checked').val());

        // console.log("printMode", printMode);
        // console.log("charFont", charFont);
        // console.log("cpiMode", cpiMode);

        for (let i = 0; i < sets.length; i++) {
            const set = sets[i];
            if (set.printMode === printMode && set.charFont === charFont && set.cpiMode === cpiMode) {
                console.log("row len", set.rowLen);
                rowWidth = set.rowLen;
                DrawRightBorder();
                $(`input[name="rowLen"][value="${rowWidth}"]`).prop('checked', true);
                break;
            }
        }
    }

    $('input[type=radio][name=printMode],input[type=radio][name=charFont],input[type=radio][name=cpiMode]')
        .on("change", function() {
            CheckSettings();
        });

    $('input[type=radio][name=rowLen]')
        .on("change", function() {
            console.log(this.value);

            const rowLen = parseInt(this.value);
            if (rowWidth === rowLen) {
                return;
            }
            rowWidth = rowLen;
            DrawRightBorder();

            let set = null;
            switch (rowLen) {
                case 33:
                    set = {
                        rowLen: 33,
                        printMode: 0,
                        charFont: 0,
                        cpiMode: 0
                    };
                    break;
                case 42:
                    set = {
                        rowLen: 42,
                        printMode: 0,
                        charFont: 1,
                        cpiMode: 0
                    };
                    break;
                case 56:
                    set = {
                        rowLen: 56,
                        printMode: 1,
                        charFont: 1,
                        cpiMode: 1
                    };
                    break;
            }

            $(`input[name="printMode"][value="${set.printMode}"]`).prop('checked', true);
            $(`input[name="charFont"][value="${set.charFont}"]`).prop('checked', true);
            $(`input[name="cpiMode"][value="${set.cpiMode}"]`).prop('checked', true);


        });

    document.onpaste = function(event) {
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        console.log(JSON.stringify(items)); // might give you mime types
        for (var index in items) {
            var item = items[index];
            if (item.kind === 'file') {
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function(event) {
                    // console.log(event.target.result); // data url!
                    $('#hiddenImg').attr('src', event.target.result);
                };
                reader.readAsDataURL(blob);
            }
        }
    };

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
                $('#hiddenImg').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    function u8arrayBufferToBase64(u8arr) {
        var binary = '';
        // var bytes = new Uint8Array( buffer );
        var len = u8arr.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(u8arr[i]);
        }
        return window.btoa(binary);
    }

    $('#hiddenImg').on("load", function() {
        $(this).imageHalftone({
            maxWidth: 550,
            maxHeight: 1000,
            output: 'canvas',
            target: function($newCanvas, raw) {
                $("#bgTextForPrint, #textForPrint").hide();
                $("#imageContainer").show().empty();
                $newCanvas.appendTo('#imageContainer');
                // const ctx = $newCanvas[0].getContext('2d');
                // const imgData = ctx.getImageData();
                // RGBA
                console.log(raw);

                const byteRowLen = Math.ceil(raw.width / 8);
                const printArray = new Uint8Array(byteRowLen * raw.height);
                let arrayPos = 0;
                for (let y = 0; y < raw.height; y++) {
                    let b = 0;
                    let curBit = 7;
                    for (let x = 0; x < raw.width; x++) {
                        const r = raw.data[y * raw.width * 4 + x * 4] < 127 ? 1 : 0;

                        b |= r << curBit;

                        if (curBit === 0 || x === raw.width - 1) {
                            printArray[arrayPos] = b;
                            arrayPos++;
                            // printArray.push(b);
                            b = 0;
                            curBit = 7;
                        } else {
                            curBit--;
                        }
                    }
                }

                const mode = 0;
                const xL = byteRowLen;
                const xH = 0;
                const yL = raw.height & 0xFF;
                const yH = (raw.height >> 8) & 0xFF;

                const header = new Uint8Array([0x1d, 0x76, 0x30, mode, xL, xH, yL, yH]);

                const allBuf = new Uint8Array([...header, ...printArray]);
                const b64 = u8arrayBufferToBase64(allBuf);

                $('input[name=raw]').val(b64);

                // console.log(printArray);
                // console.log(b64);
            }
        });
    });


    $("#imgInp").on("change", function() {
        readURL(this);
    });
});