const grr = require('github-readme-retriever')

module.exports = {
  getAssignments,
  getList,
  checkList,
  getFiles,
  makeIssues,
  sort
}

function getAssignments (sprint) {
  console.log({sprint});
  return getList(sprint)
    .then(checkList)
    .then(getFiles)
    .then((files) => {
      return makeIssues(files, sprint)
    })
    .then(sort)
}

function getList (sprint) {
  const config = {
    owner: 'dev-academy-programme',
    repo: 'curriculum-private',
    path: 'assignments',
    branch: 'master'
  }
  return grr.getList(config, process.env['WTR_ACCESS_TOKEN'])
    .then((assignments) => {
      const paths = sprintPaths(assignments, sprint)
      return Object.assign(assignments, { paths: paths })
    })
}

function checkList (assignments) {
  console.log({assignments});
  if (assignments.paths.find(isNumeric)) {
    return assignments
  }
  return Promise.reject(new Error('No assignments found for that sprint.'))
}

function isNumeric (assignment) {
  const name = assignment.split('/').pop()
  return !isNaN(name[0]) || names[0] == 'p'
}

function getFiles (assignments) {
  return grr.getFiles(assignments, process.env['WTR_ACCESS_TOKEN'])
    .then((files) => {
      return files
    })
}

function makeIssues (assignments, sprint) {
  return assignments.map((assignment) => {
    return Object.assign({ labels: [ `sprint-${Math.floor(sprint)}` ] }, assignment)
  })
}

function sort (issues) {
  return issues
    .map(convertVersions)
    .sort(lexicographicalSort)
    .map(cleanup)
}

function convertVersions (issue) {
  const parts = /([\d]+.[\d]+)(.*)/.exec(issue.title)
  const prefix = parts[1]
    .split('.')
    .map((n) => {
      return parseInt(n, 10)
    })

  return {
    issue: issue,
    titlePrefix: prefix,
    titleBody: parts[2]
  }
}

function lexicographicalSort (a, b) {
  let first = a.titlePrefix[0]
  let second = b.titlePrefix[0]

  if (first === second) {
    first = a.titlePrefix[1]
    second = b.titlePrefix[1]
  }
  return first < second ? -1 : first > second ? 1 : 0
}

function cleanup (sortObject) {
  return sortObject.issue
}

function matchSingle (sprint, assignment) {
  const name = assignment.split('/').pop()
  return name.split('-')[0] === sprint
}

function matchSprint (sprint, assignment) {
  console.log({sprint, assignment});
  const name = assignment.split('/').pop()
  if (name.split('-')[0] === 'p') {
    return true
  }
  const prefix = name.split('.')[0]
  const n = parseInt(prefix, 10)
  if (isNaN(n)) {
    return false
  }
  return sprint === prefix
}

function sprintPaths (assignments, sprint) {
  return assignments.paths
    .filter((path) => {
      return path.includes(`assignments/${sprint}`) || path.includes('assignments/p')
    })
}
