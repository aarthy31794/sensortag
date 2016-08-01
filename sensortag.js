"use strict";

var Sensortag = function () {

    var TEMP_SVC = 'f000aa00-0451-4000-b000-000000000000';
    var TEMP_DATA = 'f000aa01-0451-4000-b000-000000000000';
    var TEMP_CONF = 'f000aa02-0451-4000-b000-000000000000';

    var ACCEL_SVC = 'f000aa10-0451-4000-b000-000000000000';
    var ACCEL_DATA = 'f000aa11-0451-4000-b000-000000000000';
    var ACCEL_CONF = 'f000aa12-0451-4000-b000-000000000000';

    var HUMD_SVC = 'f000aa20-0451-4000-b000-000000000000';
    var HUMD_DATA = 'f000aa21-0451-4000-b000-000000000000';
    var HUMD_CONF = 'f000aa22-0451-4000-b000-000000000000';

    var MAGN_SVC = 'f000aa30-0451-4000-b000-000000000000';
    var MAGN_DATA = 'f000aa31-0451-4000-b000-000000000000';
    var MAGN_CONF = 'f000aa32-0451-4000-b000-000000000000';

    var BARO_SVC = 'f000aa40-0451-4000-b000-000000000000';
    var BARO_DATA = 'f000aa41-0451-4000-b000-000000000000';
    var BARO_CONF = 'f000aa42-0451-4000-b000-000000000000';
    var BARO_CALIB = 'f000aa43-0451-4000-b000-000000000000';

    var GYRO_SVC = 'f000aa50-0451-4000-b000-000000000000';
    var GYRO_DATA = 'f000aa51-0451-4000-b000-000000000000';
    var GYRO_CONF = 'f000aa52-0451-4000-b000-000000000000';

    var LIGHT_SVC = 'f000aa70-0451-4000-b000-000000000000';
    var LIGHT_DATA = 'f000aa71-0451-4000-b000-000000000000';
    var LIGHT_CONF = 'f000aa72-0451-4000-b000-000000000000';

    var MOV_SVC = 'f000aa80-0451-4000-b000-000000000000';
    var MOV_DATA = 'f000aa81-0451-4000-b000-000000000000';
    var MOV_CONF = 'f000aa82-0451-4000-b000-000000000000';

    var INFO_SVC = 0x180a;
    var FIRMWARE_VERSION = 0x2a26;

    function Sensortag(bluetooth) {
        this.connected = false;

        this.temperatureService = undefined;
        this.accelerometerService = undefined;
        this.humidityService = undefined;
        this.magnetometerService = undefined;
        this.barometerService = undefined;
        this.gyroscopeService = undefined;
        this.lightService = undefined;
        this.movementService = undefined;

        this.sensortag2 = false;
        this.sensortag_firmware = undefined;

        this.characteristics = new Map();
        this.bluetooth = bluetooth;
    }

    Sensortag.prototype.connect = function connect() {

        var self = this;

        var options = {
            filters: [{services: [0xaa80]}],
            optionalServices: [INFO_SVC, MOV_SVC, TEMP_SVC, HUMD_SVC, BARO_SVC, LIGHT_SVC, ACCEL_SVC, MAGN_SVC, GYRO_SVC]
        };

        return this.bluetooth.requestDevice(options)
            .then(function (device) {
                return device.gatt.connect();
            })
            .then(function (server) {
                return Promise.all([
                    server.getPrimaryService(INFO_SVC)
                        .then(function (service) {
                            self.connected = true;
                            return service.getCharacteristic(FIRMWARE_VERSION)
                                .then(function (characteristic) {
                                    return self.readFirmwareVersion(characteristic);
                                });
                        }, function (error) {
                            console.warn('Info Service not found');
                            Promise.resolve(true);
                        }),
                    server.getPrimaryService(MOV_SVC)
                        .then(function (service) {
                            self.movementService = service;
                            self.sensortag2 = true;
                            console.log("Sensortag 2.0");
                            console.log("Enabling notifications for Movement");
                            return service.getCharacteristic(MOV_CONF)
                                .then(function (characteristic) {
                                    return self.enableMovementCharac(characteristic)
                                        .then(function () {
                                            return service.getCharacteristic(MOV_DATA)
                                                .then(function (characteristic) {
                                                    return characteristic.startNotifications()
                                                        .then(function () {
                                                            characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                                if (self.updateUI) {
                                                                    self.updateUI(event, 'movement');
                                                                }
                                                            });
                                                        });
                                                })
                                        });
                                });
                        }, function (error) {
                            console.warn('MovementService Service not found');
                            Promise.resolve(true);
                        }),
                    server.getPrimaryService(TEMP_SVC)
                        .then(function (service) {
                            self.temperatureService = service;
                            console.log("Enabling notifications for Temperature");
                            return service.getCharacteristic(TEMP_CONF)
                                .then(function (characteristic) {
                                    return self.enableCharac(characteristic)
                                        .then(function () {
                                            return service.getCharacteristic(TEMP_DATA)
                                                .then(function (characteristic) {
                                                    return characteristic.startNotifications()
                                                        .then(function () {
                                                            return characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                                if (self.updateUI) {
                                                                    self.updateUI(event, 'temperature');
                                                                }
                                                            });
                                                        });
                                                })
                                        });
                                });
                        }, function (error) {
                            console.warn('Temperature Service not found');
                            Promise.resolve(true);
                        }),
                    server.getPrimaryService(ACCEL_SVC)
                        .then(function (service) {
                            self.accelerometerService = service;
                            self.sensortag2 = false;
                            console.log("Enabling notifications for Accelerometer");
                            return service.getCharacteristic(ACCEL_CONF)
                                .then(function (characteristic) {
                                    return self.enableCharac(characteristic)
                                        .then(function () {
                                            return service.getCharacteristic(ACCEL_DATA)
                                                .then(function (characteristic) {
                                                    return characteristic.startNotifications()
                                                        .then(function () {
                                                            return characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                                if (self.updateUI) {
                                                                    self.updateUI(event, 'accelerometer');
                                                                }
                                                            });
                                                        });
                                                })
                                        });
                                });

                        }, function (error) {
                            console.warn('Accelerometer Service not found');
                            Promise.resolve(true);
                        }),
                    server.getPrimaryService(GYRO_SVC)
                        .then(function (service) {
                            self.gyroscopeService = service;
                            console.log("Enabling notifications for Gyroscope");
                            return service.getCharacteristic(GYRO_CONF)
                                .then(function (characteristic) {
                                    return self.enableGyroCharac(characteristic)
                                        .then(function () {
                                            return service.getCharacteristic(GYRO_DATA)
                                                .then(function (characteristic) {
                                                    return characteristic.startNotifications()
                                                        .then(function () {
                                                            return characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                                if (self.updateUI) {
                                                                    self.updateUI(event, 'gyroscope');
                                                                }
                                                            });
                                                        });
                                                })
                                        });
                                });
                        }, function (error) {
                            console.warn('Gyroscope Service not found');
                            Promise.resolve(true);
                        }),
                    server.getPrimaryService(MAGN_SVC)
                        .then(function (service) {
                            self.magnetometerService = service;
                            console.log("Enabling notifications for Magnetometer");
                            return service.getCharacteristic(MAGN_CONF)
                                .then(function (characteristic) {
                                    return self.enableCharac(characteristic)
                                        .then(function () {
                                            return service.getCharacteristic(MAGN_DATA)
                                                .then(function (characteristic) {
                                                    return characteristic.startNotifications()
                                                        .then(function () {
                                                            return characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                                if (self.updateUI) {
                                                                    self.updateUI(event, 'magnetometer');
                                                                }
                                                            });
                                                        });
                                                })
                                        });
                                });
                        }, function (error) {
                            console.warn('Magnetometer Service not found');
                            Promise.resolve(true);
                        }),
                    server.getPrimaryService(HUMD_SVC)
                        .then(function (service) {
                            self.humidityService = service;
                            console.log("Enabling notifications for Humidity");
                            return service.getCharacteristic(HUMD_CONF)
                                .then(function (characteristic) {
                                    return self.enableCharac(characteristic)
                                        .then(function () {
                                            return service.getCharacteristic(HUMD_DATA)
                                                .then(function (characteristic) {
                                                    return characteristic.startNotifications()
                                                        .then(function () {
                                                            return characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                                if (self.updateUI) {
                                                                    self.updateUI(event, 'humidity');
                                                                }
                                                            });
                                                        });
                                                })
                                        });
                                });
                        }, function (error) {
                            console.warn('Humidity Service not found');
                            Promise.resolve(true);
                        }),
                    server.getPrimaryService(BARO_SVC)
                        .then(function (service) {
                            self.barometerService = service;
                            console.log("Enabling notifications for Barometer");
                            if (self.sensortag2 === true) {
                                return service.getCharacteristic(BARO_CONF)
                                    .then(function (characteristic) {
                                        return self.enableCharac(characteristic)
                                            .then(function () {
                                                return service.getCharacteristic(BARO_DATA)
                                                    .then(function (characteristic) {
                                                        return characteristic.startNotifications()
                                                            .then(function () {
                                                                return characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                                    if (self.updateUI) {
                                                                        self.updateUI(event, 'barometer');
                                                                    }
                                                                });
                                                            });
                                                    })
                                            });
                                    });
                            } else {
                                return service.getCharacteristic(BARO_CALIB) // Need this one for sensortag 1.0
                                    .then(function (characteristic) {
                                        return self.calBarameterCalib(characteristic)
                                            .then(function () {
                                                return service.getCharacteristic(BARO_CONF)
                                                    .then(function (characteristic) {
                                                        return self.enableCharac(characteristic)
                                                            .then(function () {
                                                                return service.getCharacteristic(HUMD_DATA)
                                                                    .then(function (characteristic) {
                                                                        return characteristic.startNotifications()
                                                                            .then(function () {
                                                                                return characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                                                    if (self.updateUI) {
                                                                                        self.updateUI(event, 'movement');
                                                                                    }
                                                                                });
                                                                            });
                                                                    });
                                                            });
                                                    });
                                            });
                                    });
                            }
                        }, function (error) {
                            console.warn('Barometer Service not found');
                            Promise.resolve(true);
                        }),
                    server.getPrimaryService(LIGHT_SVC)
                        .then(function (service) {
                            self.lightService = service;
                            console.log("Enabling notifications for Lightsensor");
                            return service.getCharacteristic(LIGHT_CONF)
                                .then(function (characteristic) {
                                    return self.enableCharac(characteristic)
                                        .then(function () {
                                            return service.getCharacteristic(LIGHT_DATA)
                                                .then(function (characteristic) {
                                                    return characteristic.startNotifications()
                                                        .then(function () {
                                                            return characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                                if (self.updateUI) {
                                                                    self.updateUI(event, 'light');
                                                                }
                                                            });

                                                        });
                                                });
                                        });
                                });
                        }, function (error) {
                            console.warn('LightSensor Service not found');
                            Promise.resolve(true);
                        })
                ]);
            })
            .then(function () {
                self.connected = true;
            });
    }

    /* Firmware Version read service*/
    Sensortag.prototype.readFirmwareVersion = function readFirmwareVersion(char) {
        return char.readValue()
            .then(function (data) {
                var value = '';
                for (var i = 0; i < data.byteLength; i++) {
                    value = value + String.fromCharCode(data.getUint8(i));
                }
                value = value.trim();
                Sensortag.sensortag_firmware = value;
                return Promise.resolve();
            });
    }

    Sensortag.prototype.calBarameterCalib = function calBarameterCalib(event) {
        return event.readValue().then(function (data) {
            var hex = '';
            for (var i = 0; i < data.byteLength; ++i) {
                var hexChar = data.getUint8(i).toString(16);
                if (hexChar.length == 1) {
                    hexChar = '0' + hexChar;
                }
                hex += hexChar;
            }

            //Todo: util.calcBarometerCalib(hex);
        });
    }

    Sensortag.prototype.enableCharac = function enableCharac(event) {
        return event.readValue().then(function (data) {
            var isOn = data.getInt8(0) == 1;
            if (!isOn) {
                console.log("Turning characteristic reading on");
                return event.writeValue(new Uint8Array([1]));
            } else {
                console.log("Characteristic reading is already on");
                return Promise.resolve();
            }
        });
    }

    Sensortag.prototype.enableGyroCharac = function enableGyroCharac(event) {
        return event.readValue().then(function (data) {
            console.log("Turning Gyroscope reading on");
            return event.writeValue(new Uint8Array([7]));
        });
    }

    Sensortag.prototype.enableMovementCharac = function enableMovementCharac(event) {
        return event.readValue().then(function (data) {
            console.log("Turning Movement reading on");
            return event.writeValue(new Uint8Array([127, 2]));
        });
    }

    Sensortag.prototype.readCharacteristicValue = function readCharacteristicValue(characteristicUuid) {
        var characteristic = this.characteristics.get(characteristicUuid);
        return characteristic.readValue().then(function (value) {
            value = value.buffer ? value : new DataView(value);
            return value;
        });
    }

    Sensortag.prototype.writeCharacteristicValue = function writeCharacteristicValue(characteristicUuid, value) {
        var characteristic = this.characteristics.get(characteristicUuid);
        if (this._debug) {
            console.debug('WRITE', characteristic.uuid, value);
        }
        return characteristic.writeValue(value);
    }

    return Sensortag;

}();

if (window === undefined) {
    module.exports.Sensortag = Sensortag;
}