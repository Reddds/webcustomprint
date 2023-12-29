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

        $("#editProdModal .modal-title").text(`Добавление товара в '${groupName}'`);
        var editProdModalEl = document.querySelector('#editProdModal');
        var editProdModal = bootstrap.Modal.getOrCreateInstance(editProdModalEl);
        $("#prodImg").hide();
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

    $("#buttonImageFromUrl").on("click", () => {
        const url = $("#imageUrl").val().trim();
        if (!url) {
            alert("Введите URL картинки");
            return;
        }
        $.ajax({
            url: url,
            cache: false,
            crossDomain: true,
            // This is the important part
            xhrFields: {
                withCredentials: true
            },
            xhr: function () {// Seems like the only way to get access to the xhr object
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob'
                return xhr;
            },
            success: function (data) {
                console.log("image data", data);
                var img = document.getElementById('img');
                var url = window.URL || window.webkitURL;
                img.src = url.createObjectURL(data);
            },
            error: function () {

            }
        });
    });

    document.onpaste = function (event) {
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