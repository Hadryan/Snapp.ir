var mergeArray = [];
var setColumn = function (columnIndex, rowIndex, column, sheet) {
    sheet.set(columnIndex, rowIndex, column.data + "");
    if (column.colspan) {
        mergeArray.push([{col: columnIndex, row: rowIndex}, {col: columnIndex + column.colspan - 1, row: rowIndex}]);
    }
    if (column.rowspan) {
        mergeArray.push([{col: columnIndex, row: rowIndex}, {col: columnIndex, row: rowIndex + column.rowspan - 1}]);
    }
    if (column.width) {
        sheet.width(columnIndex, column.width);
    }
    if (column.height) {
        sheet.height(rowIndex, column.height);
    }
    if (column.align) {
        sheet.align(columnIndex, rowIndex, column.align);
    }
    if (column.valign) {
        sheet.valign(columnIndex, rowIndex, column.valign);
    }
    if (column.rotate) {
        sheet.rotate(columnIndex, rowIndex, column.rotate);
    }
    if (column.font) {
        sheet.font(columnIndex, rowIndex, column.font);
    }
    if (column.fill) {
        sheet.fill(columnIndex, rowIndex, column.fill);
    }
    if (column.border) {
        sheet.border(columnIndex, rowIndex, column.border);
    }
};
exports.generate = function (params, callback) {
    //https://www.npmjs.com/package/msexcel-builder
    var excel = require('msexcel-builder');
    var workbook = excel.createWorkbook('./public/app/', params.fileName + '.xlsx', 'sample.xlsx');
    var sheet1 = workbook.createSheet('sheet1', params.colsCount, params.rowsCount);
    var rowIndex = 1;

    if (params.headers && params.headers.length) {
        params.headers.forEach(function (row) {
            row.forEach(function (column, columnIndex) {
                if (column.data) {
                    setColumn(columnIndex + 1, rowIndex, column, sheet1);
                } else if (parseInt(column.data) === 0) {
                    setColumn(columnIndex + 1, rowIndex, column, sheet1);
                }
            });
            rowIndex++;
        });
    }

    if (params.rows && params.rows.length) {
        params.rows.forEach(function (row) {
            row.forEach(function (column, columnIndex) {
                if (column.data) {
                    setColumn(columnIndex + 1, rowIndex, column, sheet1);
                }
            });
            rowIndex++;
        });
    }

    if (params.footers && params.footers.length) {
        params.footers.forEach(function (row) {
            row.forEach(function (column, columnIndex) {
                if (column.data) {
                    setColumn(columnIndex + 1, rowIndex, column, sheet1);
                }
            });
            rowIndex++;
        });
    }

    mergeArray.forEach(function (item) {
        sheet1.merge(item[0], item[1]);
    });
    workbook.save(function (ok) {
        if (!ok) {
            workbook.cancel();
            callback({Result: false});
        } else {
            console.log('congratulations, your workbook created');
            callback({Result: true});
        }
    });
};