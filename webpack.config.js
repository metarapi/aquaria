const path = require('path');

module.exports = {
    entry: './assets/scripts/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'main', 'static', 'js')
    }
}