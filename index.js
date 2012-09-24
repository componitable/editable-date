var emitter = require('emitter');
var editable = require('editable');

module.exports = makeEditable;
function makeEditable(elements, options) {
    options = options || {};
    options.displayFormat = options.displayFormat || function (date) {
        return date.toDateString();
    };
    options.updateFormat = options.updateFormat || function (date) {
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    };
    editable.click(elements, function (element) {
        if (element.getAttribute('data-in-edit-mode') == 'true') return;
        element.setAttribute('data-in-edit-mode', 'true');
        edit(element, options);
    });
}
emitter(makeEditable);

function edit(element, options) {
    var dimensions;
    var oldStyle;
    if (options.maintainSize === true) {
        dimensions = editable.dimensions(element);
    }
    emit('pre-begin-edit', element);
    var value = element.textContent;
    element.innerHTML = '';
    var edit = document.createElement('input');
    edit.type = "date";
    edit.value = value;
    element.appendChild(edit);
    if (options.maintainSize === true) {
        var editDimensions = editable.transformDimensions(edit, dimensions);
        edit.style.width = editDimensions.width + 'px';
        edit.style.height = editDimensions.height + 'px';
        oldStyle = {width: element.style.width, height: element.style.height};
        element.style.width = dimensions.width + 'px';
        element.style.height = dimensions.height + 'px';
    }
    edit.focus();
    editable.blur(edit, function () {
        if (element.getAttribute('data-in-edit-mode') != 'true') return;
        if (!Date.parse(edit.value)) {
            edit.focus();
            //todo: display validation error
            return;
        }
        element.setAttribute('data-in-edit-mode', 'false');
        emit('pre-end-edit', element);
        var newVal = new Date(edit.value);
        element.innerHTML = options.displayFormat(newVal);
        element.style.width = oldStyle.width;
        element.style.height = oldStyle.height;
        if (value != edit.value) {
            emit('update', element, options.updateFormat(newVal));
        }
        emit('post-end-edit', element);
    });
    emit('post-begin-edit', element);
}

function emit() {
    module.exports.emit.apply(module.exports, arguments);
    editable.emit.apply(editable, arguments);
}