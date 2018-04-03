var postcss = require('postcss');

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

    return (root, result) => {
        var urlsToPreload = [];

        // Get all URLs from hover pseudorules
        root.walkRules(/:hover/, rule => {
            rule.walkDecls(decl => {
                var url = getUrl(decl);
                if (url) urlsToPreload.push(url);
            });
        });

        // We only care about images
        urlsToPreload = urlsToPreload.filter(url => /\.jpe?g$|\.png$|\.gif$|\.svg$/.test(url));

        // A bit hacky, but write the HTML as comment nodes
        root.removeAll();
        urlsToPreload.forEach(url => root.append({
            text: `<link rel="preload" href="${url}" as="image">`
        }));
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
