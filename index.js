var emitter = require('emitter');
var editable = require('editable');

module.exports = makeEditable;
function makeEditable(elements, options) {
    options = options || {};
    options.displayFormat = options.displayFormat || function (date) {
        if (date)
            return date.toDateString();
        else
            return '';
    };
    options.updateFormat = options.updateFormat || RFCDate;
    options.parseDate = options.parseDate || function (dateString) {
        return dateString ? new Date(dateString) : null;
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
    var value = options.parseDate(element.textContent.trim());
    element.innerHTML = '';
    var edit = document.createElement('input');
    edit.type = "date";
    edit.value = RFCDate(value);
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
        if (!Date.parse(edit.value) && edit.value !== '') {
            setTimeout(function () {
                edit.focus();
            }, 10);
            //todo: display validation error
            return;
        }
        element.setAttribute('data-in-edit-mode', 'false');
        emit('pre-end-edit', element);
        var newVal = edit.value ? new Date(edit.value) : null;
        element.innerHTML = options.displayFormat(newVal);
        element.style.width = oldStyle.width;
        element.style.height = oldStyle.height;
        if (RFCDate(value) != RFCDate(edit.value)) {
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

function RFCDate(date) {
    if (date) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        if (year < 1000) {
            throw new Error('Does\'t support dates that old');
        }

        return year + '-' + month + '-' + day;
    } else {
        return null;
    }
    
}