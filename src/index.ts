import * as through from 'through2';
import * as File from 'vinyl';
import * as gutil from 'gulp-util';
import * as Path from 'path';

import { TransformOptions, Ceveral } from 'ceveral-compiler';

export interface Options extends TransformOptions { }

export default function ceveral(options?: Options) {

    let i = new Ceveral();
    var promise = i.setup();

    return through.obj(function (chunk, _, cb) {
        let file = chunk as File;

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
                    }).catch(cb)
            }
            let opts = options
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
        }

        if (promise) {
            return promise.then(transform).catch(cb);
        }
        transform();


    });
}