$(function () {
    $.widget("custom.minMaxCellDimensions", {
        // default options
        options: {
            maxRowHeaderCellWidth : "50px",
            minRowHeaderCellWidth : "30px",
            maxRowHeaderCellHeight : "30px",
            minRowHeaderCellHeight : "30px",
            maxColumnHeaderCellWidth : "100px",
            minColumnHeaderCellWidth : "30px",
            maxColumnHeaderCellHeight : "30px",
            minColumnHeaderCellHeight : "30px",
            sizeUniformly : true
        },

        magicNumber : 1,

        // the constructor
        _create: function () {
            var that = this,
                clonedTable = this.element.clone(true),
                playground = $("<div></div>", {
                    css : {
                        position : "absolute"
                        }
                }),
                tableDefinition = {
                    measurements: {
                        columnHeader: {
                            largestWidth : 0,
                            largestHeight : 0
                        },
                        rowHeader: {
                            largestWidth : 0,
                            largestHeight : 0
                        }
                    }
                };

            this.element.css({
                width : "auto !important",
                height : "auto !important"
            })

            playground.append(clonedTable);

            $("body").append(playground);
            // ensure the playground is big enough
            this._resizeWrapperToFitElement(playground, clonedTable);

            this._sizeColumnHeaderCells(clonedTable, tableDefinition);
            this._sizeRowHeaderCells(clonedTable, tableDefinition);

            playground.remove();
        },

        _sizeColumnHeaderCells : function(clonedTable, tableDefinition) {
            var that = this,
                $targetTableHeaderCells = this.element.find("thead th"),
                $sourceTableHeaderCells = clonedTable.find("thead th"),
                cellsInRow = this.element.find("thead tr:first-child th").length,
                rowHeaderCount = this._getRowHeaderCount();

            $sourceTableHeaderCells.each(function(cellIndex){
                var $headerCell = $(this),
                    headerCellText = that._util.trim($headerCell.text());

                if ((cellIndex + 1) % cellsInRow >  rowHeaderCount || (cellIndex + 1) % cellsInRow === 0)
                {
                    $headerCell
                        .text("")
                        .append($("<span></span>", {
                            class : "min-max-cell-dimensions-header-wrapper",
                            css : {
                                "max-width" : that.options.maxColumnHeaderCellWidth,
                                "min-width" : that.options.minColumnHeaderCellWidth,
                                "max-height" : that.options.maxColumnHeaderCellHeight,
                                "min-width" : that.options.minColumnHeaderCellHeight,
                                "overflow" : "hidden",
                                "text-overflow": "ellipsis",
                                "display" : "block"
                            },
                            text : headerCellText,
                            title : headerCellText
                        }));

                    var headerCellWidth = $headerCell.find("span").outerWidth(),
                        headerCellHeight = $headerCell.find("span").outerHeight();

                    if (tableDefinition.measurements.columnHeader.largestWidth < headerCellWidth) {
                        tableDefinition.measurements.columnHeader.largestWidth = headerCellWidth;
                    }
                    if (tableDefinition.measurements.columnHeader.largestHeight < headerCellHeight) {
                        tableDefinition.measurements.columnHeader.largestHeight = headerCellHeight;
                    }
                }

            });

            if (that.options.sizeUniformly) {
                $sourceTableHeaderCells.each(function() {
                    $(this).find("span").outerHeight(tableDefinition.measurements.columnHeader.largestHeight);
                    $(this).find("span").outerWidth(tableDefinition.measurements.columnHeader.largestWidth);
                });
            }

            $targetTableHeaderCells.each(function(i) {
                $(this)
                    .text("")
                    .empty()
                    .append($sourceTableHeaderCells.eq(i).children().eq(0).clone());
            });

        },

        _sizeRowHeaderCells : function(clonedTable, tableDefinition) {
            var that = this,
                $targetTableHeaderCells = this.element.find("tbody th, tfoot th"),
                $sourceTableHeaderCells = clonedTable.find("tbody th, tfoot th");

            $sourceTableHeaderCells.each(function(){
                var $headerCell = $(this),
                    headerCellText = that._util.trim($headerCell.text());

                $headerCell
                    .text("")
                    .append($("<span></span>", {
                        class : "min-max-cell-dimensions-header-wrapper",
                        css : {
                            "max-width" : that.options.maxRowHeaderCellWidth,
                            "min-width" : that.options.minRowHeaderCellWidth,
                            "max-height" : that.options.maxRowHeaderCellHeight,
                            "min-width" : that.options.minRowHeaderCellHeight,
                            "overflow" : "hidden",
                            "text-overflow": "ellipsis",
                            "display" : "block"
                        },
                        text : headerCellText,
                        title : headerCellText
                    }));

                var headerCellWidth = $headerCell.find("span").outerWidth(),
                    headerCellHeight = $headerCell.find("span").outerHeight();

                if (tableDefinition.measurements.rowHeader.largestWidth < headerCellWidth) {
                    tableDefinition.measurements.rowHeader.largestWidth = headerCellWidth;
                }
                if (tableDefinition.measurements.rowHeader.largestHeight < headerCellHeight) {
                    tableDefinition.measurements.rowHeader.largestHeight = headerCellHeight;
                }
            });

            if (that.options.sizeUniformly) {
                $sourceTableHeaderCells.each(function() {
                    $(this).find("span").outerHeight(tableDefinition.measurements.rowHeader.largestHeight);
                    $(this).find("span").outerWidth(tableDefinition.measurements.rowHeader.largestWidth);
                });
            }

            $targetTableHeaderCells.each(function(i) {
                $(this)
                    .text("")
                    .empty()
                    .append($sourceTableHeaderCells.eq(i).children().eq(0).clone());
            });

        },

        _util: {
            trim: function (stringToTrim) {
                if (stringToTrim.trim) {
                    return stringToTrim.trim();
                }
                else {
                    var leadingWhitespaceCharCount = 0,
                        charArrayBeingTrimmed = stringToTrim.split("");
                    while (charArrayBeingTrimmed[leadingWhitespaceCharCount].match(/\s/g)) {
                        leadingWhitespaceCharCount++;
                    }
                    charArrayBeingTrimmed.splice(0, leadingWhitespaceCharCount);

                    while (charArrayBeingTrimmed[charArrayBeingTrimmed.length - 1].match(/\s/g)) {
                        charArrayBeingTrimmed.splice(charArrayBeingTrimmed.length - 1, 1);
                    }

                    return charArrayBeingTrimmed.join("");
                }
            }
        },

        _getRowHeaderCount: function () {
            return this.element.find("tbody tr:first-child th").length;
        },


        _resizeWrapperToFitElement: function (wrapper, element) {
            var lastElementSize = { width: 0, height: 0 },
                newElementSize = function () {
                    return {
                        width: $(element).outerWidth(true),
                        height: $(element).outerHeight(true),
                        equalTo: function (anotherSize) {
                            return anotherSize.width === this.width && anotherSize.height === this.height;
                        }
                    }
                };

            wrapper.width(element.outerWidth(true));
            wrapper.height(element.outerHeight(true));

            while (!newElementSize().equalTo(lastElementSize)) {
                lastElementSize = newElementSize();
                wrapper.outerWidth(wrapper.outerWidth(true) + 100);
                wrapper.outerHeight(wrapper.outerHeight(true) + 100);
            }

            var fullyExpandedElementSize = newElementSize();

            wrapper.width(fullyExpandedElementSize.width + this.magicNumber);
            wrapper.height(fullyExpandedElementSize.height + this.magicNumber);
        },

        // called when created, and later when changing options
        _refresh: function () {
        },

        // events bound via _on are removed automatically
        // revert other modifications here
        _destroy: function () {
        },

        // _setOptions is called with a hash of all options that are changing
        // always refresh when changing options
        _setOptions: function () {
            // _super and _superApply handle keeping the right this-context
            this._superApply(arguments);
            this._refresh();
        },

        // _setOption is called for each individual option that is changing
        _setOption: function (key, value) {
            this._super( key, value );
        }
    });
});