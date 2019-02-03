onmessage = (event: MessageEvent) => {
    postMessage(event.data + "hoge");
};
