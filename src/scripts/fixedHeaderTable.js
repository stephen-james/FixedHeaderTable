$(function () {
    $.widget("custom.fixedHeaderTable", {
        // default options
        options: {
        },

        // this is related to a weird behaviour where even with margin/padding 0 and using outerwidths
        // border box, we have to add the magic number to the size to ensure correct size
        // will need to fix this!
        magicNumber: 1,
        magicNumber2: 20,

        // the definition parsed from the table element is stored here
        tableDefinition: {
            autoSize: false,
            hasRowHeaders: false,
            hasColumnHeaders: false,
            measurements: {
                columnHeader: {
                    rows: [
                    ]
                },
                rowHeader: {
                    rows: [
                    ]
                }
            }
        },

        // wrapper references are kept in this object
        wrapper: {
            mainContainer: undefined,
            columnHeaderWrapper: undefined,
            rowHeaderWrapper: undefined,
            bodyWrapper: undefined
        },

        _setDefaultValues: function () {
            this.tableDefinition = {
                autoSize: false,
                hasRowHeaders: false,
                hasColumnHeaders: false,
                measurements: {
                    columnHeader: {
                        rows: [
                        ]
                    },
                    rowHeader: {
                        rows: [
                        ]
                    }
                }
            };

            this.wrapper = {
                mainContainer: undefined,
                columnHeaderWrapper: undefined,
                rowHeaderWrapper: undefined,
                bodyWrapper: undefined
            };
        },

        _parseTableDefinition: function () {
            var that = this,
                $columnHeaderRows = this.element.find("thead tr"),
                $rowHeaderRows = this.element.find("tbody tr"),
                rowHeaderDepth = this._getRowHeaderCount();



            // to ensure that no standard table behaviours of scaling to fit the container are applied,
            // wrap the element before parsing it's physical dimensions
            this._wrapElementForParsing();

            $columnHeaderRows.each(function (rowIndex, row) {
                var $columnHeaderRow = $(row),
                    columnHeaderRowDefinition = [];

                $columnHeaderRow.find("th").each(function (cellIndex, cell) {
                    if (cellIndex >= rowHeaderDepth) {
                        var $columnHeaderCell = $(cell);

                        if (!that.tableDefinition.hasColumnHeaders) {
                            that.tableDefinition.hasColumnHeaders = true;
                        }

                        columnHeaderRowDefinition.push({
                            width: $columnHeaderCell.outerWidth(),
                            height: $columnHeaderCell.outerHeight()
                        });
                    }
                });

                that.tableDefinition.measurements.columnHeader.rows.push(columnHeaderRowDefinition);
            });

            $rowHeaderRows.each(function (rowIndex, row) {
                var $rowHeaderRow = $(row);
                $rowHeaderRow.find("th").each(function (cellIndex, cell) {
                    var rowHeaderRowDefinition = [],
                        $rowHeaderCell = $(cell);

                    if (!that.tableDefinition.hasRowHeaders) {
                        that.tableDefinition.hasRowHeaders = true;
                    }

                    rowHeaderRowDefinition.push({
                        width: $rowHeaderCell.outerWidth(),
                        height: $rowHeaderCell.outerHeight()
                    });

                    that.tableDefinition.measurements.rowHeader.rows.push(rowHeaderRowDefinition);
                });
            });

            // now that we have parsed the table definition, unwrap the element
            this.element.unwrap();
        },

        _wrapElementForParsing: function () {
            var nonRestrainingWrapper = $("<div></div>",
                {
                    "class": "fixed-header-table-non-restraining-wrapper"
                }
            );

            this.element.wrap(nonRestrainingWrapper);

            this._resizeWrapperToFitElement($(".fixed-header-table-non-restraining-wrapper"), this.element);
        },

        // the constructor
        _create: function () {
            this._setDefaultValues();

            var that = this;

            this.element.addClass("fixed-header-table");

            this._parseTableDefinition();

            this._wrapElement();

            this._cloneColumnHeaders();
            this._cloneRowHeaders();

            this._hideColumnHeaders();
            this._hideRowHeaders();

            this._positionWrappers();

            this._resizeWrapperToFitElement(this.wrapper.bodyWrapper.innerWrapper, this.wrapper.bodyWrapper.wrappedElement.find("tbody"));

            this.wrapper.bodyWrapper
                .width(this.wrapper.bodyWrapper.innerWrapper.outerWidth() + this.magicNumber)
                .height(this.wrapper.bodyWrapper.innerWrapper.outerHeight() + this.magicNumber);

            this._resizeParentWrappers();


            this._configureScrolling();

            $(window).on("resize.fixedHeaderTable", function () {
                that._resizeParentWrappers();
            });

            this.element.addClass("fixed-header-table-source-table");

            this._refresh();
        },

        _resizeParentWrappers: function () {
            var mainContainerSize = {
                    height: this.wrapper.mainContainer.height(),
                    width: this.wrapper.mainContainer.width()
                },
                columnHeaderSize = {
                    height: this.wrapper.columnHeaderWrapper.wrappedElement.outerHeight(),
                    width: this.wrapper.columnHeaderWrapper.wrappedElement.outerWidth()
                },
                rowHeaderSize = {
                    height: this.wrapper.rowHeaderWrapper.wrappedElement.outerHeight(),
                    width: this.wrapper.rowHeaderWrapper.wrappedElement.outerWidth()
                };

            console.log("autoSize?", this.tableDefinition.autoSize);

            if (this.tableDefinition.autoSize) {
                // parent container is set to auto size, we must adjust it accordingly to fit the inner contents
                var autoHeight = this.wrapper.bodyWrapper.wrappedElement.outerHeight() + columnHeaderSize.height + this.magicNumber2,
                    autoWidth = this.wrapper.bodyWrapper.wrappedElement.outerWidth() + rowHeaderSize.width + this.magicNumber2,
                    parentContainer = this.wrapper.mainContainer.parent();

                if (autoHeight > parentContainer.height()) {
                    autoHeight = parentContainer.height();
                }
                if (autoWidth > parentContainer.width()) {
                    autoWidth = parentContainer.width();
                }

                this.wrapper.mainContainer
                    .height(autoHeight)
                    .width(autoWidth);

                mainContainerSize.height = autoHeight;
                mainContainerSize.width = autoWidth;
            }

            this.wrapper.bodyWrapper.outerHeight(mainContainerSize.height - columnHeaderSize.height);
            this.wrapper.bodyWrapper.outerWidth(mainContainerSize.width - rowHeaderSize.width);

            this.wrapper.columnHeaderWrapper.outerHeight(columnHeaderSize.height);
            this.wrapper.columnHeaderWrapper.outerWidth(mainContainerSize.width - rowHeaderSize.width);

            this.wrapper.rowHeaderWrapper.outerHeight(mainContainerSize.height - columnHeaderSize.height);
            this.wrapper.rowHeaderWrapper.outerWidth(rowHeaderSize.width);
        },

        _configureScrolling: function () {
            var that = this;
            this.wrapper.bodyWrapper.on("scroll.fixedHeaderTable", function () {
                var bodyWrapper = $(this);

                that.wrapper.columnHeaderWrapper.innerWrapper.css({
                    "left": -bodyWrapper.scrollLeft()
                });

                that.wrapper.rowHeaderWrapper.innerWrapper.css({
                    "top": -bodyWrapper.scrollTop()
                });
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
            },

            getScrollbarWidth: function () {
                var parent, child, width;

                if (width === undefined) {
                    parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
                    child = parent.children();
                    width = child.innerWidth() - child.height(99).innerWidth();
                    parent.remove();
                }

                return width;
            },

            isAutoSize: function (domElement) {
                var height = null;

                if (domElement.currentStyle) {
                    // IE's currentStyle should tell us if it is sized auto off the bat
                    height = domElement.currentStyle.height;
                }
                else {
                    // For Firefox and Chrome, we'll have to enumerate the matched Css Rules
                    var matchingCssRules = window.getMatchedCSSRules(domElement);
                    if (matchingCssRules.length == 0) {
                        // if there are no matches, we assume auto
                        height = "auto";
                    }
                    else {
                        // iterate through all matches and if there is a height rule, use it
                        for (var ruleIndex = 0; ruleIndex < matchingCssRules.length; ruleIndex++) {
                            var thisRuleHeight = matchingCssRules[ruleIndex].style["height"];
                            if (thisRuleHeight) {
                                // height may be "auto" or a unit
                                height = thisRuleHeight;
                            }
                        }

                        // if no height rule is specified, height is auto
                        if (!height) {
                            return true;
                        }
                    }
                }

                return height === "auto";
            }
        },

        _positionWrappers: function () {
            var rowHeaderWidth = this.wrapper.rowHeaderWrapper.wrappedElement.outerWidth(),
                columnHeaderHeight = this.wrapper.columnHeaderWrapper.wrappedElement.outerHeight();


            this.wrapper.columnHeaderWrapper.css({
                "left": rowHeaderWidth,
                "top": 0
            });

            this.wrapper.bodyWrapper.css({
                "left": rowHeaderWidth,
                "top": columnHeaderHeight
            });

            this.wrapper.rowHeaderWrapper.css({
                "left": 0,
                "top": columnHeaderHeight
            });
        },

        _wrapElement: function () {
            var wrapperId = this._getNextFixedHeaderTableId(),
                sourceTableId = this.element.attr("id"),
                wrapperSelector = "#" + wrapperId,

                wrapper = $("<div></div>", {
                    "class": "fixed-header-table-wrapper",
                    "attr": {
                        "data-fixed-header-table-for": sourceTableId
                    },
                    "id": wrapperId
                }),

                wrapperColumnHeader = $("<div></div>", {
                    "class": "fixed-header-table-wrapper-column-header"
                }),

                wrapperRowHeader = $("<div></div>", {
                    "class": "fixed-header-table-wrapper-row-header"
                }),

                wrapperBody = $("<div></div>", {
                    "class": "fixed-header-table-wrapper-body"
                }),

                innerWrapper = $("<div></div>", {
                    "class": "inner-wrapper"
                });

            this.element
                .wrap(wrapper);

            wrapper = $(wrapperSelector);

            wrapper.append(
                wrapperColumnHeader,
                wrapperRowHeader,
                wrapperBody
            );

            this.wrapper.mainContainer = $(wrapperSelector);

            this.wrapper.columnHeaderWrapper = $(wrapperSelector + " .fixed-header-table-wrapper-column-header");
            this.wrapper.columnHeaderWrapper.append(innerWrapper.clone());
            this.wrapper.columnHeaderWrapper.innerWrapper = $(wrapperSelector + " .fixed-header-table-wrapper-column-header .inner-wrapper");

            this.wrapper.rowHeaderWrapper = $(wrapperSelector + " .fixed-header-table-wrapper-row-header");
            this.wrapper.rowHeaderWrapper.append(innerWrapper.clone());
            this.wrapper.rowHeaderWrapper.innerWrapper = $(wrapperSelector + " .fixed-header-table-wrapper-row-header .inner-wrapper");

            this.wrapper.bodyWrapper = $(wrapperSelector + " .fixed-header-table-wrapper-body");
            this.wrapper.bodyWrapper.append(innerWrapper.clone());
            this.wrapper.bodyWrapper.innerWrapper = $(wrapperSelector + " .fixed-header-table-wrapper-body .inner-wrapper");

            this.wrapper.bodyWrapper.innerWrapper.append(this.element);
            this.wrapper.bodyWrapper.wrappedElement = this.element;


            this.tableDefinition.autoSize = this._util.isAutoSize(this.wrapper.mainContainer[0]);

            var bodyHeight = this.wrapper.bodyWrapper.wrappedElement.find("tbody").outerHeight();
            if (this.wrapper.bodyWrapper.wrappedElement.find("tfoot").length) {
                bodyHeight += this.wrapper.bodyWrapper.wrappedElement.find("tfoot").outerHeight();
            }

            this.wrapper.bodyWrapper.innerWrapper.height(bodyHeight);
            this.wrapper.bodyWrapper.innerWrapper.width(this.wrapper.bodyWrapper.wrappedElement.find("tbody").outerWidth());
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

        _getNextFixedHeaderTableId: function () {
            return "fixedHeaderTable" + +($(".fixed-header-table-wrapper").length + 1);
        },

        _cloneColumnHeaders: function () {
            var self = this,
                cloneDestinationTable = this.element.clone(true),
                clonedHeader = cloneDestinationTable.find("thead"),
                rowHeaderCount = this._getRowHeaderCount();

            cloneDestinationTable.find("tbody").remove();
            cloneDestinationTable.find("tfoot").remove();

            // remove the blank space column header cells that were above row headers
            for (var trimCounter = 0; trimCounter < rowHeaderCount; trimCounter++) {
                clonedHeader.find("tr").each(function () {
                    $(this).children("th:first-child").remove();
                });
            }

            // fix sizes according to the original table measurements
            for (var rowIndex = 0; rowIndex < this.tableDefinition.measurements.columnHeader.rows.length; rowIndex++) {
                var $targetHeaderRowCells = clonedHeader.find("tr").eq(rowIndex).find("th"),
                    $firstBodyDataRowCells = this.element.find("tbody tr td"),
                    rowMeasurements = this.tableDefinition.measurements.columnHeader.rows[rowIndex];

                for (var cellIndex = 0; cellIndex < rowMeasurements.length; cellIndex++) {
                    $targetHeaderRowCells
                        .eq(cellIndex)
                        .outerHeight(rowMeasurements[cellIndex].height + this.magicNumber)
                        .outerWidth(rowMeasurements[cellIndex].width + this.magicNumber);

                    $firstBodyDataRowCells
                        .eq(cellIndex)
                        .outerWidth(rowMeasurements[cellIndex].width + this.magicNumber);
                }
            }

            this.wrapper.columnHeaderWrapper.innerWrapper.append(cloneDestinationTable);
            this.wrapper.columnHeaderWrapper.wrappedElement = cloneDestinationTable;

            this._resizeWrapperToFitElement(
                this.wrapper.columnHeaderWrapper.innerWrapper,
                this.wrapper.columnHeaderWrapper.wrappedElement
            );
        },

        _getRowHeaderCount: function () {
            return this.element.find("tbody tr:first-child th").length;
        },

        _cloneRowHeaders: function () {
            var that = this,
                cloneDestinationTable = this.element.clone(true);

            cloneDestinationTable.find("thead").remove();
            cloneDestinationTable.find("tbody tr td").remove();
            cloneDestinationTable.find("tfoot tr td").remove();

            // fix sizes according to the original table measurements
            for (var rowIndex = 0; rowIndex < this.tableDefinition.measurements.rowHeader.rows.length; rowIndex++) {
                var $targetHeaderRowCells = cloneDestinationTable.find("tbody tr").eq(rowIndex).find("th"),
                    $firstBodyDataRows = that.element.find("tbody tr");
                rowMeasurements = this.tableDefinition.measurements.rowHeader.rows[rowIndex];

                for (var cellIndex = 0; cellIndex < rowMeasurements.length; cellIndex++) {
                    $targetHeaderRowCells
                        .eq(cellIndex)
                        .outerHeight(rowMeasurements[cellIndex].height + that.magicNumber)
                        .outerWidth(rowMeasurements[cellIndex].width + that.magicNumber);
                }

                $firstBodyDataRows
                    .eq(rowIndex)
                    .children("td")
                    .first()
                    .outerHeight(this.tableDefinition.measurements.rowHeader.rows[rowIndex][0].height + that.magicNumber)
            }

            this.element.find("tfoot tr").each(function (i, sourceRow) {
                cloneDestinationTable.find("tfoot tr:nth-child(" + i + ")").height($(sourceRow).height() + that.magicNumber);
                cloneDestinationTable.find("tfoot tr:nth-child(" + i + ")").width($(sourceRow).width() + that.magicNumber);
            });

            this.wrapper.rowHeaderWrapper.innerWrapper.append(cloneDestinationTable);
            this.wrapper.rowHeaderWrapper.wrappedElement = cloneDestinationTable;

            this._resizeWrapperToFitElement(
                this.wrapper.rowHeaderWrapper.innerWrapper,
                this.wrapper.rowHeaderWrapper.wrappedElement
            );

        },

        _hideColumnHeaders: function () {
            this.element
                .find("thead")
                .addClass("ui-helper-hidden");
        },

        _showColumnHeaders: function () {
            this.element
                .find("thead")
                .removeClass("ui-helper-hidden");
        },

        _hideRowHeaders: function () {
            this.element
                .find("tbody tr th")
                .addClass("ui-helper-hidden");

            this.element
                .find("tfoot tr th")
                .addClass("ui-helper-hidden");
        },

        _showRowHeaders: function () {
            this.element
                .find("tbody tr th")
                .removeClass("ui-helper-hidden");

            this.element
                .find("tfoot tr th")
                .removeClass("ui-helper-hidden");
        },

        // called when created, and later when changing options
        _refresh: function () {
        },


        // events bound via _on are removed automatically
        // revert other modifications here
        _destroy: function () {
            this.wrapper.bodyWrapper.off("scroll.fixedHeaderTable");
            $(window).off("resize.fixedHeaderTable");

            this.element
                .removeClass("fixed-header-table")
                .removeClass("fixed-header-table-source-table")
                .unwrap();

            this._showColumnHeaders();
            this._showRowHeaders();
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
            //            // prevent invalid color values
            //            if ( /red|green|blue/.test(key) && (value < 0 || value > 255) ) {
            //                return;
            //            }
            //            this._super( key, value );
        }
    });
});