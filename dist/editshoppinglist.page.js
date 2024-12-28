$(() => {
    // let imageBase64 = undefined;

    // $(".addProdButton").on("click", function () {
    //     imageBase64 = undefined;
    //     const $but = $(this);
    //     const groupId = $but.data("groupId");
    //     const groupName = $but.data("groupName");
    //     const elId = $but.data("elId");

    //     $("#editProdModal #groupId").val(groupId);
    //     $("#editProdModal #prodName").val("");
    //     $("#editProdModal #elId").val(elId);

    //     $("#editProdModal .modal-title").text(`Добавление товара в '${groupName}'`);
    //     var editProdModalEl = document.querySelector('#editProdModal');
    //     var editProdModal = bootstrap.Modal.getOrCreateInstance(editProdModalEl);
    //     $("#prodImg").hide();
    //     editProdModal.show();
    // });

    // $("#v-pills-tabContent").on("click", ".editProdButton, .prod-edit", function () {
    //     const $but = $(this);
    //     const prodId = $but.data("prodId");
    //     const prodName = $but.data("prodName");
    //     const prodImage = $but.data("prodImage");
    //     const addCountType = $but.data("addCountType");
    //     const groupId = $but.data("groupId");
    //     const groupName = $but.data("groupName");
    //     const templateName = $but.data("templateName");
    //     const elId = $(`.tab-pane.active .container`).attr('id');
    //     if (!elId) {
    //         alert("Не найдена открытая категория!");
    //         return;
    //     }

    //     $("#editProdModal #prodId").val(prodId);
    //     $("#editProdModal #groupId").val(groupId);
    //     $("#editProdModal #prodName").val(prodName);
    //     $("#editProdModal #elId").val(elId);
    //     $("#editProdModal #templateName").val(templateName);

    //     $("#editProdModal .modal-title").text(`Изменение товара в '${groupName}'`);
    //     var editProdModalEl = document.querySelector('#editProdModal');
    //     var editProdModal = bootstrap.Modal.getOrCreateInstance(editProdModalEl);
    //     if (prodImage) {
    //         $("#prodImg").attr("src", prodImage);
    //         imageBase64 = prodImage;
    //         $("#prodImg").show();
    //     } else {
    //         $("#prodImg").hide();
    //     }
    //     //if (addCountType) {
    //         console.log(`addCountType `, addCountType)
    //         $("#editProdModal #addCountType").val(addCountType ?? 0);
    //     //}
    //     editProdModal.show();
    // });

    $("#v-pills-tabContent").on("click", ".deleteProdButton", function () {
        //debugger;
        const $but = $(this);
        const prodId = $but.data("prodId");
        const prodName = $but.data("prodName");
        //const prodImage = $but.data("prodImage");
        const groupId = $but.data("groupId");

        const elId = $(`.tab-pane.active .container`).attr('id');
        if (!elId) {
            alert("Не найдена открытая категория!");
            return;
        }
        //const groupName = $but.data("groupName");

        if (!window.confirm(`Действительно удалить товар '${prodName}' (${prodId})?`)) {
            return;
        }

        const formData = {
            id: prodId,
            groupId,
        };

        $(`#${elId}`).load("delete", formData);

    });

    // Добавление товара в ещё одну группу
    $("#v-pills-tabContent").on("click", ".addToGroupProdButton", function () {
        //debugger;
        const $but = $(this);
        const prodId = $but.data("prodId");
        const prodName = $but.data("prodName");
        //const prodImage = $but.data("prodImage");
        const groupId = $but.data("groupId");


        $("#addToGroupModal .prodId").val(prodId);
        $("#addToGroupModal .groupId").val(groupId);
        $("#addToGroupModal .prodName").val(prodName);



        var addToGroupModalEl = document.querySelector('#addToGroupModal');
        var addToGroupModal = bootstrap.Modal.getOrCreateInstance(addToGroupModalEl);

        addToGroupModal.show();


    });


    // $("#editProdForm").on("submit", function (event) {

    //     //const $form = $(this);
    //     const elId = $("#elId").val();
    //     const formData = {
    //         id: $("#prodId").val(),
    //         name: $("#prodName").val(),
    //         groupId: $("#groupId").val(),
    //         image: imageBase64,
    //         addCountType: $("#addCountType").val(),
    //     };

    //     //alert(JSON.stringify(formData));

    //     //debugger;
    //     $(`#${elId}`).load("addedit", formData);

    //     const editProdModalEl = document.querySelector('#editProdModal');
    //     const editProdModal = bootstrap.Modal.getOrCreateInstance(editProdModalEl);
    //     editProdModal.hide();

    //     event.preventDefault();
    // });

    // $("#applyProdEdit").on("click", () => {
    //     $("#editProdForm").trigger("submit");
    // });

    $("#addToGroupForm").on("submit", function (event) {

        const newGroupId = $("#otherGroups").val();
        const curGroupIdStr = $("#groupId").val();
        let curGroupId;
        if (curGroupIdStr) {
            curGroupId = parseInt(curGroupIdStr);
        }

        if (!newGroupId) {
            alert("Выберите группу!");
            return;
        }

        const formData = {
            id: $("#addToGroupForm .prodId").val(),
            groupId: newGroupId
        };

        $.getJSON({
            type: "POST",
            url: "addtogroup",
            data: formData,
            dataType: "json",
            encode: true,
        }).done(function (data) {
            const addToGroupModalEl = document.querySelector('#addToGroupModal');
            const addToGroupModal = bootstrap.Modal.getOrCreateInstance(addToGroupModalEl);
            addToGroupModal.hide();

            if (data.success) {
                alert("Готово");
                // Перезагружаем если товар ушёл из несгруппированных, потому что он там пропадает. 
                // А если он уже был в группе, не пропадает
                if (!curGroupId) {
                    location.reload();
                }
            }
            else {
                alert(data.message);
            }
            console.log(data);
            //alert(JSON.stringify(data));
        });

        event.preventDefault();
    });

    $("#applyAddToGroupEdit").on("click", () => {
        $("#addToGroupForm").trigger("submit");
    });

    const getBase64StringFromDataURL = (dataURL) =>
        dataURL.replace('data:', '').replace(/^.+,/, '');



    // document.onpaste = function (event) {
    //     var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    //     console.log(JSON.stringify(items)); // might give you mime types
    //     for (var index in items) {
    //         var item = items[index];
    //         if (item.kind === 'file') {
    //             var blob = item.getAsFile();
    //             var reader = new FileReader();
    //             reader.onload = function (event) {
    //                 imageBase64 = event.target.result;// getBase64StringFromDataURL(event.target.result);
    //                 // console.log(event.target.result); // data url!
    //                 $('#prodImg').attr('src', event.target.result).show();
    //                 //$("#prodImg");
    //             };
    //             reader.readAsDataURL(blob);
    //         }
    //     }
    // };
});