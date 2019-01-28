import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
    input: 'lib/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        }
    ],
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
        typescript({
            typescript: require('typescript'),
            tsconfigOverride: {
                compilerOptions: {
                    module: 'es6'
                }
            }
        }),
        nodeResolve({
            jsnext: true,
            main: true
        }),
        commonjs({

        })
    ],
}
