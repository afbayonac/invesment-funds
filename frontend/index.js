
/* eslint-disable no-undef */

const main = async () => {
  const response = await axios.get('./database/db.json')
  const db = response.data
  const funds = db.funds
  const root = d3.select('.app')

  root
    .selectAll('div')
    .data(funds)
    .enter()
    .append('p')
    .text((d) => `${d.name} ${d.currentYear[d.currentYear.length - 1].value}`)

  console.log(funds)
}

main()
