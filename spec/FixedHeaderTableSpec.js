describe("FixedHeaderTable", function() {
    describe("CSS decoration", function() {
        var systemUnderTest = {
            htmlSandboxElement : {},
            sourceTable : {}
        };

        beforeEach(function() {
            TestHelpers.createTableBasedOn("tableTestCases/standardTable.html", systemUnderTest);
        });

        afterEach(function() {
            systemUnderTest.htmlSandboxElement.remove();
        });

        it("decorates the source table with class 'fixed-header-table'", function() {
            var tableHasClass = systemUnderTest.sourceTable.hasClass("fixed-header-table");

            expect(tableHasClass).toBeTruthy();
        });

        it("once clones have been created it decorates the source table with class 'fixed-header-table-source-table'", function() {
            var tableHasClass = systemUnderTest.sourceTable.hasClass("fixed-header-table-source-table");

            expect(tableHasClass).toBeTruthy();
        });
    });

    describe("Plugin Options", function() {
        describe("tableSizeMethod", function() {
            var systemUnderTest = {
                htmlSandboxElement : {},
                sourceTable : {}
            };

            afterEach(function() {
                if (systemUnderTest.htmlSandboxElement && systemUnderTest.htmlSandboxElement != {}) {
                    $(systemUnderTest.htmlSandboxElement).remove();
                }
            });

            it("has a default value of 'auto'", function() {
                runs(function(){
                    TestHelpers.createTableBasedOn("tableTestCases/standardTable.html", systemUnderTest);
                });

                runs(function(){
                    var options = $(systemUnderTest.sourceTable).fixedHeaderTable("getOptions");
                    expect(options.tableSizeMethod).toEqual("auto");
                });
            });

            it("is enforced by applying styles to the element", function() {
                runs(function(){
                    TestHelpers.createTableBasedOn("tableTestCases/standardTable.html", systemUnderTest, { tableSizeMethod : "auto" });
                });

                runs(function(){
                    var width = $(systemUnderTest.sourceTable)[0].style["width"],
                        height = $(systemUnderTest.sourceTable)[0].style["height"];

                    expect(width).toEqual("auto");
                    expect(height).toEqual("auto");
                });
            });

            it("can be set to a fixed size by setting the value to 'fixed'", function() {
                runs(function(){
                    TestHelpers.createTableBasedOn("tableTestCases/standardTable.html", systemUnderTest, { tableSizeMethod : "fixed" });
                });

                runs(function(){
                    var options = $(systemUnderTest.sourceTable).fixedHeaderTable("getOptions");
                    expect(options.tableSizeMethod).toEqual("fixed");
                });
            });
        });

        describe("fixedTableSize", function() {
            var systemUnderTest = {
                htmlSandboxElement : {},
                sourceTable : {}
            };

            afterEach(function() {
                if (systemUnderTest.htmlSandboxElement && systemUnderTest.htmlSandboxElement != {}) {
                    $(systemUnderTest.htmlSandboxElement).remove();
                }
            });

            it("determines the container size used to calculate the table dimensions of tables with a fixed tableSizeMethod", function() {
                runs(function(){
                    TestHelpers.createTableBasedOn("tableTestCases/standardTable.html", systemUnderTest,
                        {
                            tableSizeMethod : "fixed",
                            fixedTableSize : {
                                width : "100px",
                                height : "200px"
                            }
                        }
                    );
                });

                runs(function(){
                    var options = $(systemUnderTest.sourceTable).fixedHeaderTable("getOptions");
                    expect(options.fixedTableSize.width).toEqual("100px");
                    expect(options.fixedTableSize.height).toEqual("200px");
                });

            });
        });
    });

    describe("Table Sizing", function(){
        var systemUnderTest = {
            htmlSandboxElement : {},
            sourceTable : {}
        };

        afterEach(function() {
            if (systemUnderTest.htmlSandboxElement && systemUnderTest.htmlSandboxElement != {}) {
                $(systemUnderTest.htmlSandboxElement).remove();
            }
        });

        it("calculates the underlying tables optimal fully flexed size, independant of the current window size", function() {
            runs(function(){
                TestHelpers.createTableBasedOn("tableTestCases/knownWidthTable.html", systemUnderTest,
                    {
                        tableSizeMethod : "auto"
                    }
                );
            });

            runs(function() {
                var tableDefinition = $(systemUnderTest.sourceTable).fixedHeaderTable("getTableDefinition");
                expect(tableDefinition.tableSize.width).toBe(210);
                expect(tableDefinition.tableSize.height).toBe(300);
            });
        });

        it("stores the dimensions of each column header cell", function() {
           runs(function(){
               TestHelpers.createTableBasedOn("tableTestCases/knownWidthTable.html", systemUnderTest,
                   {
                       tableSizeMethod : "auto"
                   }
               );
           });

           runs(function(){
               var tableDefinition = $(systemUnderTest.sourceTable).fixedHeaderTable("getTableDefinition");

               expect(tableDefinition.columnHeader).toBeDefined("tableDefinition should contain a definition for columnHeader");
               expect(tableDefinition.columnHeader.rows).toBeDefined("columnHeader should define rows of column headers");

               expect(tableDefinition.columnHeader.rows.length).toBe(1);
               expect(tableDefinition.columnHeader.rows[0].length).toBe(1);
               expect(tableDefinition.columnHeader.rows[0][0]).toEqual({
                    width : 110,
                    height : 150
               });
           });
        });

        it("stores the dimensions of each row header cell", function() {
            runs(function(){
                TestHelpers.createTableBasedOn("tableTestCases/knownWidthTable.html", systemUnderTest,
                    {
                        tableSizeMethod : "auto"
                    }
                );
            });

            runs(function(){
                var tableDefinition = $(systemUnderTest.sourceTable).fixedHeaderTable("getTableDefinition");

                expect(tableDefinition.rowHeader).toBeDefined("tableDefinition should contain a definition for rowHeader");
                expect(tableDefinition.rowHeader.rows).toBeDefined("rowHeader should define rows of row headers");

                expect(tableDefinition.rowHeader.rows.length).toBe(1);
                expect(tableDefinition.rowHeader.rows[0].length).toBe(1);
                expect(tableDefinition.rowHeader.rows[0][0]).toEqual({
                    width : 100,
                    height : 150
                });
            });
        });
    });

    describe("Wrappers", function(){
        var systemUnderTest = {
            htmlSandboxElement : {},
            sourceTable : {}
        };

        beforeEach(function() {
            TestHelpers.createTableBasedOn("tableTestCases/standardTable.html", systemUnderTest);
        });

        afterEach(function() {
            if (systemUnderTest.htmlSandboxElement && systemUnderTest.htmlSandboxElement != {}) {
                $(systemUnderTest.htmlSandboxElement).remove();
            }
        });

        it("the widget is wrapped up in a parent wrapper with class 'fixed-header-table-wrapper'", function() {
            runs(function(){
               var hasWrapper = systemUnderTest.sourceTable.parents(".fixed-header-table-wrapper").length;
                expect(hasWrapper).toBeTruthy();
            });
        });

        it("wraps columns headers with the class 'fixed-header-table-wrapper-column-header'", function() {
            runs(function(){
                var hasWrapper =
                    systemUnderTest.sourceTable
                        .parents(".fixed-header-table-wrapper")
                        .children(".fixed-header-table-wrapper-column-header")
                        .length;

                expect(hasWrapper).toBeTruthy();
            });
        });

        it("wraps row headers with the class 'fixed-header-table-wrapper-row-header'", function() {
            runs(function(){
                var hasWrapper =
                    systemUnderTest.sourceTable
                        .parents(".fixed-header-table-wrapper")
                        .children(".fixed-header-table-wrapper-row-header")
                        .length;

                expect(hasWrapper).toBeTruthy();
            });
        });

        it("wraps the source table in the main body wrapper with class 'fixed-header-table-wrapper-body'", function() {
            runs(function(){
                var hasWrapper =
                    systemUnderTest.sourceTable
                        .parents(".fixed-header-table-wrapper")
                        .children(".fixed-header-table-wrapper-body")
                        .length;

                expect(hasWrapper).toBeTruthy();
            });
        });

    });
});