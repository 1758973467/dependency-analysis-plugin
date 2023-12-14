const path = require('node:path')
const fs = require('node:fs/promises')

const allDataDepSet = new Set()

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

    afterResolve = (result, callback) => {
        const { resourceResolveData: {
            context: {
                issuer
            },
            path
        } } = result;

        allDataDepSet.add({
            from: issuer,
            to: path
        })
        callback()
    }

    handleFinishModules = (modules, callback) => {
        const [graph, vertexMap] = generateGraph(allDataDepSet)
        const p1 = fs.writeFile('./graph.json', JSON.stringify(graph))
        const p2 = fs.writeFile('./vertexMap.json', JSON.stringify(Array.from(vertexMap)))
        const p3 = fs.writeFile('./dep.json', JSON.stringify(Array.from(allDataDepSet)))
        Promise.all([p1, p2, p3]).then(() => {
            callback()
        })
    }

    apply(compiler) {

        compiler.hooks.normalModuleFactory.tap(
            "FastDependenciesAnalyzerPlugin",
            nmf => {
                nmf.hooks.afterResolve.tapAsync(
                    "FastDependenciesAnalyzerPlugin",
                    this.afterResolve
                );
            }
        );


        compiler.hooks.compilation.tap(
            "FastDependenciesAnalyzerPlugin",

            compilation => {
                compilation.hooks.finishModules.tapAsync(
                    "FastDependenciesAnalyzerPlugin",
                    this.handleFinishModules
                );
            }
        );

    }
}
module.exports = DependenciesAnalyzerPlugin
