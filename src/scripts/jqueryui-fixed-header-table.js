$(function () {
    $.widget("custom.fixedHeaderTable", {
        magicNumber : 1,
        magicNumber2 : 20,

        options: {
            tableSizeMethod : "auto",
            fixedTableSize : "none"
        },

        getOptions : function() {
            return this.options;
        },

        getTableDefinition : function() {
            var tableDefinition = this.element.data("tableDefinition"),
                vanillaTableDefinition = {
                    tableSize : {

                    },
                    columnHeader : {
                        rows : []
                    },
                    rowHeader : {
                        rows : []
                    }
                };

            if (!tableDefinition) {
                this.element.data("tableDefinition", vanillaTableDefinition);
                tableDefinition = vanillaTableDefinition;
            }

            return tableDefinition;
        },

        _setTableDefinition : function(definition) {
            this.element.data("tableDefinition", definition);
        },

        getWrapperSelectors : function() {
            var wrapper = this.element.data("wrapper"),
                vanillaWrapperDefinition = {
                    $selector : undefined,
                    columnHeaderWrapper : {
                        $selector : undefined,
                        innerWrapper : {
                            $selector : undefined
                        }
                    },
                    rowHeaderWrapper: {
                        $selector : undefined,
                        innerWrapper : {
                            $selector : undefined
                        }
                    },
                    bodyWrapper: {
                        $selector : undefined,
                        innerWrapper : {
                            $selector : undefined
                        }
                    }
                };

            if (!wrapper) {
                this.element.data("wrapper", vanillaWrapperDefinition);
                wrapper = vanillaWrapperDefinition;
            }

            return wrapper;
        },

        _setWrapperSelectors : function(wrapper) {
            this.element.data("wrapper", wrapper);
        },

        // the constructor
        _create: function () {
            var that = this;

            this._prepareTable();

            this._parseTableDefinition();
            this._wrapElement();

            this._cloneColumnHeaders();
            this._cloneRowHeaders();
            this._hideSourceColumnHeaders();
            this._hideSourceRowHeaders();

            this._positionWrappers();

            var wrapperSelectors = this.getWrapperSelectors(),
                $bodyInnerWrapper = $(wrapperSelectors.bodyWrapper.innerWrapper.$selector),
                $bodyWrapper = $(wrapperSelectors.bodyWrapper.$selector);

            if (this.options.tableSizeMethod === "auto") {
                this._resizeWrapperToFitElement(
                    $bodyInnerWrapper,
                    $bodyInnerWrapper.find("table tbody")
                );
            }

            $bodyWrapper
                .width($bodyInnerWrapper.outerWidth() + this.magicNumber)
                .height($bodyInnerWrapper.outerHeight() + this.magicNumber);

            this._resizeParentWrappers();

            this._configureScrolling();

            $(window).on("resize.fixedHeaderTable", function () {
                that._resizeParentWrappers();
            });

            this.element.addClass("fixed-header-table-source-table");

            this._loaded();
        },

        _configureScrolling: function () {
            var wrapperSelectors = this.getWrapperSelectors();

            $(wrapperSelectors.bodyWrapper.$selector).on("scroll.fixedHeaderTable", function () {
                var bodyWrapper = $(this);

                $(wrapperSelectors.columnHeaderWrapper.innerWrapper.$selector).css({
                    "left": -bodyWrapper.scrollLeft()
                });

                $(wrapperSelectors.rowHeaderWrapper.innerWrapper.$selector).css({
                    "top": -bodyWrapper.scrollTop()
                });
            });
        },

        _resizeParentWrappers: function () {
            var wrapperSelectors = this.getWrapperSelectors(),
                $mainContainer = $(wrapperSelectors.$selector),
                mainContainerSize = {
                    height: $mainContainer.height(),
                    width: $mainContainer.width()
                },
                $columnHeaderElement = $(wrapperSelectors.columnHeaderWrapper.innerWrapper.$selector).children("table"),
                columnHeaderSize = {
                    height: $columnHeaderElement.outerHeight(),
                    width: $columnHeaderElement.outerWidth()
                },
                $rowHeaderElement = $(wrapperSelectors.rowHeaderWrapper.innerWrapper.$selector).children("table"),
                rowHeaderSize = {
                    height: $rowHeaderElement.outerHeight(),
                    width: $rowHeaderElement.outerWidth()
                },
                isAutoSize = this._util.isAutoSize(this.element),
                $bodyElement = $(wrapperSelectors.bodyWrapper.innerWrapper.$selector).children("table");

            if (isAutoSize) {
                // parent container is set to auto size, we must adjust it accordingly to fit the inner contents
                var autoHeight = $bodyElement.outerHeight() + columnHeaderSize.height + this.magicNumber2,
                    autoWidth = $bodyElement.outerWidth() + rowHeaderSize.width + this.magicNumber2,
                    $parentContainer = $(wrapperSelectors.$selector).parent();

                if (autoHeight > $parentContainer.height()) {
                    autoHeight = $parentContainer.height();
                }
                if (autoWidth > $parentContainer.width()) {
                    autoWidth = $parentContainer.width();
                }

                $mainContainer
                    .height(autoHeight)
                    .width(autoWidth);

                mainContainerSize.height = autoHeight;
                mainContainerSize.width = autoWidth;
            }

            $(wrapperSelectors.bodyWrapper.$selector)
                .outerHeight(mainContainerSize.height - columnHeaderSize.height)
                .outerWidth(mainContainerSize.width - rowHeaderSize.width);

            $(wrapperSelectors.columnHeaderWrapper.$selector)
                .outerHeight(columnHeaderSize.height)
                .outerWidth(mainContainerSize.width - rowHeaderSize.width);

            $(wrapperSelectors.rowHeaderWrapper.$selector)
                .outerHeight(mainContainerSize.height - columnHeaderSize.height)
                .outerWidth(rowHeaderSize.width);
        },


        _positionWrappers: function () {
            var wrapperSelectors = this.getWrapperSelectors(),
                rowHeaderWidth = $(wrapperSelectors.rowHeaderWrapper.innerWrapper.$selector).children("table").outerWidth(),
                columnHeaderHeight = $(wrapperSelectors.columnHeaderWrapper.innerWrapper.$selector).children("table").outerHeight();

            $(wrapperSelectors.columnHeaderWrapper.$selector).css({
                "left": rowHeaderWidth,
                "top": 0
            });

            $(wrapperSelectors.bodyWrapper.$selector).css({
                "left": rowHeaderWidth,
                "top": columnHeaderHeight
            });

            $(wrapperSelectors.rowHeaderWrapper.$selector).css({
                "left": 0,
                "top": columnHeaderHeight
            });
        },


        _hideSourceColumnHeaders: function () {
            this.element
                .find("thead")
                .addClass("ui-helper-hidden");
        },

        _hideSourceRowHeaders: function () {
            this.element
                .find("tbody tr th")
                .addClass("ui-helper-hidden");

            this.element
                .find("tfoot tr th")
                .addClass("ui-helper-hidden");
        },

        _getNextFixedHeaderTableId: function () {
            return "fixedHeaderTable" + +($(".fixed-header-table-wrapper").length + 1);
        },

        _prepareTable : function() {
            var that = this;

            this.element.addClass("fixed-header-table");

            switch (this.options.tableSizeMethod) {
                case "auto"  :
                    that.element.css({
                        "width" : "auto",
                        "height" : "auto"
                    });
                    break;
                case "fixed" :
                    // fixed table must scale to the container size, which will be set in fixedTableSize
                    // to prevent it stopping scaling once table contents are flexed, we set it to 100%
                    that.element.css({
                        "width" : "100%",
                        "height" : "100%"
                    });
                    break;
                default :
                    throw new Error("unrecognised tableSizeMethod specified while using " + this.widgetName +
                        ", don't understand tableSizeMethod '" + this.options.tableSizeMethod + "'"
                    );
            }
        },

        _parseHeaderCells: function (headerRows, skipCells, tableDefinition, headerType) {
            headerRows.each(function (rowIndex, row) {
                var $headerRow = $(row),
                    rowDefinition = [];

                $headerRow.find("th").each(function (cellIndex, cell) {
                    if (cellIndex >= skipCells) {
                        var $headerCell = $(cell);

                        if (!tableDefinition[headerType].hasColumnHeaders) {
                            tableDefinition[headerType].hasColumnHeaders = true;
                        }

                        rowDefinition.push({
                            width: $headerCell.outerWidth(),
                            height: $headerCell.outerHeight()
                        });
                    }
                });

                tableDefinition[headerType].rows.push(rowDefinition);
            });
        },

        _parseTableDefinition : function() {
            var that = this,
                $clone = this.element.clone(),
                $sandbox = $("<div></div>", {
                    "id" : "fixedHeaderTableSizingSandbox",
                    "position"  : "absolute",
                    "top" : "100%",
                    "left" : "100%"
                }),
                $columnHeaderRows = $clone.find("thead tr"),
                $rowHeaderRows = $clone.find("tbody tr"),
                rowHeaderDepth = this._getRowHeaderCount(),
                tableDefinition = this.getTableDefinition();

            $("body").append($sandbox);
            $sandbox.append($clone.attr("id", "fixedHeaderTableSizingClone"));

            if (this.options.tableSizeMethod === "fixed") {
                $sandbox.width(this.options.fixedTableSize.width);
                $sandbox.height(this.options.fixedTableSize.height);
            }
            else {
                this._resizeWrapperToFitElement($sandbox, $clone);
            }

            tableDefinition.tableSize = {
                "width" : $sandbox.width(),
                "height" : $sandbox.height()
            }

            this._parseHeaderCells($columnHeaderRows, rowHeaderDepth, tableDefinition, "columnHeader");
            this._parseHeaderCells($rowHeaderRows, 0, tableDefinition, "rowHeader");

            $sandbox.remove();
            this._setTableDefinition(tableDefinition);
        },

        _resizeWrapperToFitElement: function (wrapper, element) {
            var lastElementSize = { width: -1, height: -1 },
                newElementSize = function () {
                    return {
                        width: $(element).outerWidth(true),
                        height: $(element).outerHeight(true),
                        equalTo: function (anotherSize) {
                            return anotherSize.width === this.width && anotherSize.height === this.height;
                        }
                    }
                },
                iterations = 0;

            wrapper.width(element.outerWidth(true));
            wrapper.height(element.outerHeight(true));

            if (!this._util.isAutoSize(element)) {
                return;
            }

            while (!newElementSize().equalTo(lastElementSize)) {
                lastElementSize = newElementSize();
                wrapper.outerWidth(wrapper.outerWidth(true) + 100);
                wrapper.outerHeight(wrapper.outerHeight(true) + 100);
                ++iterations;

                if (iterations > 1000) {
                    // in some circumstances it is possible to loop infinitely, for example if an element is set to
                    // size according to its container and has got past the size auto guard.
                    console.warn(this.widgetName + " exited action '_resizeWrapperToFitElement' because the maximum number of iterations was exceeded");
                    break;
                }
            }

            var fullyExpandedElementSize = newElementSize();

            wrapper.width(fullyExpandedElementSize.width);
            wrapper.height(fullyExpandedElementSize.height);
        },

        _wrapElement: function () {
            var wrapperId = this._getNextFixedHeaderTableId(),
                sourceTableId = this.element.attr("id"),
                wrapperSelector = "#" + wrapperId,

                wrapper = $("<div></div>", {
                    "class": "fixed-header-table-wrapper",
                    "data-fixed-header-table-for": sourceTableId,
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

            // get the wrapper into the DOM
            this.element.wrap(wrapper);

            $("#" + wrapperId).append(
                wrapperColumnHeader,
                wrapperRowHeader,
                wrapperBody
            );

            wrapperColumnHeader.append(innerWrapper.clone());
            wrapperRowHeader.append(innerWrapper.clone());
            wrapperBody.append(innerWrapper.clone());

            var wrapperSelectors = this.getWrapperSelectors();

            wrapperSelectors.$selector = wrapperSelector;

            wrapperSelectors.columnHeaderWrapper = {
                $selector : wrapperSelector + " .fixed-header-table-wrapper-column-header",
                innerWrapper : {
                    $selector : wrapperSelector + " .fixed-header-table-wrapper-column-header .inner-wrapper"
                }
            };

            wrapperSelectors.rowHeaderWrapper = {
                $selector : wrapperSelector + " .fixed-header-table-wrapper-row-header",
                innerWrapper : {
                    $selector : wrapperSelector + " .fixed-header-table-wrapper-row-header .inner-wrapper"
                }
            };

            wrapperSelectors.bodyWrapper = {
                $selector : wrapperSelector + " .fixed-header-table-wrapper-body",
                innerWrapper : {
                    $selector : wrapperSelector + " .fixed-header-table-wrapper-body .inner-wrapper"
                }
            };

            this._setWrapperSelectors(wrapperSelectors);

            this.element.appendTo(wrapperBody.children(0).eq(0));
        },

        _cloneColumnHeaders: function () {
            var cloneDestinationTable = this.element.clone(true),
                clonedHeader = cloneDestinationTable.find("thead"),
                rowHeaderCount = this._getRowHeaderCount(),
                tableDefinition = this.getTableDefinition();

            cloneDestinationTable.find("tbody").remove();
            cloneDestinationTable.find("tfoot").remove();

            // remove the blank space column header cells that were above row headers
            for (var trimCounter = 0; trimCounter < rowHeaderCount; trimCounter++) {
                clonedHeader.find("tr").each(function () {
                    $(this).children("th:first-child").remove();
                });
            }

            // fix sizes according to the original table measurements
            for (var rowIndex = 0; rowIndex < tableDefinition.columnHeader.rows.length; rowIndex++) {
                var $targetHeaderRowCells = clonedHeader.find("tr").eq(rowIndex).find("th"),
                    $firstBodyDataRowCells = this.element.find("tbody tr td"),
                    rowMeasurements = tableDefinition.columnHeader.rows[rowIndex],
                    wrapperSelectors = this.getWrapperSelectors();

                for (var cellIndex = 0; cellIndex < rowMeasurements.length; ++cellIndex) {
                    $targetHeaderRowCells
                        .eq(cellIndex)
                        .outerHeight(rowMeasurements[cellIndex].height + this.magicNumber)
                        .outerWidth(rowMeasurements[cellIndex].width + this.magicNumber);

                    $firstBodyDataRowCells
                        .eq(cellIndex)
                        .outerWidth(rowMeasurements[cellIndex].width + this.magicNumber);
                }
            }

            $(wrapperSelectors.columnHeaderWrapper.innerWrapper.$selector).append(cloneDestinationTable);

            if (this.options.tableSizeMethod === "auto") {
                this._resizeWrapperToFitElement(
                    $(wrapperSelectors.columnHeaderWrapper.innerWrapper.$selector),
                    cloneDestinationTable
                );
            }
        },

        _cloneRowHeaders: function () {
            var that = this,
                cloneDestinationTable = this.element.clone(true),
                tableDefinition = this.getTableDefinition(),
                wrapperSelectors = this.getWrapperSelectors();

            cloneDestinationTable.find("thead").remove();
            cloneDestinationTable.find("tbody tr td").remove();
            cloneDestinationTable.find("tfoot tr td").remove();

            // fix sizes according to the original table measurements
            for (var rowIndex = 0; rowIndex < tableDefinition.rowHeader.rows.length; ++rowIndex) {
                var $targetHeaderRowCells = cloneDestinationTable.find("tbody tr").eq(rowIndex).find("th"),
                    $firstBodyDataRows = that.element.find("tbody tr"),
                    rowMeasurements;

                rowMeasurements = tableDefinition.rowHeader.rows[rowIndex];

                for (var cellIndex = 0; cellIndex < rowMeasurements.length; ++cellIndex) {
                    $targetHeaderRowCells
                        .eq(cellIndex)
                        .outerHeight(rowMeasurements[cellIndex].height + that.magicNumber)
                        .outerWidth(rowMeasurements[cellIndex].width + that.magicNumber);
                }

                $firstBodyDataRows
                    .eq(rowIndex)
                    .children("td")
                    .first()
                    .outerHeight(tableDefinition.rowHeader.rows[rowIndex][0].height + that.magicNumber)
            }

            this.element.find("tfoot tr").each(function (i, sourceRow) {
                cloneDestinationTable.find("tfoot tr:nth-child(" + i + ")").height($(sourceRow).height() + that.magicNumber);
                cloneDestinationTable.find("tfoot tr:nth-child(" + i + ")").width($(sourceRow).width() + that.magicNumber);
            });

            var innerWrapper = $(wrapperSelectors.rowHeaderWrapper.innerWrapper.$selector);

            innerWrapper.append(cloneDestinationTable);

            if (this.options.tableSizeMethod === "auto") {
                this._resizeWrapperToFitElement(innerWrapper, cloneDestinationTable);
            }
        },


        _util : {
            isAutoSize: function (domElement) {
                var height = null;

                if (domElement.currentStyle) {
                    // IE's currentStyle should tell us if it is sized auto off the bat
                    height = domElement.currentStyle.height;
                }
                else {
                    // For Firefox and Chrome, we'll have to enumerate the matched Css Rules
                    var matchingCssRules = window.getMatchedCSSRules(domElement);
                    if (!matchingCssRules || matchingCssRules.length == 0) {
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

        _getRowHeaderCount: function () {
            return this.element.find("tbody tr:first-child th").length;
        },


        _loaded : function() {
            // set this data value to indicate that the plugin is loaded.
            // useful in async operations
            this.element.data("fixed-header-table-loaded", true);
        }

    });
});