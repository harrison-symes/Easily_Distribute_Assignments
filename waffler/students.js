import github from 'octonode'

export default function getStudents (cohort, assign, except) {
  return getTeam(cohort)
    .then(team => getTeamMembers(team, assign, except))
}

export function getTeam (cohort) {
  const client = github.client(process.env['WTR_ACCESS_TOKEN'])

  return new Promise((resolve, reject) => {
    client.org(cohort)
      .teams((err, teams) => {
        if (err) {
          return reject(new Error("Can't get teams for that org."))
        }
        const team = teams.find((t) => {
          return t.slug === cohort
        })
        if (!team) {
          return reject(new Error(`Can't find team for '${cohort}' on org '${cohort}'.`))
        }

        return resolve(team)
      })
  })
}

export function getTeamMembers (team, assign, except) {
  const client = github.client(process.env['WTR_ACCESS_TOKEN'])

  return new Promise((resolve, reject) => {
    client.team(team.id)
      .members((err, members) => {
        if (err) {
          return reject(new Error("Couldn't get members for the cohort team."))
        }
        if (members.length === 0) {
          return reject(new Error('No students on that team.'))
        }

        const logins = members.map(member => member.login)

        if (assign || except) {
	        let result = [...logins]

	        // except always overrides assign
          if (assign) result = result.filter(login => assign.includes(login))
          if (except) result = result.filter(login => !except.includes(login))
          if (members.length == 30 && result.length == 0) return resolve(getTeamMember(team, assign, except))
          return resolve(result)
        }
        return resolve(logins)
      })
  })
}

function getTeamMember (team, assign, except) {
  var client = _octonode2.default.client(process.env['WTR_ACCESS_TOKEN']);
  console.log("getting single member", assign);
  return new Promise(function(resolve, reject) {
    client.team(team.id).member(assign, (err, match) => {
      console.log({err, match});
      if (match) resolve([assign])
      else reject(err.message)
    })
  });
}
