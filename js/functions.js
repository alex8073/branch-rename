const playAudio = () => {
    const audio = document.getElementById("sound");
    audio.play();
};

const addClassToElement = (element, className) => {
    document.getElementById(element).classList.add(className);
};

const removeClassFromElement = (element, className) => {
    document.getElementById(element).classList.remove(className);
};

const showImage = async () => {
    removeClassFromElement("magic-img", "magic-img--hidden");
    playAudio();
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            addClassToElement("magic-img", "magic-img--hidden");
            resolve(true);
        }, 2000);
    });
    return promise;
};

const showResult = (result) => {
    removeClassFromElement("result-wrapper", "result-wrapper--hidden");
    document.getElementById("result-input").value = result;
};

const convertValue = async () => {
    const type = document.getElementById("type-buttons-container").elements[
        "branchType"
    ].value;
    const originalName = document.getElementById("name").value;
    if (originalName) {
        addClassToElement("result-wrapper", "result-wrapper--hidden");
        const id = originalName.split(" ")[0];
        const parsedName =
            id +
            originalName
                .replace(id, "")
                .replace(/[^a-zа-яА-Я0-9\s]/gi, "")
                .split(" ")
                .join("_");
        await showImage();
        showResult(type + parsedName);
    } else {
        addClassToElement("name", "name--error");
        setTimeout(() => {
            removeClassFromElement("name", "name--error");
        }, 700);
    }
};

const copyToClipboard = () => {
    const input = document.getElementById("result-input");
    input.setAttribute("readonly", "");
    const el = document.createElement("textarea");
    el.value = input.value;
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    removeClassFromElement("copy-button", "copy");
    addClassToElement("copy-button", "copy--success");

    setTimeout(() => {
        removeClassFromElement("copy-button", "copy--success");
        addClassToElement("copy-button", "copy");
    }, 3000);
};
