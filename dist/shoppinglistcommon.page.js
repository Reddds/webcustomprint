let imageBase64 = undefined;

$(() => {

    $(".addProdButton").on("click", function () {
        imageBase64 = undefined;
        const $but = $(this);
        const groupId = $but.data("groupId");
        const groupName = $but.data("groupName");
        const elId = $but.data("elId");
        const templateName = $but.data("templateName");

        $("#editProdModal #groupId").val(groupId);
        $("#editProdModal #prodName").val("");
        $("#editProdModal #elId").val(elId);
        $("#editProdModal #templateName").val(templateName);
        $("#editProdModal #imageUrl").val("");

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
        const elId = $but.data("elId");// $(`.tab-pane.active .container`).attr('id');
        if (!elId) {
            alert("Не найдена открытая категория!");
            return;
        }

        $("#editProdModal #prodId").val(prodId);
        $("#editProdModal #groupId").val(groupId);
        $("#editProdModal #prodName").val(prodName);
        $("#editProdModal #elId").val(elId);
        $("#editProdModal #templateName").val(templateName);
        $("#editProdModal #imageUrl").val("");

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
            $("#editProdModal #addCountType").val(addCountType ?? 0);
        //}
        editProdModal.show();
    });


    $("#editProdForm").on("submit", function (event) {

        //const $form = $(this);
        const elId = $("#elId").val();
        const formData = {
            id: $("#prodId").val(),
            name: $("#prodName").val(),
            groupId: $("#groupId").val(),
            image: imageBase64,
            addCountType: $("#addCountType").val(),
            templateName: $("#templateName").val(),
            elId
        };

        //alert(JSON.stringify(formData));

        //console.log("elId", elId);
        //debugger;
        $(`#${elId}`).load("/shoppinglist/addedit", formData);

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

        $.post('/shoppinglist/loadimagefromurl', {url})
            .done(function (data) {
                if(!data.success) {
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