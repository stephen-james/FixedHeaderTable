// from : https://github.com/stephen-james/FixedHeaderTable
//
// calculates the effective style specificity as follows  :
//
// 10^0 = cascade order                               --  determined by resolveAppliedStyle
// 10^1 = elements and pseudo-elements               --  calculated using specificity.js
// 10^2 = classes, attributes and pseudo-classes     --  calculated using specificity.js
// 10^3 = IDs                                        --  calculated using specificity.js
// 10^4 = inline styles                              --  determined by resolveAppliedStyle
// 10^5 = usage of css !important override           --  determined by resolveAppliedStyle

(function () {
    var documentElement = document.documentElement,
        matchesSelector =
            documentElement.matchesSelector ||
                documentElement.mozMatchesSelector ||
                documentElement.webkitMatchesSelector ||
                documentElement.msMatchesSelector ||
                documentElement.oMatchesSelector;

    if (!matchesSelector) {
        if (document.querySelectorAll) {
            matchesSelector = function (selector) {
                var matchingElements = this.parentNode.querySelectorAll(selector),
                    count = matchingElements.length;

                for (var i = 0; i < count; ++i) {
                    if (matchingElements[i] === this) {
                        return true;
                    }
                }

                return false;
            }
        }
        else {
            throw new Error("no browser support for selector matching");
        }
    }

    function styleImportanceByRule(rule, styleProperty) {
        if (rule.style.getPropertyPriority) {
            return rule.style.getPropertyPriority(styleProperty) === "important" ? 100000 : 0;
        }
        else {
            return 0;
        }

    }

    function styleImportanceByStyleText(styleText) {
        return styleText.match(/\s!important/gi) ? 100000 : 0;
    }

    function resolveAppliedStyle(element, style) {

        var styleSheets = document.styleSheets,
            numberOfStyleSheets = styleSheets.length,
            styleSheet,
            styleSheetIndex,
            rule,
            rules,
            numberOfRules,
            ruleIndex,
            appliedRule,
            scoredStyles = [],
            inlineStyle,
            potentiallyAppliedStyle,
            cssStyleSpecificityScore,
            styleSpecificity,
            matchesSelectorResult;

        for (styleSheetIndex = 0; styleSheetIndex < numberOfStyleSheets; ++styleSheetIndex) {
            styleSheet = styleSheets[styleSheetIndex];

            rules = styleSheet.cssRules || styleSheet.rules;

            if (!rules) {
                continue;
            }

            numberOfRules = rules.length;

            for (ruleIndex = 0; ruleIndex < numberOfRules; ++ruleIndex) {
                rule = rules[ruleIndex];
                try {
                    matchesSelectorResult = matchesSelector.call(element, rule.selectorText);
                }
                catch (err) {
                    console.log("invalid call to matchesSelector using string '", rule.selectorText, "', error >> ",err);
                    matchesSelectorResult = false;
                }

                if (matchesSelectorResult) {
                    potentiallyAppliedStyle = rule.style[style];
                    if (potentiallyAppliedStyle !== undefined) {

                        cssStyleSpecificityScore = +(SPECIFICITY.calculate(rule.selectorText)[0]
                            .specificity
                            .replace(/,/g, ""));

                        styleSpecificity =
                            scoredStyles.length +
                                (cssStyleSpecificityScore * 10) +
                                styleImportanceByRule(rule, style);

                        scoredStyles.push({
                            "selector": rule.selectorText,
                            "specificity": styleSpecificity,
                            "style": potentiallyAppliedStyle
                        });
                    }
                }
            }
        }

        inlineStyle = element.style[style];

        if (inlineStyle) {
            scoredStyles.push({
                "selector": "! this is an inline style !",
                "specificity": 10000 + styleImportanceByStyleText(inlineStyle),
                "style": inlineStyle
            });
        }

        if (!scoredStyles.length) {
            return undefined;
        }

        scoredStyles.sort(function (a, b) {
            if (a.specificity > b.specificity) {
                return -1;
            }
            if (a.specificity < b.specificity) {
                return 1;
            }
            return 0;
        });

        return scoredStyles[0].style;
    }

    window.resolveAppliedStyle = resolveAppliedStyle;
})();