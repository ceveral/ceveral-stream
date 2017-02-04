
var gutil = require('gulp-util'),
    ceveral = require('../'),
    Path = require('path');

it('should transform a model', (cb) => {

    let stream = ceveral({
        transformers: ['golang']
    });

    stream.on('data', (data) => {
        cb();
    });

    stream.on('end', cb);

    stream.write(new gutil.File({
        cwd:__dirname,
        base: __dirname,
        path: Path.join(__dirname, "model.cev"),
        contents: new Buffer(`
            package main;
            record Test {

            }
        `)
    }));

})