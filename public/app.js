document.addEventListener("DOMContentLoaded", function() {
    const dropZone = document.querySelector(".draggable-zone");
    const fileInput = dropZone.querySelector("input");
    const uploadForm = document.querySelector(".hero-section__file-form");
    const status = document.querySelector(".draggable-zone__status");
    const uploadedFile = document.querySelector(".uploaded-file");
    const fileLinkInput = document.getElementById("file-link");

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");

        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            fileInput.onchange(new Event("change"));
        }
    });

    fileInput.onchange = function () {
        dropZone.querySelector(".draggable-zone__title").innerText = `Выбран файл: ${fileInput.files[0].name}`;
    }

    uploadForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!fileInput.files.length) {
            alert("Выберите файл!");
            return;
        }

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/files", true);

        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                let percent = Math.round((event.loaded / event.total) * 100);
                document.querySelector(".draggable-zone__progress").style.width = percent + "%";
                status.innerText = percent + "% загружено";
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                onFileProcessed("uploaded");
                uploadedFile.classList.add("active");
                status.innerText = "Файл успешно загружен!";

                let data = JSON.parse(xhr.responseText);
                fileLinkInput.value = data.link;
            } else {
                onLoadingError();
            }
        };

        xhr.onerror = onLoadingError;
        function onLoadingError() {
            onFileProcessed("error");
            document.querySelector(".draggable-zone__progress").style.width = 0;
            status.innerText = "Ошибка при загрузке.";
        }

        xhr.send(formData);
        uploadForm.classList.add("uploading");
        uploadForm.querySelector("button").disabled = true;

        uploadedFile.classList.remove("active");
        fileLinkInput.value = "";

        function onFileProcessed(status) {
            uploadForm.querySelector("button").disabled = false;
            uploadForm.classList.remove("uploading");
            uploadForm.classList.add(status);
        }


    });
});