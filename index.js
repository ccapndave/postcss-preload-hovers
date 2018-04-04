const postcss = require('postcss');
const path = require('path');
const fs = require('fs');

const getUrl = decl => {
    var matches = /(url\(\s*['"]?)([^"')]+)(["']?\s*\))/g.exec(decl.value);
    return matches && matches[2];
};

/**
 * Find all rules with a :hover pseudoclass and (when used with the provided stringifier)
 * convert it into a set of <link> elements to preload these images.
 */
const plugin = postcss.plugin('postcss-preload-hovers', opts => {
    opts = opts || {};

    opts.outputType = opts.outputType || "html";

    return (root, result) => {
        if (opts.outputType && opts.outputType !== "html" && opts.outputType !== "js") {
            return result.warn(`postcss-preload-hovers only accepts an outputType of "html", "js" or "file"`);
        }

        const from = result.opts.from ? path.dirname(result.opts.from) : ".";
        const to = result.opts.to ? path.dirname(result.opts.to) : ".";

        const rebaseUrl = url => path.join(path.relative(from, to), url);

        let urlsToPreload = [];

        // Get all URLs from hover pseudorules
        root.walkRules(/:hover/, rule => {
            rule.walkDecls(decl => {
                var url = getUrl(decl);
                if (url) urlsToPreload.push(url);
            });
        });

        // Turn any image loaders into their appropriate HTML or JS representations
        preloaders = urlsToPreload
            .filter(url => /\.jpe?g$|\.png$|\.gif$|\.svg$/.test(url))
            .map(url => rebaseUrl(url))
            .map(url => {
                if (opts.outputType === "html") {
                    return `<link rel="preload" href="${url}" as="image">`;
                } else if (opts.outputType === "js") {
                    return `(function() { var link = document.createElement("link"); link.rel = "preload"; link.href = "${url}"; link.as = "image"; document.head.appendChild(link); })();`;
                } else {
                    result.warn("Unknown output type ${opts.outputType} (it shouldn't be possible to get here!)")
                }
            });

        if (opts.filename) {
            // Write the results to a file
            fs.writeFileSync(opts.filename, preloaders.join("\n"));
            return;
        }

        if (opts.resultObj) {
            // Write the results to a shared object (very unfunctional, but a convenient and fast way to get data out)
            opts.resultObj.data = preloaders.join("\n");
            return
        }

        // Otherwise write the HTML or JS as comment nodes which we can then extract in the stringifier
        root.removeAll();
        preloaders.forEach(text => root.append({ text }));
    };
});

/**
 * A stringifier to extract text from CSS comments.  Used together with the plugin
 * this extracts images in
 */
const stringifier = (root, builder) => {
    root.walkComments(comment => {
        builder(comment.text + "\n");
    });
}

module.exports = { plugin, stringifier };
