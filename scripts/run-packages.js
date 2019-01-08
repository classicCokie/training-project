#!/usr/bin/env node
/* eslint import/no-commonjs:0 */

const fs = require('fs')
const path = require('path')
const Package = require('@lerna/package')
const PackageGraph = require('@lerna/package-graph')
const childProcess = require('@lerna/child-process')
const program = require('commander')

const packagesDir = path.resolve(__dirname, '..', 'packages')

const main = (packagePath, {primaryCommand, secondaryCommand}) => {

    const localPackages = (
        fs.readdirSync(packagesDir)
            .map((p) => (path.resolve(packagesDir, p)))
            .filter((p) => (fs.existsSync(path.resolve(p, 'package.json'))))
            .map((p) => ({pkg: require(path.resolve(p, 'package.json')), location: p}))
            .map((p) => (new Package(p.pkg, p.location)))
    )

    const packagesByName = localPackages.reduce((obj, pkg) => {
        obj[pkg.name] = pkg
        return obj
    }, {})

    const packagesByLocation = localPackages.reduce((obj, pkg) => {
        obj[pkg.location] = pkg
        return obj
    }, {})

    const locationsByPackageName = localPackages.reduce((obj, pkg) => {
        obj[pkg.name] = pkg.location
        return obj
    }, {})

    const primaryPackageNames = [packagesByLocation[path.resolve(packagePath)].name]

    const packageGraph = new PackageGraph(localPackages)

    const localDependencies = (
        primaryPackageNames
        .map((p) => packageGraph.get(p).localDependencies.values())
        .map((iterator) => Array.from(iterator))
        .reduce((acc, curr) => acc.concat(curr), [])
        .filter((dependency) => {
            // Filter dependent packages to those that actually have the command
            const pkg = packagesByName[dependency.name]
            return pkg.scripts && pkg.scripts[secondaryCommand]
        })
        .reduce((acc, curr) => {
            if (acc.indexOf(curr.name) < 0) {
                acc.push(curr.name)
            }
            return acc
        }, [])
    )

    const spawn = (name, command) => {
        return childProcess.spawnStreaming(
            'npm',
            ['run', command, '--prefix', locationsByPackageName[name]],
            null,
            name
        )
    }

    return [
        ...primaryPackageNames.map((name) => spawn(name, primaryCommand)),
        ...localDependencies.map((name) => spawn(name, secondaryCommand))
    ]
}

const description = (
    `Runs NPM scripts in a package and in any local packages it depends on.

    This is useful when you want to run/watch multiple local packages at once. As
    an example, you might want to start the PWA's devserver and watch the connecotor
    it depends on for changes. Eg.

     ./run-packages.js ./packages/pwa --primaryCommand start --secondaryCommand watch

    By inspecting packages for their dependencies we can ensure that we run each
    command in the minimum number of packages. Contrast this to just doing
    "lerna run watch" which would blindly run "watch" in all packages in the monorepo.
    `
)

program
    .description(description)
    .arguments('<packagePath>')
    .option('-p, --primaryCommand <command>', 'npm script to run on primary packages, eg. "watch"')
    .option('-s, --secondaryCommand <command>', 'npm script to run on dependent packages, eg. "watch"')
    .action(main)
    .parse(process.argv)
