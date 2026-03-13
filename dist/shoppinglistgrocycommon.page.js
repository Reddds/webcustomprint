let imageBase64 = undefined;

$(() => {

    function CreateGroupsList(groupId) {
        const $groupSelect = $("#group");
        $groupSelect.empty();

        groups.forEach(group => {
            var option = $('<option/>');
            option.attr({ 'value': group.id }).text(group.name);
            if (groupId == group.id) {
                option.attr({ 'selected': 'selected' });
            }
            $groupSelect.append(option);
        });

        // alert(groups);
    }

    function CreateQUList(prodQuId) {
        const $countTypeSelect = $("#addCountType");
        $countTypeSelect.empty();

        qus.forEach(qu => {
            var option = $('<option/>');
            option.attr({ 'value': qu.id }).text(qu.name);
            // if (prodQuId == qu.id) {
            //     option.attr({ 'selected': 'selected' });
            // }
            $countTypeSelect.append(option);
        });

        const $addCountParts = $("#addCountParts");
        const $addCountPartsCol = $("#addCountPartsCol");

        $countTypeSelect.off();
        $countTypeSelect.on("change", (e) => {
            // debugger;
            const quIdStr = $(e.currentTarget).val();
            if (!quIdStr) {
                $addCountPartsCol.addClass("d-none");
                return;
            }
            const quId = parseInt(quIdStr);
            const qu = qus.find(q => q.id === quId);
            if (!qu?.userfields?.add_part_variants) {
                $addCountPartsCol.addClass("d-none");
                return;
            }

            $addCountParts.empty();
            const quPartSpl = qu.userfields.add_part_variants.split(',');
            quPartSpl.forEach((quPart, i) => {
                var option = $('<option/>');
                option.attr({ 'value': quPart }).text(quPart);
                // if (groupId == qu.id) {
                //     option.attr({ 'selected': 'selected' });
                // }
                $addCountParts.append(option);
            });
            $addCountPartsCol.removeClass("d-none");
        });


        // if(prodQuId) {
        //     $countTypeSelect.val(prodQuId);
        // }

        // const selectedQu = qus.find(q => q.id === prodQuId);
        // if(selectedQu) {

        // }

        // alert(groups);
    }

    $(".addProdButton").on("click", function () {
        imageBase64 = undefined;
        const $but = $(this);
        const groupId = $but.data("groupId");
        const groupName = $but.data("groupName");
        const elId = $but.data("elId");
        const templateName = $but.data("templateName");
        const addCountTypeId = $but.data("addCountTypeId");

        $("#editProdModal #groupId").val(groupId);
        $("#editProdModal #prodName").val("");
        $("#editProdModal #elId").val(elId);
        $("#editProdModal #templateName").val(templateName);
        $("#editProdModal #imageUrl").val("");

        CreateGroupsList(groupId);
        CreateQUList();

        $("#editProdModal .modal-title").text(`Добавление товара в '${groupName}'`);
        var editProdModalEl = document.querySelector('#editProdModal');
        var editProdModal = bootstrap.Modal.getOrCreateInstance(editProdModalEl);
        $("#prodImg").hide();
        editProdModal.show();
    });

    $("body").on("click", ".editProdButton, .prod-edit", function () { //#v-pills-tabContent
        const $but = $(this);
        const prodId = $but.data("prodId");
        const prodName = $but.data("prodName");
        const prodImage = $but.data("prodImage");
        const addCountType = $but.data("addCountType");
        const groupId = $but.data("groupId");
        const groupName = $but.data("groupName");
        const templateName = $but.data("templateName");
        const addCountTypeId = $but.data("addCountTypeId");
        const addCountPart = $but.data("addCountPart");
        const elId = $but.data("elId");// $(`.tab-pane.active .container`).attr('id');
        if (!elId) {
            alert("Не найдена открытая категория!");
            return;
        }

        // debugger;

        $("#editProdModal #prodId").val(prodId);
        $("#editProdModal #groupId").val(groupId);
        $("#editProdModal #prodName").val(prodName);
        $("#editProdModal #elId").val(elId);
        $("#editProdModal #templateName").val(templateName);
        $("#editProdModal #imageUrl").val("");

        CreateGroupsList(groupId);
        CreateQUList(addCountTypeId);


        $("#editProdModal .modal-title").text(`Изменение товара в '${groupName}'`);
        var editProdModalEl = document.querySelector('#editProdModal');
        var editProdModal = bootstrap.Modal.getOrCreateInstance(editProdModalEl);
        if (prodImage) {
            $("#prodImg").attr("src", prodImage);
            imageBase64 = prodImage;
            $("#prodImg").show();
        } else {
            $("#prodImg").hide();
        }
        //if (addCountType) {
        console.log(`addCountType `, addCountType)
        // $("#editProdModal #addCountType").val(addCountType ?? 0);
        $("#editProdModal #addCountType")
            .val(addCountTypeId)
            .trigger("change");
        //}
        editProdModal.show();
    });


    $("#editProdForm").on("submit", function (event) {

        /** Если была смена группы */
        const prodGroupId = parseInt($("#group").val());
        const templateName = $("#templateName").val();

        //const $form = $(this);
        const elId = $("#elId").val();
        const formData = {
            id: $("#prodId").val(),
            name: $("#prodName").val(),
            groupId: $("#groupId").val(),
            /** Если была смена группы */
            prodGroupId,
            image: imageBase64,
            addCountType: $("#addCountType").val(),
            addCountPart: $("#addCountParts").val(),
            templateName,
            elId,

        };

        //alert(JSON.stringify(formData));

        //console.log("elId", elId);
        //debugger;
        $(`#${elId}`).load("/shoppinglist_grocy/addedit", formData, function () {
            // Обновляем группу, куда переехал товар
            if (prodGroupId != groupId) {
                const otherElId = `group-content-${prodGroupId}`;
                $(`#${otherElId}`).load(`/shoppinglist_grocy/groupview/${otherElId}/${templateName}/${prodGroupId}`, function () {
                    // SyncFromCookies();
                });
            }
        });


        const editProdModalEl = document.querySelector('#editProdModal');
        const editProdModal = bootstrap.Modal.getOrCreateInstance(editProdModalEl);
        editProdModal.hide();

        event.preventDefault();
    });

    $("#applyProdEdit").on("click", () => {
        $("#editProdForm").trigger("submit");
    });


    const getBase64StringFromDataURL = (dataURL) =>
        dataURL.replace('data:', '').replace(/^.+,/, '');

    // $("#buttonPasteImage").on("click", async () => {
    //     const text = await navigator.clipboard.readText();
    //     alert(text);
    // });

    $("#buttonClearImageUrl").on("click", () => {
        $("#imageUrl").val("");
    });

    $("#buttonImageFromUrl").on("click", () => {
        const url = $("#imageUrl").val().trim();
        if (!url) {
            alert("Введите URL картинки");
            return;
        }

        $.post('/shoppinglistgrocy/loadimagefromurl', { url })
            .done(function (data) {
                if (!data.success) {
                    alert(JSON.stringify(data));
                    return;
                }
                imageBase64 = data.imageBase64;
                $('#prodImg').attr('src', data.imageBase64).show();
            });

        // $.ajax({
        //     url: url,
        //     cache: false,
        //     crossDomain: true,
        //     // This is the important part
        //     xhrFields: {
        //         withCredentials: true
        //     },
        //     xhr: function () {// Seems like the only way to get access to the xhr object
        //         var xhr = new XMLHttpRequest();
        //         xhr.responseType = 'blob'
        //         return xhr;
        //     },
        //     success: function (data) {
        //         console.log("image data", data);
        //         var img = document.getElementById('img');
        //         var url = window.URL || window.webkitURL;
        //         img.src = url.createObjectURL(data);
        //     },
        //     error: function () {

        //     }
        // });
    });

    document.onpaste = function (event) {
        $("#imageUrl").val("");
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        //console.log(JSON.stringify(items)); // might give you mime types
        //alert(JSON.stringify(items));
        for (var index in items) {
            var item = items[index];
            if (item.kind === 'file') {
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function (event) {
                    imageBase64 = event.target.result;// getBase64StringFromDataURL(event.target.result);
                    // console.log(event.target.result); // data url!
                    $('#prodImg').attr('src', event.target.result).show();
                    //$("#prodImg");
                };
                reader.readAsDataURL(blob);
            }
        }
    };
});