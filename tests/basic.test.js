import DependenciesAnalyzerPlugin from "../src";
import webpack from 'webpack'
import path from 'node:path'
import fs from 'fs/promises'
import rmdir from 'rmdir'
import { mkdir } from "node:fs";
const fullConfig = {
    mode: "development",
    entry: path.resolve(__dirname, "example1/main.js"),
    output: {
        path: path.resolve(__dirname, "dist"),
    },
};

describe('config', () => {

    test('correct', (done) => {
        const outputPath = path.resolve(__dirname, 'testoutput')
        fullConfig.plugins = [new DependenciesAnalyzerPlugin({
            outputPath: outputPath
        })]
        const compiler = webpack(fullConfig);
        compiler.run(async () => {
            try {
                const stats = await fs.stat(path.join(outputPath, 'dep.json'))
                expect(stats).not.toBe(false)
                expect(stats.isFile()).toBe(true)
                rmdir(outputPath)
                done()
            } catch (error) {
                done(error)
            }
        })
    }, 100000)


    test('error', (done) => {
        const outputPath = path.resolve(__dirname, 'error')
        fullConfig.plugins = [new DependenciesAnalyzerPlugin({
            outputPath: outputPath
        })]
        const compiler = webpack(fullConfig);
        compiler.run(async () => {
            try {
                const stats = await fs.stat(path.join(__dirname, "testoutput", 'dep.json'))
                expect(stats).toBe(false)
                done()
            } catch (error) {
                done()
            } finally {
                rmdir(outputPath)
            }
        })
    }, 100000)

    test('default', (done) => {
        const outputPath = fullConfig.output.path
        fullConfig.plugins = [new DependenciesAnalyzerPlugin()]
        const compiler = webpack(fullConfig);
        compiler.run(async () => {
            try {
                const stats = await fs.stat(path.join(outputPath, 'dep.json'))
                expect(stats).toBe(false)
                done()
            } catch (error) {
                done()
            }
        })
    }, 100000)


    afterAll(() => {
        rmdir(fullConfig.output.path)
    })
})



describe('depend', () => {

    test('basic', done => {
        fullConfig.plugins = [new DependenciesAnalyzerPlugin()]
        const compiler = webpack(fullConfig);
        compiler.run(async () => {
            const res = JSON.parse(await fs.readFile(path.join(__dirname, "dist", 'dep.json')))
            const expectRes = [
                {
                    "from": "",
                    "to": path.join(__dirname, "example1/main.js")
                },
                {
                    "from": path.join(__dirname, "example1/main.js"),
                    "to": path.join(__dirname, "example1/testa.js")
                },
                {
                    "from": path.join(__dirname, "example1/testa.js"),
                    "to": path.join(__dirname, "example1/testb.js")
                },
                {
                    "from": path.join(__dirname, "example1/testb.js"),
                    "to": path.join(__dirname, "example1/asyncchunk.js")
                }
            ]
            expect(expectRes).toEqual(res)

            done()
        })

    }, 1000000)

    afterAll(() => {
        rmdir(path.resolve(__dirname, "dist"))
    })
})