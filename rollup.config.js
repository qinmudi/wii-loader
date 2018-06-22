require('shelljs/global')
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'

rm('-rf', 'dist')
mkdir('-p', 'dist')

export default {
    input: 'index.js',
    output: {
        file: 'dist/wiiloader.js',
        format: 'cjs',
    },
    sourceMap: true,
    plugins: [
        buble({
            objectAssign: 'Object.assign',
            exclude: 'node_modules/**' // only transpile our source code
        }),
        nodeResolve({
            browser: true,
            jsnext: true,
            main: true,
            // pass custom options to the resolve plugin
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        }),
        commonjs(),
        uglify(),
        replace({
          'process.env.NODE_ENV': JSON.stringify( 'production' )
        })
    ]
}
