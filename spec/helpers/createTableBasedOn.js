(function(){
    window.TestHelpers = window.TestHelpers || {};
    window.TestHelpers.createTableBasedOn = function(tableTestCaseHtmlPath, systemUnderTest, options) {
        runs(function() {
            var tableHtmlForTestCase = "",
                tableTestCaseRequest = new XMLHttpRequest();

            tableTestCaseRequest.onload = function(result) {
                if (result.srcElement) {
                    tableHtmlForTestCase = result.srcElement.responseText;
                }
                else {
                    if (result.currentTarget) {
                        tableHtmlForTestCase = result.currentTarget.responseText;
                    }
                    else {
                        console.error("tableHtmlForTestCase : unable to load html response");
                    }
                }
            };
            tableTestCaseRequest.open("GET", tableTestCaseHtmlPath, false);
            tableTestCaseRequest.send();

            $("body").append(
                $("<div></div>", {
                    id : "jasmineHtmlSandbox"
                })
            );

            systemUnderTest.htmlSandboxElement = $("#jasmineHtmlSandbox");

            systemUnderTest.htmlSandboxElement.append(
                $(tableHtmlForTestCase).attr("id", "tableUnderTest")
            );

            systemUnderTest.sourceTable = $("#tableUnderTest");

            $(function() {
                systemUnderTest.sourceTable.fixedHeaderTable(options);
            });
        });

        waitsFor(function() {
            return systemUnderTest.sourceTable.data("fixed-header-table-loaded");
        }, "jqueryui-fixed-header-table to finish loading on table under test", 1000);

    };
})();