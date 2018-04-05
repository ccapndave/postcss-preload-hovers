const postcss = require('postcss');
const path = require('path');
const fs = require('fs');

const getUrl = decl => {
    var matches = /(url\(\s*['"]?)([^"')]+)(["']?\s*\))/g.exec(decl.value);
    return matches && matches[2];
};

/**
 * Find all rules with a :hover pseudoclass and prefetch them either via HTML or JS.
 */
module.exports = postcss.plugin('postcss-preload-hovers', opts => {
    opts = opts || {};

    opts.outputType = opts.outputType || "html";
    opts.preloadType = opts.preloadType || "prefetch";

    return (root, result) => {
        if (opts.outputType && opts.outputType !== "html" && opts.outputType !== "js") {
            return result.warn(`postcss-preload-hovers only accepts an outputType of "html", "js" or "file"`);
        }

        if (opts.preloadType !== "prefetch" && opts.preloadType !== "preload" && opts.preloadType !== "image") {
            return result.warn(`postcss-preload-hovers only accepts an preloadType of "prefetch", "preload" or "image"`);
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
            .map(url => rebaseUrl(url));

        result = (function() {
            if (opts.outputType === "html") {
                if (opts.preloadType === "image") {
                    return preloaders.map(url => `<img src="${url}" style="display: none;">`).join("\n");
                } else {
                    return preloaders.map(url => `<link rel="${opts.preloadType}" href="${url}" as="image">`).join("\n");
                }
            } else if (opts.outputType === "js") {
                const arrayString = "[" + preloaders.map(url => `"${url}"`).join(",") + "]";
                if (opts.preloadType === "image") {
                    return `${arrayString}.forEach(function(url) { var img = new Image(); img.src = url; });`;
                } else {
                    return `${arrayString}.forEach(function(url) { var link = document.createElement("link"); link.rel = "${opts.preloadType}"; link.href = url; link.as = "image"; document.head.appendChild(link); });`;
                }
            } else {
                result.warn("Unknown output type ${opts.outputType} (it shouldn't be possible to get here!)")
            }
        })();

        if (opts.filename) {
            // Write the results to a file
            fs.writeFileSync(opts.filename, result);
            return;
        }

        if (opts.resultObj) {
            // Write the results to a shared object (very unfunctional, but a convenient and fast way to get data out)
            opts.resultObj.data = result;
            return
        }

        // Otherwise write the HTML or JS as comment nodes which we can then extract in the stringifier
        root.removeAll();
        root.append({ text: result });
    };
});
