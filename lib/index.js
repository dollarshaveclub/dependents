const fs = require('fs')

const octokit = require('@octokit/rest')({
  timeout: 0,
  requestMedia: 'application/vnd.github.v3+json',
  headers: {
    'user-agent': 'octokit/rest.js v14.0.4', // v1.2.3 will be current version
  },
})

const paginate = async function paginate (method) {
  let response = await method({
    affiliation: 'organization_member',
    per_page: 100,
  })
  let { data } = response
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response)
    data = data.concat(response.data)
  }
  return data
}

const content = (owner, repo, filePath) => octokit.repos.getContent({
  owner,
  repo,
  path: filePath,
})

const jsonContent = (owner, repo, filePath) => content(owner, repo, filePath).then(data => JSON.parse(Buffer.from(data.data.content, 'base64').toString('utf-8')))

const fetchDependentPackages = ({ org, repos }) =>
  Promise.all(
    repos.map(repo =>
      jsonContent(org, repo, 'package.json')
        .then(data => ({
          note: null,
          repo,
          data,
        }))
        .catch(() => ({
          note: 'No package.json',
          repo,
          data: {
            name: repo,
          },
        }))
    )
  )

module.exports.dependentPackages = (clientPackagePath, searchAll, token) => {
  if (!fs.existsSync(clientPackagePath)) return Promise.reject(new Error(`File ${clientPackagePath} does not exist`))

  octokit.authenticate({
    type: 'token',
    token,
  })

  const clientPackage = JSON.parse(fs.readFileSync(clientPackagePath))
  const { dependents } = clientPackage
  if (!dependents) return Promise.reject(new Error(`No dependents defined in ${clientPackagePath}`))

  let dependentsPromise
  if (searchAll) {
    dependentsPromise = paginate(octokit.repos.getAll)
      .then(allRepos =>
          fetchDependentPackages({
            ...dependents,
            repos: allRepos.map(repo => repo.name),
          }))
  } else {
    dependentsPromise = fetchDependentPackages(dependents)
  }

  return dependentsPromise.then((dependentPackages) => ({
    clientPackage,
    dependentPackages,
  }))
  .catch(e => console.error(e))
}
