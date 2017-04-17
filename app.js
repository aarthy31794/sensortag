var app;
(function () {
    app = angular.module('sensortag', ['ngMaterial', 'nvd3'])
        .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .accentPalette('blue-grey');
            $mdThemingProvider.theme('success-toast');
            $mdThemingProvider.theme('error-toast');

            $mdThemingProvider.alwaysWatchTheme(true);
        })
})();

app.service('sensortagService', function () {
    return new Sensortag(navigator.bluetooth);
});

app.controller('mainController', function ($scope, $mdToast, $mdDialog, sensortagService) {

    $scope.sensortag = sensortagService;
    $scope.graph = "Line Chart";
    var util = new Util();

    var objTempData;
    var ambTempData;
    var accelData;
    var gyroData;
    var magnetoData;
    var baroData;
    var humidityData;
    var lightData;
    $scope.timeDispData1 = [];
    $scope.timeDispData2 = [];
    $scope.timeDispData3 = [];

    // Disabling the mouse right click event
    document.addEventListener('contextmenu', event => event.preventDefault());

    // ---------- Line Graph Code START -----------
    $scope.lineGraphoptions = {
        chart: {
            type: 'lineChart',
            height: 250,
            margin: {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function (d) {
                return d.x;
            },
            y: function (d) {
                return d.y;
            },
            useInteractiveGuideline: true,
            duration: 0,
            yAxis: {
                tickFormat: function (d) {
                    return d3.format('.01f')(d);
                }
            },
            xAxis: {
                axisLabel: 'Time',
                showMaxMin: false,
                tickFormat: function (d) {
                    var label = '';
                    if ($scope.timeDispData1[Math.abs(d)]) {
                        label = $scope.timeDispData1[Math.abs(d)];
                    } else if ($scope.timeDispData2[Math.abs(d)]) {
                        label = $scope.timeDispData2[Math.abs(d)];
                    } else if ($scope.timeDispData3[Math.abs(d)]) {
                        label = $scope.timeDispData3[Math.abs(d)];
                    }
                    return label ? label : d3.time.format('%x')(new Date());
                }
            },
            noData: ("")
        }
    };

    $scope.ambTempOptions = angular.copy($scope.lineGraphoptions);
    $scope.objTempOptions = angular.copy($scope.lineGraphoptions);
    $scope.accelOptions = angular.copy($scope.lineGraphoptions);
    $scope.gyroOptions = angular.copy($scope.lineGraphoptions);
    $scope.magnetoOptions = angular.copy($scope.lineGraphoptions);
    $scope.baroOptions = angular.copy($scope.lineGraphoptions);
    $scope.humidityOptions = angular.copy($scope.lineGraphoptions);
    $scope.lightOptions = angular.copy($scope.lineGraphoptions);

    $scope.ambTempOptions.chart.forceY = [20, 70];
    $scope.objTempOptions.chart.forceY = [2, 70];
    $scope.accelOptions.chart.forceY = [-1, 1];
    $scope.gyroOptions.chart.forceY = [-2, 2];
    $scope.magnetoOptions.chart.forceY = [-100, 100];
    $scope.baroOptions.chart.forceY = [500, 1500];
    $scope.humidityOptions.chart.forceY = [20, 100];
    $scope.lightOptions.chart.forceY = [0, 200];

    $scope.ambTempData = [{values: [], key: 'Ambient Temperature'}];
    $scope.objTempData = [{values: [], key: 'Object Temperature'}];
    $scope.accelData = [{values: [], key: 'x-axis', color: '#e11126'},
        {values: [], key: 'y-axis', color: '#1153e1'},
        {values: [], key: 'z-axis', color: '#707276'}
    ];
    $scope.gyroData = [{values: [], key: 'x-axis', color: '#e11126'},
        {values: [], key: 'y-axis', color: '#1153e1'},
        {values: [], key: 'z-axis', color: '#707276'}
    ];
    $scope.magnetoData = [{values: [], key: 'x-axis', color: '#e11126'},
        {values: [], key: 'y-axis', color: '#1153e1'},
        {values: [], key: 'z-axis', color: '#707276'}
    ];
    $scope.baroData = [{values: [], key: 'Barometer'}];
    $scope.humidityData = [{values: [], key: 'Relative Humidity'}];
    $scope.lightData = [{values: [], key: 'Light Sensor'}];

    var tp = 0, ac = 0, gy = 0, mg = 0, ba = 0, hu = 0, lg = 0;
    setInterval(function () {
        if (ambTempData) {
            if (!isNaN(ambTempData.timeNum) && !isNaN(ambTempData.temp)) {
                $scope.ambTempData[0].values.push({
                    x: ambTempData.timeNum,
                    y: ambTempData.temp,
                    label: ambTempData.date
                });
            }
            if ($scope.ambTempData[0].values.length > 30) $scope.ambTempData[0].values.shift();
        }

        if (objTempData) {
            if (!isNaN(objTempData.timeNum) && !isNaN(objTempData.temp))
                $scope.objTempData[0].values.push({
                    x: objTempData.timeNum,
                    y: objTempData.temp,
                    label: objTempData.date
                });
            if ($scope.objTempData[0].values.length > 30) $scope.objTempData[0].values.shift();
        }

        if (accelData) {
            if (!isNaN(accelData.timeNum)) {
                $scope.accelData[0].values.push({
                    x: accelData.timeNum,
                    y: accelData.xVal
                });
                $scope.accelData[1].values.push({
                    x: accelData.timeNum,
                    y: accelData.yVal
                });
                $scope.accelData[2].values.push({
                    x: accelData.timeNum,
                    y: accelData.zVal
                });
            }
            if ($scope.accelData[0].values.length > 30) $scope.accelData[0].values.shift();
            if ($scope.accelData[1].values.length > 30) $scope.accelData[1].values.shift();
            if ($scope.accelData[2].values.length > 30) $scope.accelData[2].values.shift();
        }

        if (gyroData) {
            if (!isNaN(gyroData.timeNum)) {
                $scope.gyroData[0].values.push({
                    x: gyroData.timeNum,
                    y: gyroData.xVal
                });
                $scope.gyroData[1].values.push({
                    x: gyroData.timeNum,
                    y: gyroData.yVal
                });
                $scope.gyroData[2].values.push({
                    x: gyroData.timeNum,
                    y: gyroData.zVal
                });
            }
            if ($scope.gyroData[0].values.length > 30) $scope.gyroData[0].values.shift();
            if ($scope.gyroData[1].values.length > 30) $scope.gyroData[1].values.shift();
            if ($scope.gyroData[2].values.length > 30) $scope.gyroData[2].values.shift();
        }

        if (magnetoData) {
            if (!isNaN(magnetoData.timeNum)) {
                $scope.magnetoData[0].values.push({
                    x: magnetoData.timeNum,
                    y: magnetoData.xVal
                });
                $scope.magnetoData[1].values.push({
                    x: magnetoData.timeNum,
                    y: magnetoData.yVal
                });
                $scope.magnetoData[2].values.push({
                    x: magnetoData.timeNum,
                    y: magnetoData.zVal
                });
            }
            if ($scope.magnetoData[0].values.length > 30) $scope.magnetoData[0].values.shift();
            if ($scope.magnetoData[1].values.length > 30) $scope.magnetoData[1].values.shift();
            if ($scope.magnetoData[2].values.length > 30) $scope.magnetoData[2].values.shift();
        }

        if (baroData) {
            if (!isNaN(baroData.timeNum) && !isNaN(baroData.temp)) {
                $scope.baroData[0].values.push({
                    x: baroData.timeNum,
                    y: baroData.temp,
                    label: baroData.date
                });
            }
            if ($scope.baroData[0].values.length > 30) $scope.baroData[0].values.shift();
        }

        if (humidityData) {
            if (!isNaN(humidityData.timeNum) && !isNaN(humidityData.temp)) {
                $scope.humidityData[0].values.push({
                    x: humidityData.timeNum,
                    y: humidityData.temp,
                    label: humidityData.date
                });
            }
            if ($scope.humidityData[0].values.length > 30) $scope.humidityData[0].values.shift();
        }

        if (lightData) {
            if (!isNaN(lightData.timeNum) && !isNaN(lightData.temp)) {
                $scope.lightData[0].values.push({
                    x: lightData.timeNum,
                    y: lightData.temp,
                    label: lightData.date
                });
            }
            if ($scope.lightData[0].values.length > 30) $scope.lightData[0].values.shift();
        }

    }, 1000);
    // ---------- Line Graph Code END -----------

    // ---------- Pie Chart Code Start ----------
    $scope.pieOptions = {
        chart: {
            type: 'pieChart',
            height: 300,
            donut: true,
            x: function (d) {
                return d.key;
            },
            y: function (d) {
                return d.y;
            },
            showLabels: true,

            pie: {
                startAngle: function (d) {
                    return d.startAngle / 2 - Math.PI / 2
                },
                endAngle: function (d) {
                    return d.endAngle / 2 - Math.PI / 2
                }
            },
            duration: 0,
            legend: {
                margin: {
                    top: 5,
                    right: 70,
                    bottom: 5,
                    left: 0
                }
            }
        }
    };
    setInterval(function () {
        if (ambTempData && !isNaN(ambTempData.temp))
            $scope.pieAmbTempData = [{
                key: "Ambient Temperature",
                y: ambTempData.temp
            }, {
                key: "",
                y: 100
            }];
        if (objTempData && !isNaN(objTempData.temp))
            $scope.pieObjTempData = [{
                key: "Object Temperature",
                y: objTempData.temp
            }, {
                key: "",
                y: 100
            }];
        if (baroData && !isNaN(baroData.temp))
            $scope.pieBarometerData = [{
                key: "Barometer",
                y: baroData.temp
            }, {
                key: "",
                y: 1500
            }];
        if (humidityData && !isNaN(humidityData.temp))
            $scope.pieHumidityData = [{
                key: "Humidity",
                y: humidityData.temp
            }, {
                key: "",
                y: 100
            }];
        if (lightData && !isNaN(lightData.temp))
            $scope.pieLightData = [{
                key: "Light",
                y: lightData.temp
            }, {
                key: "",
                y: 1000
            }];
        $scope.$apply();
    }, 500);
    // ---------- Pie Chart Code End ------------


    function goodToast(message) {
        $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position('top')
                .theme("success-toast")
                .hideDelay(2500)
        );
    };

    function badToast(message) {
        $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position('top')
                .theme('error-toast')
                .hideDelay(2500)
        );
    };

    function showLoadingIndicator($event, text) {
        $scope.showingLoadigIndicator = true;
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            clickOutsideToClose: false,
            template: '<md-dialog style="width: 250px;top:95px;margin-top: -170px;" aria-label="loadingDialog" ng-cloak>' +
            '<md-dialog-content>' +
            '<div layout="row" layout-align="center" style="padding: 40px;">' +
            '<div style="padding-bottom: 20px;">' +
            '<md-progress-circular md-mode="indeterminate" md-diameter="40" style="right: 20px;bottom: 10px;">' +
            '</md-progress-circular>' +
            '</div>' +
            '</div>' +
            '<div layout="row" layout-align="center" style="padding-bottom: 20px;">' +
            '<label>' + text + '</label>' +
            '</div>' +
            '</md-dialog-content>' +
            '</md-dialog>',
            locals: {
                items: $scope.items
            },
            controller: DialogController
        });

        function DialogController($scope, $mdDialog, items) {
            $scope.items = items;
            $scope.closeDialog = function () {
                $mdDialog.hide();
            }
        }
    }

    function dismissLoadingIndicator() {
        $scope.showingLoadigIndicator = false;
        $mdDialog.cancel();
    };

    $scope.updateUI = function () {
        $scope.$apply();
    };

    // HACK : To update the PieChart UI when user selects the PieChrat option
    $scope.graphChange = function () {
        if ($scope.graph === 'Pie Chart') {
            if (ambTempData) ambTempData.temp = ambTempData.temp + 1;
            if (objTempData) objTempData.temp = objTempData.temp + 1;
            if (baroData) baroData.temp = baroData.temp + 1;
            if (humidityData) humidityData.temp = humidityData.temp + 1;
            if (lightData) lightData.temp = lightData.temp + 1;
        }
    };

    $scope.sensortag.updateUI = function (event, notifyChar) {
        if ($scope.showingLoadigIndicator) {
            goodToast('Connected...');
            dismissLoadingIndicator();
        }
        switch (notifyChar) {
            case 'temperature':
                onTempChange(event);
                break;
            case 'accelerometer':
                onAccelerometerChange(event);
                break;
            case 'gyroscope':
                onGyroscopeChange(event);
                break;
            case 'magnetometer':
                onMagnetometerChange(event);
                break;
            case 'humidity':
                onHumidityChange(event);
                break;
            case 'barometer':
                onBarometerChange(event);
                break;
            case 'movement':
                onMovementChange(event);
                break;
            case 'light':
                onLightChange(event);
                break;
        }

        $scope.$apply();
    };

    $scope.onConnect = function () {
        showLoadingIndicator('', 'Connecting ....');
        $scope.sensortag.connect()
            .then(function () {
                dismissLoadingIndicator();
                goodToast('Connected...');
            })
            .catch(function (error) {
                dismissLoadingIndicator();
                console.error('Argh!', error, error.stack ? error.stack : '');
                if (!$scope.sensortag.connected)
                    badToast('Unable to connect.');
            });
    }

    if (!navigator.bluetooth) {
        badToast('Bluetooth not supported, which is required.');
    } else if (navigator.bluetooth.referringDevice) {
        $scope.onConnect();
    }

    function accelerometerUpdate(accelX, accelY, accelZ) {

        if (!isNaN(accelX) && !isNaN(accelY) && !isNaN(accelZ)) {
            accelData = {
                timeNum: ac,
                date: util.getCurrentTime(),
                xVal: accelX,
                yVal: accelY,
                zVal: accelZ
            }
            accelX = 'X: ' + accelX.toFixed(1) + 'G ';
            accelY = 'Y: ' + accelY.toFixed(1) + 'G ';
            accelZ = 'Z: ' + accelZ.toFixed(1) + 'G ';

            var accelVar = accelX + ', ' + accelY + ', ' + accelZ;
            $scope.accelerometer = accelVar;
        } else {
            $scope.accelerometer = 'X: 0.0G Y: 0.0G Z: 0.0G';
        }
        ac ++;
        $scope.timeDispData3.push(util.getCurrentTime()); //Added this one for display the time on x-axis
        $scope.updateUI();
    }

    function gyroscopeUpdate(gyroX, gyroY, gyroZ) {

        if (!isNaN(gyroX) && !isNaN(gyroY) && !isNaN(gyroZ)) {
            gyroData = {
                timeNum: gy,
                date: util.getCurrentTime(),
                xVal: gyroX,
                yVal: gyroY,
                zVal: gyroZ
            }
            gyroX = 'X: ' + gyroX.toFixed(1) + '°/S';
            gyroY = 'Y: ' + gyroY.toFixed(1) + '°/S';
            gyroZ = 'Z: ' + gyroZ.toFixed(1) + '°/S';

            var GyroVal = gyroX + ', ' + gyroY + ', ' + gyroZ;
            $scope.gyroscope = GyroVal;
        } else {
            $scope.gyroscope = 'X: 0.0°/S Y: 0.0°/S Z: 0.0°/S';
        }
        gy ++;
        $scope.updateUI();
    }

    function magnetometerUpdate(magX, magY, magZ) {

        if (!isNaN(magX) && !isNaN(magY) && !isNaN(magZ)) {
            magnetoData = {
                timeNum: mg,
                date: util.getCurrentTime(),
                xVal: magX,
                yVal: magY,
                zVal: magZ
            }
            magX = 'X: ' + magX.toFixed(2) + 'uT ';
            magY = 'Y: ' + magY.toFixed(2) + 'uT ';
            magZ = 'Z: ' + magZ.toFixed(2) + 'uT ';

            var magVal = magX + ', ' + magY + ', ' + magZ;
            $scope.magnetometer = magVal;
        } else {
            $scope.magnetometer = 'X: 0.0uT Y: 0.0uT Z: 0.0uT';
        }
        mg ++;
        $scope.updateUI();
    }

    /* Sensor Notification Services*/
    function onTempChange(event) {
        var characteristic = event.target;

        var hex = util.getHexDataFromCharacValue(characteristic.value);

        var tempAmb = util.calcTAmb(hex);
        if (!isNaN(tempAmb) && tempAmb !== 0) {
            tempAmb = tempAmb.toFixed(2);
            $scope.ambTemp = tempAmb + '°C';
        } else if (tempAmb === 0) {
            $scope.ambTemp = tempAmb + '°C';
        }

        var tempIr;
        if ($scope.sensortag.sensortag2) {
            tempIr = util.calcTempIr_st2(hex);
            if (!isNaN(tempIr) && tempIr !== 0) {
                tempIr = tempIr.toFixed(2);
                $scope.objTemp = tempIr + '°C';
            } else if (tempIr === 0) {
                $scope.objTemp = tempIr + '°C';
            }
        } else {
            tempIr = util.calcTempIr(hex);
            if (!isNaN(tempIr) && tempIr !== 0) {
                tempIr = tempIr.toFixed(2);
                $scope.objTemp = tempIr + '°C';
            } else if (tempIr === 0) {
                $scope.objTemp = tempIr + '°C';
            }
        }

        if (!isNaN(Number(tempAmb))) {
            ambTempData = {
                timeNum: tp,
                date: util.getCurrentTime(),
                temp: Number(tempAmb)
            }
        }

        if (!isNaN(Number(tempIr))) {
            objTempData = {
                timeNum: tp,
                date: util.getCurrentTime(),
                temp: Number(tempIr)
            }
        }
        tp ++;
        $scope.timeDispData1.push(util.getCurrentTime()); //Added this one for display the time on x-axis

        $scope.updateUI();
    }

    function onAccelerometerChange(event) {
        var characteristic = event.target;

        var hex = util.getHexDataFromCharacValue(characteristic.value);

        var accelX = util.calcAccXValue(hex, $scope.sensortag.sensortag_firmware);
        var accelY = util.calcAccYValue(hex, $scope.sensortag.sensortag_firmware);
        var accelZ = util.calcAccZValue(hex, $scope.sensortag.sensortag_firmware);

        accelerometerUpdate(accelX, accelY, accelZ);

    }

    function onGyroscopeChange(event) {
        var characteristic = event.target;

        var hex = util.getHexDataFromCharacValue(characteristic.value);

        var gyroX = util.calcGyrXValue(hex);
        var gyroY = util.calcGyrYValue(hex);
        var gyroZ = util.calcGyrZValue(hex);

        gyroscopeUpdate(gyroX, gyroY, gyroZ);
    }

    function onMagnetometerChange(event) {
        var characteristic = event.target;

        var hex = util.getHexDataFromCharacValue(characteristic.value);

        var magX = util.calcMagXValue(hex);
        var magY = util.calcMagYValue(hex);
        var magZ = util.calcMagZValue(hex);

        magnetometerUpdate(magX, magY, magZ);
    }

    function onBarometerChange(event) {
        var characteristic = event.target;

        var hex = util.getHexDataFromCharacValue(characteristic.value);

        var pressure;
        if ($scope.sensortag.sensortag2) {
            pressure = util.calcPressure_st2(hex);
            if (!isNaN(pressure)) {
                pressure = pressure.toFixed(1);
            }
        } else {
            pressure = util.calcPressure(hex);
            if (!isNaN(pressure)) {
                pressure = pressure.toFixed(1);
            }
        }
        $scope.barometer = pressure + ' mBar';


        if (!isNaN(Number(pressure))) {
            baroData = {
                date: util.getCurrentTime(),
                timeNum: ba,
                temp: Number(pressure)
            }
        }
        ba ++;
        $scope.timeDispData2.push(util.getCurrentTime()); //Added this one for display the time on x-axis

        $scope.updateUI();
    }

    function onHumidityChange(event) {
        var characteristic = event.target;

        var hex = util.getHexDataFromCharacValue(characteristic.value);

        var tempHum = util.calcPress(hex);
        if (!isNaN(tempHum)) {
            tempHum = tempHum.toFixed(2);
            $scope.humidity = tempHum + '%rH';
        }

        if (!isNaN(Number(tempHum))) {
            humidityData = {
                timeNum: hu,
                date: util.getCurrentTime(),
                temp: Number(tempHum)
            }
        }
        hu ++;
        $scope.updateUI();
    }

    function onMovementChange(event) {
        var characteristic = event.target;

        var hex = util.getHexDataFromCharacValue(characteristic.value);

        var accelX = Number(util.movement_ACC_X(hex));
        var accelY = Number(util.movement_ACC_Y(hex));
        var accelZ = Number(util.movement_ACC_Z(hex));

        accelerometerUpdate(accelX, accelY, accelZ);

        var gyroX = Number(util.movement_GYRO_X(hex));
        var gyroY = Number(util.movement_GYRO_Y(hex));
        var gyroZ = Number(util.movement_GYRO_Z(hex));

        gyroscopeUpdate(gyroX, gyroY, gyroZ);


        var magX = Number(util.movement_MAG_X(hex));
        var magY = Number(util.movement_MAG_Y(hex));
        var magZ = Number(util.movement_MAG_Z(hex));

        magnetometerUpdate(magX, magY, magZ);
    }

    function onLightChange(event) {
        var characteristic = event.target;

        var hex = util.getHexDataFromCharacValue(characteristic.value);

        var result = util.calLight(hex);
        if (result !== undefined && !isNaN(result)) {
            $scope.light = result + ' Lux';
        }

        if (!isNaN(Number(result))) {
            lightData = {
                timeNum: lg,
                date: util.getCurrentTime(),
                temp: Number(result)
            }
        }
        lg ++;
        $scope.updateUI();
    }

});