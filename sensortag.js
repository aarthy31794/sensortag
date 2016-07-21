"use strict";

var Sensortag = function () {

    var util = new Util();

    var TEMP_SVC = 'F000AA00-0451-4000-B000-000000000000';
    var TEMP_DATA = 'F000AA01-0451-4000-B000-000000000000';
    var TEMP_CONF = 'F000AA02-0451-4000-B000-000000000000';

    var ACCEL_SVC = 'F000AA10-0451-4000-B000-000000000000';
    var ACCEL_DATA = 'F000AA11-0451-4000-B000-000000000000';
    var ACCEL_CONF = 'F000AA12-0451-4000-B000-000000000000';

    var HUMD_SVC = 'F000AA20-0451-4000-B000-000000000000';
    var HUMD_DATA = 'F000AA21-0451-4000-B000-000000000000';
    var HUMD_CONF = 'F000AA22-0451-4000-B000-000000000000';

    var MAGN_SVC = 'F000AA30-0451-4000-B000-000000000000';
    var MAGN_DATA = 'F000AA31-0451-4000-B000-000000000000';
    var MAGN_CONF = 'F000AA32-0451-4000-B000-000000000000';

    var BARO_SVC = 'F000AA40-0451-4000-B000-000000000000';
    var BARO_DATA = 'F000AA41-0451-4000-B000-000000000000';
    var BARO_CONF = 'F000AA42-0451-4000-B000-000000000000';
    var BARO_CALIB = 'F000AA43-0451-4000-B000-000000000000';

    var GYRO_SVC = 'F000AA50-0451-4000-B000-000000000000';
    var GYRO_DATA = 'F000AA51-0451-4000-B000-000000000000';
    var GYRO_CONF = 'F000AA52-0451-4000-B000-000000000000';

    var LIGHT_SVC = 'F000AA70-0451-4000-B000-000000000000';
    var LIGHT_DATA = 'F000AA71-0451-4000-B000-000000000000';
    var LIGHT_CONF = 'F000AA72-0451-4000-B000-000000000000';

    var MOV_SVC = 'F000AA80-0451-4000-B000-000000000000';
    var MOV_DATA = 'F000AA81-0451-4000-B000-000000000000';
    var MOV_CONF = 'F000AA82-0451-4000-B000-000000000000';

    var INFO_SVC = 0x180A;
    var FIRMWARE_VERSION = 0x2A26;

    function Sensortag(bluetooth) {
        this.connected = false;

        this.genericInfoService = undefined;
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

        var options = {filters: [{name: 'SensorTag'}]};

        return this.bluetooth.requestDevice(options)
            .then(function (device) {
                return device.gatt.connect();
            })
            .then(function (server) {
                return Promise.all(
                    [server.getPrimaryService(INFO_SVC).then(function (service) {
                        self.genericInfoService = service;
                        self.sensortag2 = true;
                        self.connected = true;
                        return Promise.all([service.getCharacteristic(FIRMWARE_VERSION).then(function (characteristic) {
                            return self.readFirmwareVersion(characteristic);
                        })]);
                    }, function (error) {
                        console.warn('Info Service not found');
                        Promise.resolve(true);
                    }),
                        server.getPrimaryService(MOV_SVC).then(function (service) {
                            if (service._gattIpService.uuid == MOV_SVC) {
                                self.movementService = service;
                                self.sensortag2 = true;
                                console.log("Sensortag 2.0");
                                console.log("Enabling notifications for Movement");
                                return Promise.all([service.getCharacteristic(MOV_CONF).then(function (characteristic) {
                                    return self.enableMovementCharac(characteristic);
                                }), service.getCharacteristic(MOV_DATA).then(function (characteristic) {
                                    characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                        //todo: generate event
                                        if (self.updateUI) {
                                            self.updateUI(event, 'movement');
                                        }
                                    });
                                    return characteristic.startNotifications();
                                })]);
                            }
                        }, function (error) {
                            console.warn('MovementService Service not found');
                            Promise.resolve(true);
                        }),
                        server.getPrimaryService(TEMP_SVC).then(function (service) {
                            if (service._gattIpService.uuid == TEMP_SVC) {
                                self.temperatureService = service;
                                console.log("Enabling notifications for Temperature");
                                return Promise.all([service.getCharacteristic(TEMP_CONF).then(function (characteristic) {
                                    return self.enableCharac(characteristic);
                                }), service.getCharacteristic(TEMP_DATA).then(function (characteristic) {
                                    characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                        //todo: generate event
                                        if (self.updateUI) {
                                            self.updateUI(event, 'temperature');
                                        }
                                    });
                                    return characteristic.startNotifications();
                                })]);
                            }
                        }, function (error) {
                            console.warn('Temperature Service not found');
                            Promise.resolve(true);
                        }),
                        server.getPrimaryService(ACCEL_SVC).then(function (service) {
                            if (service._gattIpService.uuid == ACCEL_SVC) {
                                self.accelerometerService = service;
                                self.sensortag2 = false;
                                console.log("Enabling notifications for Accelerometer");
                                return Promise.all([service.getCharacteristic(ACCEL_CONF).then(function (characteristic) {
                                    return self.enableCharac(characteristic);
                                }), service.getCharacteristic(ACCEL_DATA).then(function (characteristic) {
                                    characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                        //todo: generate event
                                        if (self.updateUI) {
                                            self.updateUI(event, 'accelerometer');
                                        }
                                    });
                                    return characteristic.startNotifications();
                                })]);
                            }
                        }, function (error) {
                            console.warn('Accelerometer Service not found');
                            Promise.resolve(true);
                        }),
                        server.getPrimaryService(GYRO_SVC).then(function (service) {
                            if (service._gattIpService.uuid == GYRO_SVC) {
                                self.gyroscopeService = service;
                                console.log("Enabling notifications for Gyroscope");
                                return Promise.all([service.getCharacteristic(GYRO_CONF).then(function (characteristic) {
                                    return self.enableGyroCharac(characteristic);
                                }), service.getCharacteristic(GYRO_DATA).then(function (characteristic) {
                                    characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                        //todo: generate event
                                        if (self.updateUI) {
                                            self.updateUI(event, 'gyroscope');
                                        }
                                    });
                                    return characteristic.startNotifications();
                                })]);
                            }
                        }, function (error) {
                            console.warn('Gyroscope Service not found');
                            Promise.resolve(true);
                        }),
                        server.getPrimaryService(MAGN_SVC).then(function (service) {
                            if (service._gattIpService.uuid == MAGN_SVC) {
                                self.magnetometerService = service;
                                console.log("Enabling notifications for Magnetometer");
                                return Promise.all([service.getCharacteristic(MAGN_CONF).then(function (characteristic) {
                                    return self.enableCharac(characteristic);
                                }), service.getCharacteristic(MAGN_DATA).then(function (characteristic) {
                                    characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                        //todo: generate event
                                        if (self.updateUI) {
                                            self.updateUI(event, 'magnetometer');
                                        }
                                    });
                                    return characteristic.startNotifications();
                                })]);
                            }
                        }, function (error) {
                            console.warn('Magnetometer Service not found');
                            Promise.resolve(true);
                        }),
                        server.getPrimaryService(HUMD_SVC).then(function (service) {
                            if (service._gattIpService.uuid == HUMD_SVC) {
                                self.humidityService = service;
                                console.log("Enabling notifications for Humidity");
                                return Promise.all([service.getCharacteristic(HUMD_CONF).then(function (characteristic) {
                                    return self.enableCharac(characteristic);
                                }), service.getCharacteristic(HUMD_DATA).then(function (characteristic) {
                                    characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                        //todo: generate event
                                        if (self.updateUI) {
                                            self.updateUI(event, 'humidity');
                                        }
                                    });
                                    return characteristic.startNotifications();
                                })]);
                            }
                        }, function (error) {
                            console.warn('Humidity Service not found');
                            Promise.resolve(true);
                        }),
                        server.getPrimaryService(BARO_SVC).then(function (service) {
                            if (service._gattIpService.uuid == BARO_SVC) {
                                self.barometerService = service;
                                console.log("Enabling notifications for Barometer");
                                if (self.sensortag2 === true) {
                                    return Promise.all([service.getCharacteristic(BARO_CONF).then(function (characteristic) {
                                        return self.enableCharac(characteristic);
                                    }), service.getCharacteristic(BARO_DATA).then(function (characteristic) {
                                        characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                            //todo: generate event
                                            if (self.updateUI) {
                                                self.updateUI(event, 'barometer');
                                            }
                                        });
                                        return characteristic.startNotifications();
                                    })]);
                                } else {
                                    return Promise.all([service.getCharacteristic(BARO_CALIB).then(function (characteristic) {
                                        return self.calBarameterCalib(characteristic);
                                    }), service.getCharacteristic(BARO_CONF).then(function (characteristic) {
                                        return self.enableCharac(characteristic);
                                    }), service.getCharacteristic(HUMD_DATA).then(function (characteristic) {
                                        characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                            //todo: generate event
                                            if (self.updateUI) {
                                                self.updateUI(event, 'movement');
                                            }
                                        });
                                        return characteristic.startNotifications();
                                    })]);
                                }
                            }
                        }, function (error) {
                            console.warn('Barometer Service not found');
                            Promise.resolve(true);
                        }),
                        server.getPrimaryService(LIGHT_SVC).then(function (service) {
                            if (service._gattIpService.uuid == LIGHT_SVC) {
                                self.lightService = service;
                                console.log("Enabling notifications for Lightsensor");
                                return Promise.all([service.getCharacteristic(LIGHT_CONF).then(function (characteristic) {
                                    return self.enableCharac(characteristic);
                                }), service.getCharacteristic(LIGHT_DATA).then(function (characteristic) {
                                    characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                        //todo: generate event
                                        if (self.updateUI) {
                                            self.updateUI(event, 'light');
                                        }
                                    });
                                    return characteristic.startNotifications();
                                })]);
                            }
                        }, function (error) {
                            console.warn('LightSensor Service not found');
                            Promise.resolve(true);
                        })
                    ]
                );
            })
            .then(function () {
                self.connected = true;
            });
    }

    /* Firmware Version read service*/
    Sensortag.prototype.readFirmwareVersion = function readFirmwareVersion(char) {
        return char.readValue().then(function (data) {
            var value = '';
            for (var i = 0; i < data.byteLength; i++) {
                value = value + String.fromCharCode(data.getUint8(i));
            }
            ;
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

            util.calcBarometerCalib(hex);
        });
    }

    /* SensorTag Enable Services */
    Sensortag.prototype.enableCharac = function enableCharac(event) {
        return event.readValue().then(function (data) {
            var isOn = data.getInt8(0) == 1;
            // console.log("Temperature on = " + isOn);
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

    /* Utils */
    Sensortag.prototype.cacheCharacteristic = function cacheCharacteristic(service, characteristicUuid) {
        return service.getCharacteristic(characteristicUuid).then(function (characteristic) {
            sensortag.characteristics.set(characteristicUuid, characteristic);
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