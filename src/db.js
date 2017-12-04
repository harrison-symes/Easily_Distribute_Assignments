const config = require('../knexfile').development
const knex = require('knex')(config)

const moment = require('moment')
const colors = require('colors')

function flag (last_update) {
  const fromNow = moment(last_update).fromNow()
  let colour = 'cyan'
  if (fromNow.split(' ').includes('days')) colour = fromNow.split(' ')[0] > 7 ? (fromNow.split(' ')[0] > 14 ? 'red': 'yellow') : 'green'
  else if (fromNow.split(' ').includes('weeks')) colour = 'red'
  else if (fromNow.split(' ').includes('month')) colour = 'red'
  else if (fromNow.split(' ').includes('months')) colour = 'gray'
  return colors[colour](moment(last_update).fromNow())
}

function f (string, len, colour) {
  let size = len- string.toString().length
  if (size < 0) size = 0
  return colors[colour || 'white'](`${string}${Array(size).fill(" ").join('')}`)
}

function printStudent ({name, last_name, cohort_name, current_sprint, github_name, cl_colour, last_update}) {
  return console.log(`${f(name, 15)}${f(last_name, 15)} ${f(cohort_name, 15, cl_colour)}${f(current_sprint, 5)} @${f(github_name, 20)} ${flag(last_update)}`)
}

function headers () {
  return console.log(`${f("name", 15, "underline")}${f("last name", 15, "underline")} ${f("cohortname", 15, "underline")}${f("sprnt", 5, "underline")} @${f("githubname", 20, "underline")}`)
}

module.exports = {
  findStudent: (name) => knex('students')
    .where('name', 'like', `${name}%`)
    .orWhere('github_name', "like", `%${name}%`)
    .orWhere('last_name', "like", `%${name}%`)
    .join('cohorts', 'students.cohort_id', 'cohorts.id'),
  addStudent: (student) => knex('students')
    .insert(student),
  updateSprint: (github_name, current_sprint) => knex('students')
    .update({current_sprint})
    .where('students.github_name', github_name),
  deleteStudent: (github_name) => knex('students')
    .where('github_name', github_name)
    .del(),
  getCohorts: () => knex('cohorts'),
  listAll: () => knex('students')
    .join('cohorts', 'students.cohort_id', 'like', 'cohorts.id')
    .orderBy('name', 'asc')
    .then(students => {
      headers()
      students.forEach(printStudent)
    })
}
