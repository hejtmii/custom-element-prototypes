var CustomElementClass = function() {
    var callbacks = {};

    function sendMessage(type, data) {
        window.parent.postMessage({ type, data }, "*");
    }

    function registerCallback(type, cb, allowMultiple) {
        if (!cb) {
            return;
        }
        var list = callbacks[type] = allowMultiple ? callbacks[type] || [] : [];
        list.push(cb);
    }

    function executeCallbacks(type, data) {
        var list = callbacks[type];
        callbacks[type] = null;
        if (list) {
            list.forEach(cb => {
                cb(data);
            });
        }
    }

    function processMessage() {
        // Origin check
        //if (event.origin !== '') { return; }

        const message = event.data || {};
        executeCallbacks(message.type, message.data || {});
    }

    window.addEventListener('message', processMessage, true)

    return {
        getValue: function (cb) {
            registerCallback('get-value-response', cb);
            sendMessage('get-value');
        },
        setValue: function (cb) {
            registerCallback('set-value-response', cb);
            sendMessage('set-value', { value });
        },
        getElementValue: function (elementId, cb) {
            registerCallback('get-value-response', cb);
            sendMessage('get-value', { elementId });
        },
        getClientRect: function (cb) {
            registerCallback('get-client-rect-response', cb);
            sendMessage('get-client-rect');
        },
        setSize: function (size, cb) {
            registerCallback('set-size-response', cb);
            sendMessage('set-size', size);
        }
    };
};
window.CustomElement = new CustomElementClass();
