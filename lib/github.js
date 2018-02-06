const octokit = require('@octokit/rest')({
  timeout: 0,
  requestMedia: 'application/vnd.github.v3+json',
  headers: {
    'user-agent': 'octokit/rest.js v14.0.4', // v1.2.3 will be current version
  },
})

module.exports.authenticate = (token) => octokit.authenticate({
  type: 'token',
  token,
})

module.exports.getAllRepos = async function getAllRepos (method) {
  let response = await octokit.repos.getAll({
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

module.exports.fetchDependentPackages = (org, repos) =>
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
