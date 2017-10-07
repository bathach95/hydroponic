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

service.service('StandardStringService', function(){
    this.standardizeString = function(string){
        if (string) {
            var  str = string.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
            str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
            str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
            str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
            str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
            str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
            str = str.replace(/(đ)/g, 'd');
            str = str.replace(/(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/g, 'A');
            str = str.replace(/(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/g, 'E');
            str = str.replace(/(Ì|Í|Ị|Ỉ|Ĩ)/g, 'I');
            str = str.replace(/(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/g, 'O');
            str = str.replace(/(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/g, 'U');
            str = str.replace(/(Ỳ|Ý|Ỵ|Ỷ|Ỹ)/g, 'Y');
            str = str.replace(/(Đ)/g, 'D');
            str = str.replace(/[^A-Za-z0-9 ]/, '');
            str = str.replace(/\s+/g, ' ');
            str = str.trim();
            str = str.toLowerCase();
            // str = str.replace(/\s/g,'-');
            return str;
        }
    }
})
