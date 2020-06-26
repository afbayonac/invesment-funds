const axios = require('axios');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const async = require('async')

const adapter = new FileSync("../../frontend/database/db.json")
const db = low(adapter)

db.defaults({ funds: [] }).write()

/*
{
  nit: '800244627',
  nombre: 'Fidurenta',
  calificacion: 'S3/AAAf(col)',
  plazo: '30 a 59 dÃ­as; 60 a 89 dÃ­as; 90 a 179dÃ­as; 180 a 359 dÃ­as; 360 dÃ­as en adelante.',
  valorDeUnidad: '34.247,58',
  valorEnPesos: '$992,456,251,494.99',
  rentabilidad: {
    dias: { semanal: '17,59%', mensual: '18,88%', semestral: '7,37%' },
    anios: {
      anioCorrido: '7,63%',
      ultimoAnio: '5,79%',
      ultimos2Anios: '5,26%',
      ultimos3Anios: '5,26%'
    }
  },
  fechaCierre: '20200609',
  sociedadAdministradora: 'Fiduciaria Bancolombia S.A.'
}
*/ 

// lista de fondos Bancolombia
// https://www.grupobancolombia.com/consultarFondosInversion/rest/servicio/consultarListaFondos/


const listUrl = "https://www.grupobancolombia.com/consultarFondosInversion/rest/servicio/consultarListaFondos/";
const getUrl = (nit) => `https://www.grupobancolombia.com/consultarFondosInversion/rest/servicio/buscarInformacionFondo/${nit}`

const getFunds = async () => {
  try {
    const response = await axios.get(listUrl)
    return response.data
  } catch (e) {
    console.error("Error get list of bancolombia funds")
    console.error(e)
  }
}

const getDataFund = async nit => {
  try {
    const response = await axios.get(getUrl(nit))
    return response.data
  } catch (e) {
    console.error(`Error get ${nit} bancolombia fund`)
    console.error(e)
  }
}

const getData = nitList => {
  return new Promise((resolve, reject) => {
    async.mapLimit(nitList, 5, getDataFund, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

const newFund = ({
  nit, 
  nombre, 
  calificacion, 
  plazo, 
  valorDeUnidad, 
  valorEnPesos, 
  rentabilidad,
  fechaCierre, 
  sociedadAdministradora,
 }) => {
  const date = Date.now()
  db.get('funds')
    .push({
      uid: nit,
      nit,
      name: nombre,
      rate: calificacion, 
      deadline: plazo,
      unitValue: [{ date, value: valorDeUnidad }],
      value: [{date, value: valorEnPesos}],
      profitability: rentabilidad,
      closeDate: fechaCierre,
      managementCompany: sociedadAdministradora,
      currentYear: [{ date, value: rentabilidad.anios.anioCorrido }]
    })
    .write()
}


const updateFund = ({ nit, valorDeUnidad, nombre, rentabilidad, valorEnPesos}) => {
  const date = Date.now()
  db.get('funds')
    .find({uid: nit})
    .get('currentYear')
    .push({ date, value: rentabilidad.anios.anioCorrido, name: nombre })
    .write()

  db.get('funds')
    .find({uid: nit})
    .get('unitValue')
    .push({ date, value: valorDeUnidad })
    .write()

  db.get('funds')
    .find({uid: nit})
    .get('valorEnPesos')
    .push({ date, value: valorEnPesos })
    .write()
}


module.exports = async () => {
  const fundsList = await getFunds()
  const nitSet = new Set(fundsList.map(f => f.nit))
  const nitList = [...nitSet]
  
  const funds = await getData(nitList)

  funds.map(fund => {
    dbFund = db.get('funds').find({ uid: fund.nit }) 

    if (!dbFund.value()) {
      return newFund(fund) 
    } else {
      return updateFund(fund)
    }
  })
}




