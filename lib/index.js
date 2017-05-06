"use strict";
const through = require("through2");
const File = require("vinyl");
const gutil = require("gulp-util");
const Path = require("path");
const ceveral_compiler_1 = require("ceveral-compiler");
function ceveral(options) {
    let i = new ceveral_compiler_1.Ceveral();
    return through.obj(function (chunk, _, cb) {
        let file = chunk;
        if (file.isNull()) {
            cb(null, file);
            return;
        }
        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-babel', 'Streaming not supported'));
            return;
        }
        let str = file.contents.toString();
        let that = this;
        const transform = () => {
            if (!options && !options.transformers) {
                return i.transpiler.ast(str, file.path)
                    .then((results) => {
                    file.contents = new Buffer(JSON.stringify(results, null, 2));
                    file.path = Path.join(file.base || "", Path.basename(file.path, Path.extname(file.path))) + '.cev.ast';
                    return cb(null, file);
                }).catch(cb);
            }
            let opts = options;
            opts.fileName = file.path;
            i.transform(str, opts)
                .then(results => {
                results.forEach(m => {
                    that.push(new File({
                        cwd: file.cwd,
                        base: file.base,
                        path: Path.join(file.base || "", m.filename),
                        contents: m.buffer
                    }));
                });
                cb();
            }).catch(e => {
                console.log(e);
                cb(e);
            });
        };
        transform();
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ceveral;
