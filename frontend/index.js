
/* eslint-disable no-undef */

const main = async () => {
  const response = await axios.get('./database/db.json')
  const db = response.data
  const funds = db.funds
  const root = d3.select('.app')


  funds.map(fund => {
    const funtHtml = root.append('div').attr('class', 'invesment-fund')

    funtHtml.append('h4').text(fund.name)
    
    const  graph = funtHtml.append('svg').attr('width', 700).attr('height', 100)
    console.log(fund.currentYear.length)
    const step = 700 / fund.currentYear.length
    

    var scale = d3.scaleLinear()
      .domain([-100, 100])
      .range([100, 0]);
    

    console.log(fund.currentYear)
    const points = fund.currentYear.map((c, i) => [
      i * step, 
      scale(Number(c.value.replace('%', '').replace(',', '.')) || 0),
    ])
    
    console.log(points)

    var lineGenerator = d3.line()
      .curve(d3.curveLinear);
  
    var pathData = lineGenerator(points);

    console.log(pathData)

    graph.append('path')
      .attr('d', pathData)
      .attr('stroke', 'red')
      .attr('stroke-width', 1)
    
    graph.append('line')
      .attr('x1', 0).attr('y1', 50)
      .attr('x2', 700).attr('y2', 50)
      .attr('stroke', '#ffffff30')
      .attr('stroke-width', 1)
    
  })

  root
    .selectAll('div')
    .data(funds)
    .enter()
    .append('div')
    .text((d) => `${d.name} ${d.currentYear[d.currentYear.length - 1].value}`)

  console.log(funds)
}

main()
