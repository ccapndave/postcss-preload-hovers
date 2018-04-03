const postcss = require('postcss');

const { plugin, stringifier } = require('./');

function run(input, output, opts) {
    return postcss([ plugin(opts) ]).process(input, { stringifier })
        .then(result => {
            expect(result.css).toEqual(output);
            expect(result.warnings().length).toBe(0);
        });
}

var css = `
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

var expectedPreloads = `<link rel="preload" href="1.svg" as="image">
<link rel="preload" href="2.jpg" as="image">
<link rel="preload" href="3.jpeg" as="image">
<link rel="preload" href="4.png" as="image">
<link rel="preload" href="5.gif" as="image">
`;

it('Converts CSS elements into HTML links', () => {
    return run(css, expectedPreloads, { });
});
