const path = require('node:path')
const fs = require('node:fs/promises')
const fsSync = require('node:fs')
const { mkdirp } = require('mkdirp')
const chalk = require('chalk')
function makeGraph(len) {
    const graph = Array.from({ length: len }, () => Array.from({ length: len }, () => 0))
    return graph
}
function generateGraph(edgeSet) {
    const temp = Array.from(edgeSet)
    const fromVertex = temp.map(item => item.from)
    const toVertex = temp.map(item => item.to)
    const allVertexsSet = new Set([...fromVertex, ...toVertex])
    const allVertexs = Array.from(allVertexsSet)

    const graph = makeGraph(allVertexs.length)
    // string,int
    const vertexMap = new Map()
    for (let i = 0; i < allVertexs.length; ++i) {
        vertexMap.set(allVertexs[i], i)
    }
    for (const { from, to } of edgeSet) {
        const fromIdx = vertexMap.get(from)
        const toIdx = vertexMap.get(to)
        graph[fromIdx][toIdx] = 1
    }
    return [graph, vertexMap]
}


// data 
/**
 * 
 * userRequest,resource 文件的绝对路径
 * dependcies 被依赖
 * resourceResolveData 
 *  path 文件的绝对路径
 *  context 
 *      issuer 发起人
 */
class DependenciesAnalyzerPlugin {
    static className = 'DependenciesAnalyzerPlugin'

    constructor(options) {
        this.allDataDepSet = new Set()
        if (typeof options?.outputPath === 'string') {
            if (fsSync.existsSync(path.normalize(options.outputPath))) {
                console.warn(chalk.red('will overwrite result!'));
            }
            this.outputPath = path.normalize(options.outputPath)
        } else {
            this.outputPath = null
        }
    }

    afterResolve = (result, callback) => {
        const { resourceResolveData: {
            context: {
                issuer
            },
            path
        } } = result;

        this.allDataDepSet.add({
            from: issuer,
            to: path
        })
        callback()
    }

    handleFinishModules = (modules, callback) => {
        const [graph, vertexMap] = generateGraph(this.allDataDepSet)
        mkdirp(this.outputPath).then(() => {
            const p1 = fs.writeFile(path.join(this.outputPath, 'graph.json'), JSON.stringify(graph))
            const p2 = fs.writeFile(path.join(this.outputPath, 'vertexMap.json'), JSON.stringify(Array.from(vertexMap)))
            const p3 = fs.writeFile(path.join(this.outputPath, 'dep.json'), JSON.stringify(Array.from(this.allDataDepSet)))
            Promise.all([p1, p2, p3]).then(() => {
                callback()
            })
        })
    }

    apply(compiler) {
        if (!this.outputPath) {
            compiler.hooks.afterEnvironment.tap(DependenciesAnalyzerPlugin.className,
                () => {
                    this.outputPath = compiler.options.output.path
                })
        }

        compiler.hooks.normalModuleFactory.tap(
            DependenciesAnalyzerPlugin.className,
            nmf => {
                nmf.hooks.afterResolve.tapAsync(
                    DependenciesAnalyzerPlugin.className,
                    this.afterResolve
                );
            }
        );


        compiler.hooks.compilation.tap(
            DependenciesAnalyzerPlugin.className,
            compilation => {
                compilation.hooks.finishModules.tapAsync(
                    DependenciesAnalyzerPlugin.className,
                    this.handleFinishModules
                );
            }
        );
    }
}
module.exports = DependenciesAnalyzerPlugin
