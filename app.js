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
    $scope.graph = "Line Chart";

    // ---------- Line Graph Code START -----------
    $scope.lineGraphoptions = {
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
                axisLabel:'Time',
                tickFormat: function(d){
                    if($scope.baroData[0].values[d]){
                    var label = $scope.baroData[0].values[d].label;
                        return label;
                    }
                }
            }
        }
    };

    $scope.amdTempOptions = angular.copy($scope.lineGraphoptions);
    $scope.objTempOptions = angular.copy($scope.lineGraphoptions);
    $scope.accelOptions = angular.copy($scope.lineGraphoptions);
    $scope.gyroOptions = angular.copy($scope.lineGraphoptions);
    $scope.magnetoOptions = angular.copy($scope.lineGraphoptions);
    $scope.baroOptions = angular.copy($scope.lineGraphoptions);
    $scope.humidityOptions = angular.copy($scope.lineGraphoptions);
    $scope.lightOptions = angular.copy($scope.lineGraphoptions);

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
                  y: $scope.sensortag.ambTempData.temp,
                  label: $scope.sensortag.ambTempData.date});
        }
        if ($scope.amdTempData[0].values.length > 100) $scope.amdTempData[0].values.shift();

        if(!isNaN($scope.sensortag.objTempData.timeNum) && !isNaN($scope.sensortag.objTempData.temp))
        $scope.objTempdata[0].values.push(
            { x: $scope.sensortag.objTempData.timeNum,
              y: $scope.sensortag.objTempData.temp,
              label: $scope.sensortag.objTempData.date});
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
                  y: $scope.sensortag.baroData.temp,
                  label: $scope.sensortag.baroData.date});
        }
        if ($scope.baroData[0].values.length > 100) $scope.baroData[0].values.shift();

        if(!isNaN($scope.sensortag.humidityData.timeNum) && !isNaN($scope.sensortag.humidityData.temp)){
            $scope.humidityData[0].values.push(
                { x: $scope.sensortag.humidityData.timeNum,
                  y: $scope.sensortag.humidityData.temp,
                  label: $scope.sensortag.humidityData.date});
        }
        if ($scope.humidityData[0].values.length > 100) $scope.humidityData[0].values.shift();

        if(!isNaN($scope.sensortag.lightData.timeNum) && !isNaN($scope.sensortag.lightData.temp)){
            $scope.lightData[0].values.push(
                { x: $scope.sensortag.lightData.timeNum,
                  y: $scope.sensortag.lightData.temp,
                  label: $scope.sensortag.lightData.date});
        }
        if ($scope.lightData[0].values.length > 100) $scope.lightData[0].values.shift();

        x++;
    }, 1000);
    // ---------- Line Graph Code END -----------

    // ---------- Pie Chart Code Start ----------
    $scope.pieOptions = {
            chart: {
                type: 'pieChart',
                height: 300,
                donut: true,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,

                pie: {
                    startAngle: function(d) { return d.startAngle/2 - Math.PI/2 },
                    endAngle: function(d) { return d.endAngle/2 - Math.PI/2 }
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
        setInterval(function(){
            if(!isNaN($scope.sensortag.ambTempData.temp))
            $scope.pieAmbTempData = [{
                                        key: "Ambient Temperature",
                                        y: $scope.sensortag.ambTempData.temp
                                    },
                                    {
                                        key: "",
                                        y: 100
                                    }];
            if(!isNaN($scope.sensortag.objTempData.temp))
            $scope.pieObjTempData = [{
                                        key: "Object Temperature",
                                        y: $scope.sensortag.objTempData.temp
                                    },
                                    {
                                        key: "",
                                        y: 100
                                    }];
            if(!isNaN($scope.sensortag.baroData.temp))
            $scope.pieBarometerData = [{
                                        key: "Barometer",
                                        y: $scope.sensortag.baroData.temp
                                    },
                                    {
                                        key: "",
                                        y: 1500
                                    }];
            if(!isNaN($scope.sensortag.humidityData.temp))
            $scope.pieHumidityData = [{
                                        key: "Humidity",
                                        y: $scope.sensortag.humidityData.temp
                                    },
                                    {
                                        key: "",
                                        y: 100
                                    }];
            if(!isNaN($scope.sensortag.lightData.temp))
            $scope.pieLightData = [{
                                        key: "Light",
                                        y: $scope.sensortag.lightData.temp
                                    },
                                    {
                                        key: "",
                                        y: 1000
                                    }];
            $scope.$apply();
        }, 500);
    // ---------- Pie Chart Code End ------------
    

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

    // HACK : To update the PieChart UI when user selects the PieChrat option
    $scope.graphChange = function(){
        if($scope.graph === 'Pie Chart'){
            $scope.sensortag.ambTempData.temp = $scope.sensortag.ambTempData.temp + 1;
            $scope.sensortag.objTempData.temp = $scope.sensortag.objTempData.temp + 1;
            $scope.sensortag.baroData.temp = $scope.sensortag.baroData.temp + 1;
            $scope.sensortag.humidityData.temp = $scope.sensortag.humidityData.temp + 1;
            $scope.sensortag.lightData.temp = $scope.sensortag.lightData.temp + 1;
        }
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
