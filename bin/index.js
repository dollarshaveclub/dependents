#!/usr/bin/env node
const colors = require('colors/safe')
const { dependentPackages } = require('../lib')

const dir = process.cwd()
const token = process.env.GITHUB_TOKEN

if (!token) throw new Error(`\nEnvironment variable GITHUB_TOKEN must be set.\nGenerate one with ${colors.cyan('repo')} access here: https://github.com/settings/tokens/new\n`)

dependentPackages(dir, token)
  .then(({ clientPackage, dependentPackages }) => {
    console.log(`${colors.bold(clientPackage.name)}: ${colors.cyan(colors.bold(clientPackage.version))}`)

    dependentPackages
      .sort((a, b) => a.name > b.name)
      .forEach((dependentPackage, i) => {
        let prefix = ' ├─ '
        if ((i === 0 && dependentPackages.length === 1) || i === dependentPackages.length - 1) prefix = ' └─ '

        const version =
          ((dependentPackage.dependencies || {})[clientPackage.name]) ||
          (dependentPackage.devDependencies || {})[clientPackage.name]
        console.log(`${prefix}${dependentPackage.name}: ${version || colors.grey('Not Installed')}`)
      })
  })
  .catch(e => console.error(colors.red(e.message)))
