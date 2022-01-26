$(() => {
    const exampleModal = document.getElementById('imgModal')
    exampleModal.addEventListener('show.bs.modal', function(event) {
        // Button that triggered the modal
        const button = event.relatedTarget;
        // Extract info from data-bs-* attributes
        const imgUrl = button.getAttribute('data-bs-img-url');
        const prodName = button.getAttribute('data-bs-prod-name');
        // If necessary, you could initiate an AJAX request here
        // and then do the updating in a callback.
        //
        // Update the modal's content.
        const modalTitle = exampleModal.querySelector('.modal-title');
        const modalimg = exampleModal.querySelector('.modal-body .modal-prod-img');

        modalTitle.textContent = prodName;
        modalimg.src = imgUrl;
    })
});