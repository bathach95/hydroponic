service.service('GetTimeService', function() {
    return {
        getDateTime: getDateTime
    }
    // get date and time from string "2017-05-14T09:46:00.000Z"
    function getDateTime(data) {
        var dateTime = data.split('T');
        var dateGMT = dateTime[0];
        var timeGMT = dateTime[1].split('.')[0];

        // get local time
        var dateObject = new Date(dateGMT + " " + timeGMT + " UTC");
        var localDateTime = dateObject.toString().split(" ");
        var date = '';
        for (var i = 1; i < 4; i++) {
            date += localDateTime[i] + " ";
        }
        var time = localDateTime[4];
        return {
            date: date,
            time: time
        }
    }
});

service.service('DataStatusService', function() {
    return {
        getStatus: getStatus
    }

    function getStatus(data, threshold) {

        var status = {
            badStatus: {
                temp: data.temperature < threshold.temperatureLower || data.temperature > threshold.temperatureUpper,
                humidity: data.humidity < threshold.humidityLower || data.humidity > threshold.humidityUpper,
                ppm: data.ppm < threshold.ppmLower || data.ppm > threshold.ppmUpper,
                ph: data.ph < threshold.phLower || data.ph > threshold.phUpper
            }
        }

        status.status = status.badStatus.temp || status.badStatus.humidity || status.badStatus.ppm || status.badStatus.ph;
        return status;
    }
});
