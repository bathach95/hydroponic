function getDateFromGMT(dateTime) {
  // dateTime format: '2017-08-24T17:00:00.000Z'
  var date = dateTime.toString().split('T')[0].split('-');
  return {
    year: date[0],
    month: date[1],
    date: date[2]
  }

}

module.exports = {
  getDateFromGMT: getDateFromGMT
}
