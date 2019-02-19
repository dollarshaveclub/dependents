#!/usr/bin/env node
let colors = require('colors')
const program = require('commander')
const path = require('path')

const { version } = require('../package.json')
const { dependentPackages } = require('../lib')

program
  .version(version)
  .option('-m, --machine-readable', 'Allow for machine-readable output')
  .option('-t, --text', 'Plain text output')
  .option('-p, --package [file]', 'The path to the package.json file that contains dependents')
  .option('-r, --remote', 'Search against remote repositories in your org')
  .option('-i, --installed', 'Only show packages that have the dependency installed')
  .parse(process.argv)

if (program.text) {
  colors = {
    cyan: (s) => s,
    yellow: (s) => s,
    bold: (s) => s,
    grey: (s) => s,
    red: (s) => s,
  }
}

const packagePath = program.package || path.join(process.cwd(), 'package.json')
const token = process.env.GITHUB_TOKEN
if (!token) throw new Error(`\nEnvironment variable GITHUB_TOKEN must be set.\nGenerate one with ${colors.cyan('repo')} access here: https://github.com/settings/tokens/new\n`)

dependentPackages(packagePath, program.remote, token)
  .then(({ clientPackage, dependentPackages }) => {
    if (program.m) {
      console.log(dependentPackages.map(({ data: { name, version } }) => ({ name, version })))
      return process.exit()
    }
    console.log(`${colors.bold(clientPackage.name)}: ${colors.cyan(colors.bold(clientPackage.version))}`)
    dependentPackages
      .sort((a, b) => a.data.name > b.data.name)
      .forEach(({ data, repo, note }, i) => {
        let prefix = ' ├─ '
        if ((i === 0 && dependentPackages.length === 1) || i === dependentPackages.length - 1) prefix = ' └─ '

        const version =
          ((data.dependencies || {})[clientPackage.name]) ||
          (data.devDependencies || {})[clientPackage.name]

        if ((program.installed && version) || !program.installed) console.log(`${prefix}${repo}: ${note ? colors.yellow(note) : version || colors.grey('Not Installed')}`)
      })
  }
)
  .catch(e => console.error(colors.red(e.message)))
