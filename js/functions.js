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

const getLanguage = () => {
    return document.getElementById("type-buttons-container").elements[
        "language"
    ].value;
};

const sendRequest = async (url, data) => {
    const response = await fetch(url, {
        body: JSON.stringify(data),
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    return response.json();
};

const convertValue = async () => {
    const type = document.getElementById("type-buttons-container").elements[
        "branchType"
    ].value;
    const originalName = document.getElementById("name").value;
    if (originalName) {
        addClassToElement("result-wrapper", "result-wrapper--hidden");
        let id = "";
        if (originalName.split(" ")[0].includes("-")) {
            id = originalName.split(" ")[0];
        }
        switch (getLanguage()) {
            case "translit": {
                const parsedName =
                    rus2lat(id) +
                    rus2lat(originalName.replace(id, ""))
                        .replace(/[^A-Za-zа-яА-Я0-9\s]/gi, "")
                        .split(" ")
                        .join("_");
                await showImage();
                showResult(type + parsedName);
                break;
            }
            case "translate": {
                const name = originalName.replace(id, "");
                const response = await sendRequest(
                    "http://dev-sc-api.ti-service.by/api/v1/translate",
                    { data: name },
                );
                const { data } = response;
                if (data) {
                    const parsedName =
                        id +
                        "_" +
                        data
                            .replace(/[^A-Za-zа-яА-Я0-9\s]/gi, "")
                            .split(" ")
                            .join("_");
                    await showImage();
                    showResult(type + parsedName);
                }
                break;
            }
            default: {
                const parsedName =
                    id +
                    originalName
                        .replace(id, "")
                        .replace(/[^A-Za-zа-яА-Я0-9\s]/gi, "")
                        .split(" ")
                        .join("_");
                await showImage();
                showResult(type + parsedName);
                break;
            }
        }
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

const rus2lat = (str) => {
    var ru = {
            а: "a",
            б: "b",
            в: "v",
            г: "g",
            д: "d",
            е: "e",
            ё: "e",
            ж: "j",
            з: "z",
            и: "i",
            к: "k",
            л: "l",
            м: "m",
            н: "n",
            о: "o",
            п: "p",
            р: "r",
            с: "s",
            т: "t",
            у: "u",
            ф: "f",
            х: "h",
            ц: "c",
            ч: "ch",
            ш: "sh",
            щ: "shch",
            ы: "y",
            э: "e",
            ю: "u",
            я: "ya",
        },
        nStr = [];

    str = str.replace(/[ъь]+/g, "").replace(/й/g, "i");

    for (var i = 0; i < str.length; ++i) {
        nStr.push(
            ru[str[i]] ||
                (ru[str[i].toLowerCase()] == undefined && str[i]) ||
                ru[str[i].toLowerCase()].toUpperCase(),
        );
    }
    return nStr.join("");
};
