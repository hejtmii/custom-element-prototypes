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
        // Returns { value: string } in callback
        getValue: function (cb) {
            registerCallback('get-value-response', cb);
            sendMessage('get-value');
        },

        // Returns { success: true } or { error: Exception } in callback when done
        setValue: function (value, cb) {
            registerCallback('set-value-response', cb);
            sendMessage('set-value', {value});
        },

        // Returns { value: string } in callback
        getElementValue: function (elementId, cb) {
            registerCallback('get-value-response', cb);
            sendMessage('get-value', {elementId});
        },

        // Returns {
        //  projectId: Uuid;
        //  itemId: ContentItemId; { itemId: Uuid, variantId: Uuid }
        //  element: ICompiledContentItemElementData { elementId: Uuid, type: string, name: string; }
        //  previewUrl: string | undefined;
        //  disabled: boolean;
        // }
        // in callback
        getContext: function (cb) {
            var repetitiveCb = function (data) {
                cb(data);
                registerCallback('get-context-response', repetitiveCb)
            };
            registerCallback('get-context-response', repetitiveCb);
            sendMessage('get-context');
        },

        // Returns { value: string } in callback
        getClientRect: function (cb) {
            registerCallback('get-client-rect-response', cb);
            sendMessage('get-client-rect');
        },

        // Returns { success: true } in callback when done
        setSize: function (size, cb) {
            registerCallback('set-size-response', cb);
            sendMessage('set-size', size);
        },

        // Returns { elementIds: Uuid[] } (changed element ids) in callback when elements change
        observeChanges: function (elementIds, cb) {
            var repetitiveCb = function (data) {
              cb(data);
              registerCallback('elements-changed', repetitiveCb)
            };
            registerCallback('elements-changed', repetitiveCb);
            sendMessage('observe-changes', { elementIds });
        }
    };
};
window.CustomElement = new CustomElementClass();
