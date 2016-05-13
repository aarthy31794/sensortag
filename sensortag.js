(function() {
  'use strict';

  var util = new Util();

  var TEMP_SVC  = 'F000AA00-0451-4000-B000-000000000000';
  var TEMP_DATA = 'F000AA01-0451-4000-B000-000000000000';
  var TEMP_CONF = 'F000AA02-0451-4000-B000-000000000000';

  var ACCEL_SVC  = 'F000AA10-0451-4000-B000-000000000000';
  var ACCEL_DATA = 'F000AA11-0451-4000-B000-000000000000';
  var ACCEL_CONF = 'F000AA12-0451-4000-B000-000000000000';

  var HUMD_SVC  = 'F000AA20-0451-4000-B000-000000000000';
  var HUMD_DATA = 'F000AA21-0451-4000-B000-000000000000';
  var HUMD_CONF = 'F000AA22-0451-4000-B000-000000000000';

  var MAGN_SVC  = 'F000AA30-0451-4000-B000-000000000000';
  var MAGN_DATA = 'F000AA31-0451-4000-B000-000000000000';
  var MAGN_CONF = 'F000AA32-0451-4000-B000-000000000000';

  var BARO_SVC    = 'F000AA40-0451-4000-B000-000000000000';
  var BARO_DATA   = 'F000AA41-0451-4000-B000-000000000000';
  var BARO_CONF   = 'F000AA42-0451-4000-B000-000000000000';
  var BARO_CALIB  = 'F000AA43-0451-4000-B000-000000000000';

  var GYRO_SVC  = 'F000AA50-0451-4000-B000-000000000000';
  var GYRO_DATA = 'F000AA51-0451-4000-B000-000000000000';
  var GYRO_CONF = 'F000AA52-0451-4000-B000-000000000000';

  var LIGHT_SVC  = 'F000AA70-0451-4000-B000-000000000000';
  var LIGHT_DATA = 'F000AA71-0451-4000-B000-000000000000';
  var LIGHT_CONF = 'F000AA72-0451-4000-B000-000000000000';

  var MOV_SVC  = 'F000AA80-0451-4000-B000-000000000000';
  var MOV_DATA = 'F000AA81-0451-4000-B000-000000000000';
  var MOV_CONF = 'F000AA82-0451-4000-B000-000000000000';
  
  var INFO_SVC   = 0x180A;
  var FIRMWARE_VERSION    =  0x2A26;

  var genericInfoService;
  var temperatureService;
  var accelerometerService;
  var humidityService;
  var magnetometerService;
  var barometerService;
  var gyroscopeService;
  var lightService;
  var movementService;
  var dt = 0;

  class SensorTag {
    constructor() {
      this.isConnected = false;

      this.sensortag_firmware = null;
      this.ambTemp = null;
      this.objTemp = null;
      this.accelerometer = null;
      this.gyroscope = null;
      this.magnetometer = null;
      this.humidity = null;
      this.barometer = null;
      this.light = null;
      this.sensortag2 = false;

      this.objTempData = [];
      this.ambTempData = [];
      this.accelData = [];
      this.gyroData = [];
      this.magnetoData =[];
      this.baroData = [];
      this.humidityData = [];
      this.lightData = [];
      this.characteristics = new Map();
      
      if(!navigator.bluetooth) {
      	console.error('bluetooth not supported');
      }
    }

    connect() {
      var options = {filters:[{name: 'SensorTag',}]};
      return navigator.bluetooth.requestDevice(options).then(function (device) {
          window.sensortag.device = device;
          return device.connectGATT();
      }).then(function (server) {
          console.log("Discovering services");
          // return server.getPrimaryService(TEMP_SVC);
          return Promise.all(
                [server.getPrimaryService(INFO_SVC).then(function (service) {
                      genericInfoService = service;
                      window.sensortag.sensortag2 = true;
                      return Promise.all([service.getCharacteristic(FIRMWARE_VERSION).then(function (characteristic) {
                          return window.sensortag.readFirmwareVersion(characteristic);
                      })]);
                  }),                
                  server.getPrimaryService(MOV_SVC).then(function (service) {
                      if (service._gattIpService.uuid == MOV_SVC) {
                          movementService = service;
                          window.sensortag.sensortag2 = true;
                          console.log("Sensortag 2.0");
                          console.log("Enabling notifications for Movement");
                          return Promise.all([service.getCharacteristic(MOV_CONF).then(function (characteristic) {
                              return window.sensortag.enableMovementCharac(characteristic);
                          }), service.getCharacteristic(MOV_DATA).then(function (characteristic) {
                              characteristic.addEventListener('characteristicvaluechanged', window.sensortag.onMovementChange);
                              return characteristic.startNotifications();
                          })]);
                      }
                  }),
                  server.getPrimaryService(TEMP_SVC).then(function (service) {
                      if (service._gattIpService.uuid == TEMP_SVC) {
                          temperatureService = service;
                          console.log("Enabling notifications for Temperature");
                          return Promise.all([service.getCharacteristic(TEMP_CONF).then(function (characteristic) {
                              return window.sensortag.enableCharac(characteristic);
                          }), service.getCharacteristic(TEMP_DATA).then(function (characteristic) {
                              characteristic.addEventListener('characteristicvaluechanged', window.sensortag.onTempChange);
                              return characteristic.startNotifications();
                          })]);
                      }
                  }),
                  server.getPrimaryService(ACCEL_SVC).then(function (service) {
                      if (service._gattIpService.uuid == ACCEL_SVC) {
                          accelerometerService = service;
                          window.sensortag.sensortag2 = false;
                          console.log("Enabling notifications for Accelerometer");
                          return Promise.all([service.getCharacteristic(ACCEL_CONF).then(function (characteristic) {
                              return window.sensortag.enableCharac(characteristic);
                          }), service.getCharacteristic(ACCEL_DATA).then(function (characteristic) {
                              characteristic.addEventListener('characteristicvaluechanged', window.sensortag.onAccelerometerChange);
                              return characteristic.startNotifications();
                          })]);
                      }
                  }),
                  server.getPrimaryService(GYRO_SVC).then(function (service) {
                      if (service._gattIpService.uuid == GYRO_SVC) {
                          gyroscopeService = service;
                          console.log("Enabling notifications for Gyroscope");
                          return Promise.all([service.getCharacteristic(GYRO_CONF).then(function (characteristic) {
                              return window.sensortag.enableGyroCharac(characteristic);
                          }), service.getCharacteristic(GYRO_DATA).then(function (characteristic) {
                              characteristic.addEventListener('characteristicvaluechanged', window.sensortag.onGyroscopeChange);
                              return characteristic.startNotifications();
                          })]);
                      }
                  }),
                  server.getPrimaryService(MAGN_SVC).then(function (service) {
                      if (service._gattIpService.uuid == MAGN_SVC) {
                          magnetometerService = service;
                          console.log("Enabling notifications for Magnetometer");
                          return Promise.all([service.getCharacteristic(MAGN_CONF).then(function (characteristic) {
                              return window.sensortag.enableCharac(characteristic);
                          }), service.getCharacteristic(MAGN_DATA).then(function (characteristic) {
                              characteristic.addEventListener('characteristicvaluechanged', window.sensortag.onMagnetometerChange);
                              return characteristic.startNotifications();
                          })]);
                      }
                  }),
                  server.getPrimaryService(HUMD_SVC).then(function (service) {
                      if (service._gattIpService.uuid == HUMD_SVC) {
                          humidityService = service;
                          console.log("Enabling notifications for Humidity");
                          return Promise.all([service.getCharacteristic(HUMD_CONF).then(function (characteristic) {
                              return window.sensortag.enableCharac(characteristic);
                          }), service.getCharacteristic(HUMD_DATA).then(function (characteristic) {
                              characteristic.addEventListener('characteristicvaluechanged', window.sensortag.onHumidityChange);
                              return characteristic.startNotifications();
                          })]);
                      }
                  }),
                  server.getPrimaryService(BARO_SVC).then(function (service) {
                      if (service._gattIpService.uuid == BARO_SVC) {
                          barometerService = service;
                          console.log("Enabling notifications for Barometer");
                          if (window.sensortag.sensortag2 === true) {
                              return Promise.all([service.getCharacteristic(BARO_CONF).then(function (characteristic) {
                                  return window.sensortag.enableCharac(characteristic);
                              }), service.getCharacteristic(BARO_DATA).then(function (characteristic) {
                                  characteristic.addEventListener('characteristicvaluechanged', window.sensortag.onBarometerChange);
                                  return characteristic.startNotifications();
                              })]);
                          } else {
                              return Promise.all([service.getCharacteristic(BARO_CALIB).then(function (characteristic) {
                                  return window.sensortag.calBarameterCalib(characteristic);
                              }), service.getCharacteristic(BARO_CONF).then(function (characteristic) {
                                  return window.sensortag.enableCharac(characteristic);
                              }), service.getCharacteristic(HUMD_DATA).then(function (characteristic) {
                                  characteristic.addEventListener('characteristicvaluechanged', window.sensortag.onHumidityChange);
                                  return characteristic.startNotifications();
                              })]);
                          }
                      }
                  }),
                  server.getPrimaryService(LIGHT_SVC).then(function (service) {
                      if (service._gattIpService.uuid == LIGHT_SVC) {
                          lightService = service;
                          console.log("Enabling notifications for Lightsensor");
                          return Promise.all([service.getCharacteristic(LIGHT_CONF).then(function (characteristic) {
                              return window.sensortag.enableCharac(characteristic);
                          }), service.getCharacteristic(LIGHT_DATA).then(function (characteristic) {
                              characteristic.addEventListener('characteristicvaluechanged', window.sensortag.onLightChange);
                              return characteristic.startNotifications();
                          })]);
                      }
                  })]
            );
      }
      ).then(function () {
          console.log("Sensortag is ready");
      }).catch(window.sensortag.handleError);
    }

    /* Firmware Version read service*/
    readFirmwareVersion(char){
      return char.readValue().then(function (data) {
            var value = '';
            for (var i = 0; i < data.byteLength; i++) {
              value = value + String.fromCharCode(data.getUint8(i));
            };
            value = value.trim();
            sensortag.sensortag_firmware = value;
            return Promise.resolve();
        });
    }

    calBarameterCalib(event) {
      var characteristic = event.target;

      var hex = '';
      for (var i = 0; i < characteristic.value.byteLength; ++i) {
          var hexChar = characteristic.value.getUint8(i).toString(16);
          if (hexChar.length == 1) {
              hexChar = '0' + hexChar;
          }
          hex += hexChar;
      }

      util.calcBarometerCalib(hex);
    }

    /* SensorTag Enable Services */

    enableCharac(char) {
        return char.readValue().then(function (data) {
            var isOn = data.getInt8(0) == 1;
            // console.log("Temperature on = " + isOn);
            if (!isOn) {
                console.log("Turning characteristic reading on");
                return char.writeValue(new Uint8Array([1]));
            } else {
                console.log("Characteristic reading is already on");
                return Promise.resolve();
            }
        });
    }

    enableGyroCharac(char) {
        return char.readValue().then(function (data) {
            console.log("Turning Gyroscope reading on");
            return char.writeValue(new Uint8Array([7]));
        });
    }

    enableMovementCharac(char) {
        return char.readValue().then(function (data) {
            console.log("Turning Movement reading on");
            return char.writeValue(new Uint8Array([127,2]));
        });
    }

    /* Sensor Notification Services*/

    onTempChange(event) {
      var characteristic = event.target;

      var hex = '';
      for (var i = 0; i < characteristic.value.byteLength; ++i) {
          var hexChar = characteristic.value.getUint8(i).toString(16);
          if (hexChar.length == 1) {
              hexChar = '0' + hexChar;
          }
          hex += hexChar;
      }

      var tempAmb = util.calcTAmb(hex);
      if (!isNaN(tempAmb) && tempAmb !== 0) {
          tempAmb = tempAmb.toFixed(2);
          sensortag.ambTemp = tempAmb + '°C';
      }else if (tempAmb === 0){
          sensortag.ambTemp = tempAmb + '°C';
      }

      var tempIr;
      if(sensortag.sensortag2){
        tempIr = util.calcTempIr_st2(hex);
        if (!isNaN(tempIr) && tempIr !== 0 ) {
            tempIr = tempIr.toFixed(2);
            sensortag.objTemp = tempIr + '°C';
        }else if (tempIr === 0){
            sensortag.objTemp = tempIr + '°C';
        }
      }else{
        tempIr = util.calcTempIr(hex);
        if (!isNaN(tempIr) && tempIr !== 0 ) {
            tempIr = tempIr.toFixed(2);
            sensortag.objTemp = tempIr + '°C';
        }else if (tempIr === 0){
            sensortag.objTemp = tempIr + '°C';
        }
      }

      var d = new Date();
      var currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();

      if(!isNaN(Number(tempAmb))){
        sensortag.ambTempData = {
                  timeNum: dt,
                  date: currDate,
                  temp: Number(tempAmb)
              }
      }

      if(!isNaN(Number(tempIr))){
        sensortag.objTempData = {
                  timeNum: dt,
                  date: currDate,
                  temp: Number(tempIr)
              }
      }

      sensortag.updateUI();
    }

    onAccelerometerChange(event) {
      var characteristic = event.target;

      var hex = '';
      for (var i = 0; i < characteristic.value.byteLength; ++i) {
          var hexChar = characteristic.value.getUint8(i).toString(16);
          if (hexChar.length == 1) {
              hexChar = '0' + hexChar;
          }
          hex += hexChar;
      }

      var accelX = util.calcAccXValue(hex);
      var accelY = util.calcAccYValue(hex);
      var accelZ = util.calcAccZValue(hex);

      var d = new Date();
      var currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
      if(!isNaN(accelX) && !isNaN(accelY) && !isNaN(accelZ)){
          sensortag.accelData = {
                  timeNum: dt,
                  date: currDate,
                  xVal: accelX,
                  yVal: accelY,
                  zVal: accelZ
              }
          accelX = 'X: ' + accelX.toFixed(1) + 'G ';
          accelY = 'Y: ' + accelY.toFixed(1) + 'G ';
          accelZ = 'Z: ' + accelZ.toFixed(1) + 'G ';

          var accelVar = accelX + ', ' + accelY + ', ' + accelZ;
          sensortag.accelerometer = accelVar;
      }
      sensortag.updateUI();
    }

    onGyroscopeChange(event) {
      var characteristic = event.target;

      var hex = '';
      for (var i = 0; i < characteristic.value.byteLength; ++i) {
          var hexChar = characteristic.value.getUint8(i).toString(16);
          if (hexChar.length == 1) {
              hexChar = '0' + hexChar;
          }
          hex += hexChar;
      }

      var gyroX = util.calcGyrXValue(hex);
      var gyroY = util.calcGyrYValue(hex);
      var gyroZ = util.calcGyrZValue(hex);

      var d = new Date();
      var currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
      if(!isNaN(gyroX) && !isNaN(gyroY) && !isNaN(gyroZ)){
          sensortag.gyroData = {
                  timeNum: dt,
                  date: currDate,
                  xVal: gyroX,
                  yVal: gyroY,
                  zVal: gyroZ
              }
          gyroX = 'X: ' + gyroX.toFixed(1) + '°/S';
          gyroY = 'Y: ' + gyroY.toFixed(1) + '°/S';
          gyroZ = 'Z: ' + gyroZ.toFixed(1) + '°/S';

          var GyroVal = gyroX + ', ' + gyroY + ', ' + gyroZ;
          sensortag.gyroscope = GyroVal;
      }
      sensortag.updateUI();
    }

    onMagnetometerChange(event) {
      var characteristic = event.target;

      var hex = '';
      for (var i = 0; i < characteristic.value.byteLength; ++i) {
          var hexChar = characteristic.value.getUint8(i).toString(16);
          if (hexChar.length == 1) {
              hexChar = '0' + hexChar;
          }
          hex += hexChar;
      }

      var magX = util.calcMagXValue(hex);
      var magY = util.calcMagYValue(hex);
      var magZ = util.calcMagZValue(hex);
      
      var d = new Date();
      var currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
      if(!isNaN(magX) && !isNaN(magY) && !isNaN(magZ)){
          sensortag.magnetoData = {
                timeNum: dt,
                date: currDate,
                xVal: magX,
                yVal: magY,
                zVal: magZ
            }
          magX = 'X: ' + magX.toFixed(2) + 'uT ';
          magY = 'Y: ' + magY.toFixed(2) + 'uT ';
          magZ = 'Z: ' + magZ.toFixed(2) + 'uT ';

          var magVal = magX + ', ' + magY + ', ' + magZ;
          sensortag.magnetometer = magVal;
      }
      sensortag.updateUI();
    }

    onBarometerChange(event) {
      var characteristic = event.target;

      var hex = '';
      for (var i = 0; i < characteristic.value.byteLength; ++i) {
          var hexChar = characteristic.value.getUint8(i).toString(16);
          if (hexChar.length == 1) {
              hexChar = '0' + hexChar;
          }
          hex += hexChar;
      }

      var pressure;
      if(sensortag.sensortag2){
        pressure = util.calcPressure_st2(hex);
        if(!isNaN(pressure)){
            pressure = pressure.toFixed(1);
        }
      }else{
        pressure = util.calcPressure(hex);
        if(!isNaN(pressure)){
            pressure = pressure.toFixed(1);
        }
      }
      sensortag.barometer = pressure + ' mBar';

      var d = new Date();
      var currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();

      if(!isNaN(Number(pressure))){
        sensortag.baroData = {
                  date: currDate,
                  timeNum: dt,
                  temp: Number(pressure)
              }
      }
      dt++;
      sensortag.updateUI();
    }   

    onHumidityChange(event) {
      var characteristic = event.target;

      var hex = '';
      for (var i = 0; i < characteristic.value.byteLength; ++i) {
          var hexChar = characteristic.value.getUint8(i).toString(16);
          if (hexChar.length == 1) {
              hexChar = '0' + hexChar;
          }
          hex += hexChar;
      }

      var tempHum = util.calcPress(hex);
      if(!isNaN(tempHum)){
          tempHum = tempHum.toFixed(2);
          sensortag.humidity = tempHum  + '%rH';
      }

      var d = new Date();
      var currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();

      if(!isNaN(Number(tempHum))){
        sensortag.humidityData = {
                  timeNum: dt,
                  date: currDate,
                  temp: Number(tempHum)
              }
      }
      sensortag.updateUI();
    }

    onMovementChange(event) {
      var characteristic = event.target;

      var hex = '';
      for (var i = 0; i < characteristic.value.byteLength; ++i) {
          var hexChar = characteristic.value.getUint8(i).toString(16);
          if (hexChar.length == 1) {
              hexChar = '0' + hexChar;
          }
          hex += hexChar;
      }

      var accelX = Number(util.movement_ACC_X(hex));
      var accelY = Number(util.movement_ACC_Y(hex));
      var accelZ = Number(util.movement_ACC_Z(hex));
      var d = new Date();
      var currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
      if(!isNaN(accelX) && !isNaN(accelY) && !isNaN(accelZ)){
          sensortag.accelData = {
                  timeNum: dt,
                  date: currDate,
                  xVal: accelX,
                  yVal: accelY,
                  zVal: accelZ
              }
          accelX = 'X: ' + accelX.toFixed(1) + 'G ';
          accelY = 'Y: ' + accelY.toFixed(1) + 'G ';
          accelZ = 'Z: ' + accelZ.toFixed(1) + 'G ';
          sensortag.accelerometer = accelX + '' + accelY + '' + accelZ;
      } else {
          sensortag.accelerometer = 'X: 0.0G Y: 0.0G Z: 0.0G';
      }

      var gyroX = Number(util.movement_GYRO_X(hex));
      var gyroY = Number(util.movement_GYRO_Y(hex));
      var gyroZ = Number(util.movement_GYRO_Z(hex));
      d = new Date();
      currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
      if(!isNaN(gyroX) && !isNaN(gyroY) && !isNaN(gyroZ)){
          sensortag.gyroData = {
                  timeNum: dt,
                  date: currDate,
                  xVal: gyroX,
                  yVal: gyroY,
                  zVal: gyroZ
              }
          gyroX = 'X: ' + gyroX.toFixed(2) + '°/S ';
          gyroY = 'Y: ' + gyroY.toFixed(2) + '°/S ';
          gyroZ = 'Z: ' + gyroZ.toFixed(2) + '°/S ';
          sensortag.gyroscope = gyroX + gyroY + gyroZ;
      } else {
          sensortag.gyroscope = 'X: 0.0°/S Y: 0.0°/S Z: 0.0°/S';
      }     

      var magX = Number(util.movement_MAG_X(hex));
      var magY = Number(util.movement_MAG_Y(hex));
      var magZ = Number(util.movement_MAG_Z(hex));
      d = new Date();
      currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
      if(!isNaN(magX) && !isNaN(magY) && !isNaN(magZ)){
          sensortag.magnetoData = {
                timeNum: dt,
                date: currDate,
                xVal: magX,
                yVal: magY,
                zVal: magZ
            }
          magX = 'X: ' + magX.toFixed(1) + 'uT ';
          magY = 'Y: ' + magY.toFixed(1) + 'uT ';
          magZ = 'Z: ' + magZ.toFixed(1) + 'uT ';
          sensortag.magnetometer = magX + magY + magZ;
      } else {
          sensortag.magnetometer = 'X: 0.0uT Y: 0.0uT Z: 0.0uT';
      }

      sensortag.updateUI();
    }

    onLightChange(event) {
      var characteristic = event.target;

      var hex = '';
      for (var i = 0; i < characteristic.value.byteLength; ++i) {
          var hexChar = characteristic.value.getUint8(i).toString(16);
          if (hexChar.length == 1) {
              hexChar = '0' + hexChar;
          }
          hex += hexChar;
      }

      var result = util.calLight(hex);
      if(result !== undefined && !isNaN(result)){
          sensortag.light = result + ' Lux';
      }

      var d = new Date();
      var currDate = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();

      if(!isNaN(Number(result))){
        sensortag.lightData = {
                  timeNum: dt,
                  date: currDate,
                  temp: Number(result)
              }
      }

      sensortag.updateUI();
    }


    /* Utils */

    _cacheCharacteristic(service, characteristicUuid) {
      return service.getCharacteristic(characteristicUuid).then(function (characteristic) {
        sensortag.characteristics.set(characteristicUuid, characteristic);
      });
    }

    _readCharacteristicValue(characteristicUuid) {
      var characteristic = this.characteristics.get(characteristicUuid);
      return characteristic.readValue().then(function (value) {
        value = value.buffer ? value : new DataView(value);
        return value;
      });
    }

    _writeCharacteristicValue(characteristicUuid, value) {
      var characteristic = this.characteristics.get(characteristicUuid);
      if (this._debug) {
        console.debug('WRITE', characteristic.uuid, value);
      }
      return characteristic.writeValue(value);
    }


    handleError(err) {
      console.error("Bluetooth Error:", err, err.stack ? err.stack : '');
    }
  }

  window.sensortag = new SensorTag();

})();
