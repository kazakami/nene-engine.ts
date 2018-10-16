function FileLoad(url: string, callback: (str: string) => void): void {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.addEventListener("load", (event) => {
        const response = this.response;
        if (status === "200") {
            callback(response);
        } else {
            console.log("error");
        }
    }, false);
    return;
}

function UndefCoalescing<T>(input: T, defaultValue: T): T {
    if (typeof input === "undefined") {
        return defaultValue;
    } else {
        return input;
    }
}

export { FileLoad, UndefCoalescing };
