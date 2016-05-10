var app;
(function () {
    app = angular.module('sensortag', ['ngMaterial', 'nvd3'])
        .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .accentPalette('pink');
            $mdThemingProvider.theme('success-toast');
            $mdThemingProvider.theme('error-toast');

            $mdThemingProvider.alwaysWatchTheme(true);
        })
})();

app.controller('mainController', function ($scope, $mdToast) {

    $scope.sensortag = sensortag;

    // ---------- Graph Code START -----------
    $scope.options = {
        chart: {
            type: 'lineChart',
            height: 250,
            margin : {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            useInteractiveGuideline: true,
            duration: 0,    
            yAxis: {
                tickFormat: function(d){
                   return d3.format('.01f')(d);
                }
            },
            xAxis: {
                tickFormat: function(d){
                   return $scope.sensortag.humidityData.date;
                }
            }
        }
    };

    $scope.amdTempOptions = angular.copy($scope.options);
    $scope.objTempOptions = angular.copy($scope.options);
    $scope.accelOptions = angular.copy($scope.options);
    $scope.gyroOptions = angular.copy($scope.options);
    $scope.magnetoOptions = angular.copy($scope.options);
    $scope.baroOptions = angular.copy($scope.options);
    $scope.humidityOptions = angular.copy($scope.options);
    $scope.lightOptions = angular.copy($scope.options);

    $scope.amdTempData = [{ values: [], key: 'Ambient Temperature' }];
    $scope.objTempdata = [{ values: [], key: 'Object Temperature' }];
    $scope.accelData = [{ values: [], key: 'x-axis', color: '#e11126' },
                        { values: [], key: 'y-axis', color: '#1153e1' },
                        { values: [], key: 'z-axis', color: '#707276' }];
    $scope.gyroData = [{ values: [], key: 'x-axis', color: '#e11126' },
                        { values: [], key: 'y-axis', color: '#1153e1' },
                        { values: [], key: 'z-axis', color: '#707276' }];
    $scope.magnetoData = [{ values: [], key: 'x-axis', color: '#e11126' },
                        { values: [], key: 'y-axis', color: '#1153e1' },
                        { values: [], key: 'z-axis', color: '#707276' }];
    $scope.baroData = [{ values: [], key: 'Barometer' }];
    $scope.humidityData = [{ values: [], key: 'Relative Humidity' }];
    $scope.lightData = [{ values: [], key: 'Light Sensor' }];

    var x = 0;
    setInterval(function(){
        if(!isNaN($scope.sensortag.ambTempData.timeNum) && !isNaN($scope.sensortag.ambTempData.temp)){
            $scope.amdTempData[0].values.push(
                { x: $scope.sensortag.ambTempData.timeNum,
                  y: $scope.sensortag.ambTempData.temp});
        }
        if ($scope.amdTempData[0].values.length > 100) $scope.amdTempData[0].values.shift();

        if(!isNaN($scope.sensortag.objTempData.timeNum) && !isNaN($scope.sensortag.objTempData.temp))
        $scope.objTempdata[0].values.push(
            { x: $scope.sensortag.objTempData.timeNum,
              y: $scope.sensortag.objTempData.temp});
        if ($scope.objTempdata[0].values.length > 100) $scope.objTempdata[0].values.shift();

        if(!isNaN($scope.sensortag.accelData.timeNum)){
            $scope.accelData[0].values.push(
                { x: $scope.sensortag.accelData.timeNum,
                  y: $scope.sensortag.accelData.xVal});
            $scope.accelData[1].values.push(
                { x: $scope.sensortag.accelData.timeNum,
                  y: $scope.sensortag.accelData.yVal});
            $scope.accelData[2].values.push(
                { x: $scope.sensortag.accelData.timeNum,
                  y: $scope.sensortag.accelData.zVal});
        }
        if ($scope.accelData[0].values.length > 100) $scope.accelData[0].values.shift();
        if ($scope.accelData[1].values.length > 100) $scope.accelData[1].values.shift();
        if ($scope.accelData[2].values.length > 100) $scope.accelData[2].values.shift();

        if(!isNaN($scope.sensortag.gyroData.timeNum)){
            $scope.gyroData[0].values.push(
                { x: $scope.sensortag.gyroData.timeNum,
                  y: $scope.sensortag.gyroData.xVal});
            $scope.gyroData[1].values.push(
                { x: $scope.sensortag.gyroData.timeNum,
                  y: $scope.sensortag.gyroData.yVal});
            $scope.gyroData[2].values.push(
                { x: $scope.sensortag.gyroData.timeNum,
                  y: $scope.sensortag.gyroData.zVal});
        }
        if ($scope.magnetoData[0].values.length > 100) $scope.magnetoData[0].values.shift();
        if ($scope.magnetoData[1].values.length > 100) $scope.magnetoData[1].values.shift();
        if ($scope.magnetoData[2].values.length > 100) $scope.magnetoData[2].values.shift();

        if(!isNaN($scope.sensortag.magnetoData.timeNum)){
            $scope.magnetoData[0].values.push(
                { x: $scope.sensortag.magnetoData.timeNum,
                  y: $scope.sensortag.magnetoData.xVal});
            $scope.magnetoData[1].values.push(
                { x: $scope.sensortag.magnetoData.timeNum,
                  y: $scope.sensortag.magnetoData.yVal});
            $scope.magnetoData[2].values.push(
                { x: $scope.sensortag.magnetoData.timeNum,
                  y: $scope.sensortag.magnetoData.zVal});
        }
        if ($scope.magnetoData[0].values.length > 100) $scope.magnetoData[0].values.shift();
        if ($scope.magnetoData[1].values.length > 100) $scope.magnetoData[1].values.shift();
        if ($scope.magnetoData[2].values.length > 100) $scope.magnetoData[2].values.shift();

        if(!isNaN($scope.sensortag.baroData.timeNum) && !isNaN($scope.sensortag.baroData.temp)){
            $scope.baroData[0].values.push(
                { x: $scope.sensortag.baroData.timeNum,
                  y: $scope.sensortag.baroData.temp});
        }
        if ($scope.baroData[0].values.length > 100) $scope.baroData[0].values.shift();

        if(!isNaN($scope.sensortag.humidityData.timeNum) && !isNaN($scope.sensortag.humidityData.temp)){
            $scope.humidityData[0].values.push(
                { x: $scope.sensortag.humidityData.timeNum,
                  y: $scope.sensortag.humidityData.temp});
        }
        if ($scope.humidityData[0].values.length > 100) $scope.humidityData[0].values.shift();

        if(!isNaN($scope.sensortag.lightData.timeNum) && !isNaN($scope.sensortag.lightData.temp)){
            $scope.lightData[0].values.push(
                { x: $scope.sensortag.lightData.timeNum,
                  y: $scope.sensortag.lightData.temp});
        }
        if ($scope.lightData[0].values.length > 100) $scope.lightData[0].values.shift();

        x++;
    }, 1000);
    // ---------- Graph Code END -----------
    

    $scope.sensortag.onSuccess = function (message) {
        $mdToast.show(
            $mdToast.simple()
                .content(message)
                .position('top right')
                .hideDelay(2500)
                .theme("success-toast")
        );
    };

    $scope.sensortag.onError = function (message) {
        $mdToast.show(
            $mdToast.simple()
                .content(message)
                .position('top right')
                .hideDelay(2500)
                .theme("error-toast")
        );
    };

    $scope.sensortag.updateUI = function () {
        $scope.$apply();
    };

    $scope.connectClick = function () {
        $scope.sensortag.onSuccess('Connecting ....');
        sensortag.connect().then(function () {
            $scope.sensortag.isConnected = true;
            $scope.sensortag.device._gattIp.ondisconnect = function(peripheral, error){
                if(peripheral)
                    $scope.sensortag.onError(peripheral.name + " disconnected");
                else
                    $scope.sensortag.onError("Device disconnected");
                console.log('disconnected');
            }
            return sensortag.onSuccess('Connected with SensorTag');
        }).catch(function (error) {
            console.error('Argh!', error, error.stack ? error.stack : '');
        });
    }

    if (navigator.bluetooth == undefined) {
        console.log("No navigator.bluetooth found.");
        $scope.sensortag.onError("No navigator.bluetooth found.");
    } else if (navigator.bluetooth.referringDevice) {
        $scope.connectClick();
    }

});
