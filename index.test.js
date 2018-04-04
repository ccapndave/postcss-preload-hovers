const postcss = require('postcss');

const { plugin, stringifier } = require('./');

it("Converts CSS elements into HTML links", () => {
    const css = `
        a:hover {
            background-image: url(1.svg);
        }

        a:hover .u-pointer-input {
            background-image: url(2.jpg);
        };

        a:hover.mod-blah {
            background-image: url(3.jpeg);
        };

        a:hover.mod-blah .thing {
            background-image: url(4.png);
        };

        a:hover.mod-blah .thing .urg {
            background-image: url(5.gif);
        };

        input {
            display: inline;
        }
    `;

    const expectedPreloads = `
<link rel="preload" href="1.svg" as="image">
<link rel="preload" href="2.jpg" as="image">
<link rel="preload" href="3.jpeg" as="image">
<link rel="preload" href="4.png" as="image">
<link rel="preload" href="5.gif" as="image">
    `;

    postcss([ plugin() ]).process(css, { stringifier })
        .then(result => expect(result.css.trim()).toEqual(expectedPreloads.trim()))
        .catch(err => console.log(err));
});

it("Converts CSS elements into HTML", () => {
    const css = `
        a:hover {
            background-image: url(1.svg);
        }

        a:hover .u-pointer-input {
            background-image: url(2.jpg);
        };

        a:hover.mod-blah {
            background-image: url(3.jpeg);
        };

        a:hover.mod-blah .thing {
            background-image: url(4.png);
        };

        a:hover.mod-blah .thing .urg {
            background-image: url(5.gif);
        };

        input {
            display: inline;
        }
    `;

    const expectedPreloads = `
<link rel="preload" href="1.svg" as="image">
<link rel="preload" href="2.jpg" as="image">
<link rel="preload" href="3.jpeg" as="image">
<link rel="preload" href="4.png" as="image">
<link rel="preload" href="5.gif" as="image">
    `;

    postcss([ plugin() ]).process(css, { stringifier })
        .then(result => expect(result.css.trim()).toEqual(expectedPreloads.trim()))
        .catch(err => console.log(err));
});

it("Converts CSS elements into JS", () => {
    const css = `
        a:hover {
            background-image: url(1.svg);
        }

        a:hover .u-pointer-input {
            background-image: url(2.jpg);
        };

        a:hover.mod-blah {
            background-image: url(3.jpeg);
        };

        a:hover.mod-blah .thing {
            background-image: url(4.png);
        };

        a:hover.mod-blah .thing .urg {
            background-image: url(5.gif);
        };

        input {
            display: inline;
        }
    `;

    const expectedPreloads = `
(function() { var link = document.createElement("link"); link.rel = "preload"; link.href = "1.svg"; link.as = "image"; document.head.appendChild(link); })();
(function() { var link = document.createElement("link"); link.rel = "preload"; link.href = "2.jpg"; link.as = "image"; document.head.appendChild(link); })();
(function() { var link = document.createElement("link"); link.rel = "preload"; link.href = "3.jpeg"; link.as = "image"; document.head.appendChild(link); })();
(function() { var link = document.createElement("link"); link.rel = "preload"; link.href = "4.png"; link.as = "image"; document.head.appendChild(link); })();
(function() { var link = document.createElement("link"); link.rel = "preload"; link.href = "5.gif"; link.as = "image"; document.head.appendChild(link); })();
    `;

    postcss([ plugin({ outputType: "js" }) ]).process(css, { stringifier })
        .then(result => expect(result.css.trim()).toEqual(expectedPreloads.trim()))
        .catch(err => console.log(err));
});

it("Deals correctly with relative paths", () => {
    const css = `
        a:hover {
            background-image: url(../../assets/1.svg);
        }
    `;

    const expectedPreloads = `<link rel="preload" href="../assets/1.svg" as="image">`;

    postcss([ plugin() ]).process(css, { stringifier, from: "styles/app.less", to: "../web/index.html" })
        .then(result => expect(result.css.trim()).toEqual(expectedPreloads.trim()))
        .catch(err => console.log(err));
});

it("Writes to a shared result object", () => {
    const css = `
        a:hover {
            background-image: url(../../assets/1.svg);
        }
    `;

    const expectedPreloads = `<link rel="preload" href="../assets/1.svg" as="image">`;

    const resultObj = {};
    postcss([ plugin({ resultObj }) ]).process(css, { stringifier, from: "styles/app.less", to: "../web/index.html" })
        .then(_ => expect(resultObj.data.trim()).toEqual(expectedPreloads.trim()))
        .catch(err => console.log(err));
})
