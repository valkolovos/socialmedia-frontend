"use strict";

function readURLOnload(e) {
    var deleteIcon = feather.icons.x.toSvg();
    var template = `
        <div class="upload-wrap" data-input-name="${e.target.inputName}">
            <img src="${e.target.result}" data-file-name="${e.target.fileName}" alt="">
            <span class="remove-file">
                ${deleteIcon}
            </span>
        </div>
    `;

    $(e.target.targetId).append(template);

    $('.remove-file').on('click', function(){
        let fileName = $(this).prev().data().fileName;
        let inputName = $(this).parent().data().inputName;
        let fileBuffer = Array.from($(`#${inputName}`)[0].files);
        // had to use a hack to remove a file from the immutable file list
        let removeIdx;
        for (var i = 0; i < fileBuffer.length; i++) {
            if (fileBuffer[i].name === fileName) {
                removeIdx = i;
            }
        }
        if (removeIdx !== undefined) {
            fileBuffer.splice(removeIdx, 1)
        }
        const dT = new ClipboardEvent('').clipboardData || // Firefox < 62 workaround exploiting https://bugzilla.mozilla.org/show_bug.cgi?id=1422655
            new DataTransfer(); // specs compliant (as of March 2018 only Chrome)
        for (var i = 0; i < fileBuffer.length; i++) {
          dT.items.add(fileBuffer[i]);
        }
        $(`#${inputName}`)[0].files = dT.files;
        $(this).closest('.upload-wrap').remove();
    });
}

export function readURL(input) {
    if (input.files) {
        $(`.upload-wrap[data-input-name="${input.id}"]`).remove();
        for (let i = 0; i < input.files.length; i++) {
            var reader = new FileReader();
            reader.fileName = input.files[i].name;
            reader.inputName = input.id;
            reader.targetId = input.dataset.targetId;
            reader.onload = readURLOnload;
            reader.readAsDataURL(input.files[i]);
        }
    }
}


