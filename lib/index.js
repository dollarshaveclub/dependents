const fs = require('fs')
const path = require('path')

const octokit = require('@octokit/rest')({
  timeout: 0,
  requestMedia: 'application/vnd.github.v3+json',
  headers: {
    'user-agent': 'octokit/rest.js v14.0.4', // v1.2.3 will be current version
  },
})

// const paginate = async function paginate (method) {
//   let response = await method({ owner: 'dollarshaveclub', per_page: 100 })
//   let { data } = response
//   while (octokit.hasNextPage(response)) {
//     response = await octokit.getNextPage(response)
//     data = data.concat(response.data)
//   }
//   return data
// }

const content = (owner, repo, filePath) => octokit.repos.getContent({
  owner,
  repo,
  path: filePath,
})

const jsonContent = (owner, repo, filePath) => content(owner, repo, filePath).then(data => JSON.parse(Buffer.from(data.data.content, 'base64').toString('utf-8')))

module.exports.dependentPackages = (dir, token) => {
  const clientPackagePath = path.join(dir, 'package.json')
  const dependentsFilePath = path.join(process.cwd(), '.dependents')

  if (!fs.existsSync(clientPackagePath)) return Promise.reject(new Error(`File ${clientPackagePath} does not exist`))
  if (!fs.existsSync(dependentsFilePath)) return Promise.reject(new Error(`File ${dependentsFilePath} does not exist`))

  octokit.authenticate({
    type: 'token',
    token,
  })

  // paginate(octokit.repos.getAll)
  //   .then(data => {
  //     // handle all results
  //     console.log(data.map(repo => repo.full_name))
  //   }).catch(e => console.error(e))

  // console.log(repos.data)

  const clientPackage = JSON.parse(fs.readFileSync(clientPackagePath))
  const dependents =
    fs.readFileSync(dependentsFilePath)
      .toString('utf-8')
      .split("\n")
      .filter(str => str)
      .map(dependent => {
        const [org, repo] = dependent.split('/')
        return jsonContent(org, repo, 'package.json')
      })

  return Promise.all(dependents).then((dependentPackages) => ({
    clientPackage,
    dependentPackages,
  }))
}
