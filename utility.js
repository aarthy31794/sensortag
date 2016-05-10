function Util()
{
    this.stringToDecArray = function(str){
        var dec, i;
        var dec_arr = [];
        if(str){
            for (i=0; i<str.length; i++) {
                dec = str.charCodeAt(i).toString(10);
                dec_arr.push(Number(dec));
            }
        }
        return dec_arr;
    };

    this.convSignDecimal = function(value) {
        if (value >= 50000) {
            var dec2bin = value.toString(2);
            var signDec = 0;
            var i = 0;
            var CurrentValue = dec2bin;
            var inputlength = CurrentValue.length;
            for (i = inputlength - 1; i >= 1; i -= 1) {
                signDec += eval(CurrentValue.charAt(i)) * Math.pow(2, inputlength - i - 1);
            } //add all bits except sign

            signDec = signDec - eval(CurrentValue.charAt(0)) * Math.pow(2, inputlength - 1);
            return signDec;
        } else {
            return value;
        }
    };

    this.convSignAcc = function(value) {
        if (value >= 200) {
            var dec2bin = value.toString(2);
            var signDec = 0;
            var i = 0;
            var CurrentValue = dec2bin;
            var inputlength = CurrentValue.length;
            for (i = inputlength - 1; i >= 1; i -= 1) {
                signDec += eval(CurrentValue.charAt(i)) * Math.pow(2, inputlength - i - 1);
            } //add all bits except sign

            signDec = signDec - eval(CurrentValue.charAt(0)) * Math.pow(2, inputlength - 1);
            return signDec;
        }
        return value;

    };

    this.calcTAmb = function(data) {
        if (data && data.length < 4) {
            return -0.0;
        }
        if (data && data.length === 8) {
            var data3 = '0x' + data[6] + '' + data[7] + '' + data[4] + '' + data[5];
            var ambTemp = parseInt(data3, 16);

            return ambTemp / 128;
        }
    };

    this.calcTempIr = function(data) {
        var objTemp;
        var ambTemp;

        if (data && data.length < 4) {
            return -0.0;
        }
        if (data && data.length === 8) {
            var data1 = '0x' + data[2] + '' + data[3] + '' + data[0] + '' + data[1];
            var data3 = '0x' + data[6] + '' + data[7] + '' + data[4] + '' + data[5];
            objTemp = this.convSignDecimal(parseInt(data1, 16));

            ambTemp = parseInt(data3, 16);

            var temp = (ambTemp / 128);
            var Vobj2 = objTemp * 0.00000015625;
            var Tdie2 = temp + 273.15;
            var S0 = 6.4 * (Math.pow(10, -14));
            var a1 = 1.75 * (Math.pow(10, -3));
            var a2 = -1.678 * (Math.pow(10, -5));
            var b0 = -2.94 * (Math.pow(10, -5));
            var b1 = -5.7 * (Math.pow(10, -7));
            var b2 = 4.63 * (Math.pow(10, -9));
            var c2 = 13.4;
            var Tref = 298.15;
            var S = S0 * (1 + a1 * (Tdie2 - Tref) + a2 * Math.pow((Tdie2 - Tref), 2));
            var Vos = b0 + b1 * (Tdie2 - Tref) + b2 * Math.pow((Tdie2 - Tref), 2);
            var fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos), 2);
            var Tobj = Math.pow(Math.pow(Tdie2, 4) + (fObj / S), 0.25);
            Tobj = (Tobj - 273.15);


            return Tobj;
        }
    };

    this.calcTempIr_st2 = function(data) {
        var objTemp;

        if (data && data.length < 4) {
            return -0.0;
        }

        if (data && data.length === 8) {
            var data1 = '0x' + data[2] + '' + data[3] + '' + data[0] + '' + data[1];
            objTemp = this.convSignDecimal(parseInt(data1, 16));

            objTemp = parseInt(data1, 16);
            return objTemp / 128;

        }
    };

    this.calcAccXValue = function(data) {
        var data1 = '0x' + data[0] + '' + data[1];
        var temp = this.convSignAcc(parseInt(data1, 16));

        var x;
        var SCALE;
        if (data1 && data1.indexOf('undefined') === -1) {
            if (sensortag.sensortag_firmware) {
                if (sensortag.sensortag_firmware.indexOf('1.5') === -1) {
                    // Range 2G
                    SCALE = 16.0;
                    x = temp / SCALE;
                } else {
                    // Range 8G
                    SCALE = 64.0;
                    x = temp / SCALE;
                }
            } else {
                // Range 2G
                SCALE = 16.0;
                x = temp / SCALE;
            }
        }

        return x;
    };

    this.calcAccYValue = function(data) {
        var data1 = '0x' + data[2] + '' + data[3];
        var temp = this.convSignAcc(parseInt(data1, 16));

        var y;
        var SCALE;
        if (data1 && data1.indexOf('undefined') === -1) {
            if (sensortag.sensortag_firmware) {
                if (sensortag.sensortag_firmware.indexOf('1.5') === -1) {
                    // Range 2G
                    SCALE = 16.0;
                    y = temp / SCALE;
                } else {
                    // Range 8G
                    SCALE = 64.0;
                    y = temp / SCALE;
                }
            } else {
                // Range 2G
                SCALE = 16.0;
                y = temp / SCALE;
            }
        }

        return y;
    };

    this.calcAccZValue = function(data) {
        var data1 = '0x' + data[4] + '' + data[5];
        var temp = this.convSignAcc(parseInt(data1, 16));

        var z;
        var SCALE;
        if (data1 && data1.indexOf('undefined') === -1) {
            if (sensortag.sensortag_firmware) {
                temp = temp * -1;
                if (sensortag.sensortag_firmware.indexOf('1.5') === -1) {
                    // Range 2G
                    SCALE = 16.0;
                    z = temp / SCALE;
                } else {
                    // Range 8G
                    SCALE = 64.0;
                    z = temp / SCALE;
                }
            } else {
                // Range 2G
                SCALE = 16.0;
                z = temp / SCALE;
            }
        }

        return z;
    };

    this.calcGyrXValue = function(data) {
        var data1 = '0x' + data[6] + '' + data[7] + '' + data[4] + '' + data[5];
        var rawX = this.convSignDecimal(parseInt(data1, 16));
        rawX = rawX * (500 / 65536) * -1;

        return rawX;
    };

    this.calcGyrYValue = function(data) {
        var data1 = '0x' + data[2] + '' + data[3] + '' + data[0] + '' + data[1];
        var rawY = this.convSignDecimal(parseInt(data1, 16));
        rawY = rawY * (500 / 65536) * -1;

        return rawY;
    };

    this.calcGyrZValue = function(data) {
        var data1 = '0x' + data[10] + '' + data[11] + '' + data[8] + '' + data[9];
        var rawZ = this.convSignDecimal(parseInt(data1, 16));
        rawZ = rawZ * (500 / 65536);

        return rawZ;
    };

    this.calcMagXValue = function(data) {
        var calX = 0;
        var lastX;
        if (data && data.length < 6) {
            return -0.0;
        }
        //Orientation of sensor on board means we need to swap X (multiplying with -1)
        if (data && data.length === 12) {
            var data1 = '0x' + data[2] + '' + data[3] + '' + data[0] + '' + data[1];
            var rawX = this.convSignDecimal(parseInt(data1, 16));
            lastX = ((rawX * 1.0) / (65536 / 2000.0)) * -1;
            return (lastX - calX);
        }
    };

    this.calcMagYValue = function(data) {
        var calY = 0;
        var lastY;
        if (data && data.length < 6) {
            return -0.0;
        }
        //Orientation of sensor on board means we need to swap Y (multiplying with -1)
        if (data && data.length === 12) {
            var data2 = '0x' + data[6] + '' + data[7] + '' + data[4] + '' + data[5];
            var rawY = this.convSignDecimal(parseInt(data2, 16));
            lastY = ((rawY * 1.0) / (65536 / 2000.0)) * -1;
            return (lastY - calY);
        }
    };

    this.calcMagZValue = function(data) {
        var calZ = 0;
        var lastZ;
        if (data && data.length < 6) {
            return -0.0;
        }
        if (data && data.length === 12) {
            var data3 = '0x' + data[10] + '' + data[11] + '' + data[8] + '' + data[9];
            var rawZ = this.convSignDecimal(parseInt(data3, 16));
            lastZ = (rawZ * 1.0) / (65536 / 2000.0);
            return (lastZ - calZ);
        }
    };

    this.calcPress = function(data) {
        var hum;
        var rHVal = 0.0;
        if (data && data.length < 3) {
            return -0.0;
        }
        if (data && data.length === 8) {
            hum = '0x' + data[6] + '' + data[7] + '' + data[4] + '' + data[5];
            rHVal = -6.0 + 125.0 * (parseInt(hum, 16) / 65535);
            return rHVal;
        }
    };

    this.movement_ACC_X = function(data) {
        var SCALE = 4096.0;

        var data1 = '0x' + data[14] + '' + data[15] + '' + data[12] + '' + data[13];
        var x = this.convSignDecimal(parseInt(data1, 16));
        x = ((x / SCALE) * -1);

        return x;
    };

    this.movement_ACC_Y = function(data) {
        var SCALE = 4096.0;

        var data2 = '0x' + data[18] + '' + data[19] + '' + data[16] + '' + data[17];
        var y = this.convSignDecimal(parseInt(data2, 16));
        y = y / SCALE;

        return y;
    };

    this.movement_ACC_Z = function(data) {
        var SCALE = 4096.0;

        var data3 = '0x' + data[22] + '' + data[23] + '' + data[20] + '' + data[21];
        var z = this.convSignDecimal(parseInt(data3, 16));
        z = ((z / SCALE) * -1);

        return z;
    };

    this.movement_GYRO_X = function(data) {
        var SCALE = 128.0;

        var data1 = '0x' + data[2] + '' + data[3] + '' + data[0] + '' + data[1];
        var x = this.convSignDecimal(parseInt(data1, 16));
        x = x / SCALE;

        return x;
    };

    this.movement_GYRO_Y = function(data) {
        var SCALE = 128.0;

        var data2 = '0x' + data[6] + '' + data[7] + '' + data[4] + '' + data[5];
        var y = this.convSignDecimal(parseInt(data2, 16));
        y = y / SCALE;

        return y;
    };

    this.movement_GYRO_Z = function(data) {
        var SCALE = 128.0;

        var data3 = '0x' + data[10] + '' + data[11] + '' + data[8] + '' + data[9];
        var z = this.convSignDecimal(parseInt(data3, 16));
        z = z / SCALE;

        return z;
    };

    this.movement_MAG_X = function(data) {
        var SCALE = (32768 / 4912);

        var data1 = '0x' + data[26] + '' + data[27] + '' + data[24] + '' + data[25];
        var x = this.convSignDecimal(parseInt(data1, 16));
        x = x / SCALE;

        return x;
    };

    this.movement_MAG_Y = function(data) {
        var SCALE = (32768 / 4912);

        var data2 = '0x' + data[30] + '' + data[31] + '' + data[28] + '' + data[29];
        var y = this.convSignDecimal(parseInt(data2, 16));
        y = y / SCALE;

        return y;
    };

    this.movement_MAG_Z = function(data) {
        var SCALE = (32768 / 4912);

        var data3 = '0x' + data[34] + '' + data[35] + '' + data[32] + '' + data[33];
        var z = this.convSignDecimal(parseInt(data3, 16));
        z = z / SCALE;

        return z;
    };

    this.calcBarometerCalib = function(data) {
        var c1, c2, c3, c4, c5, c6, c7, c8;

        if (data) {
            if (data.length < 16) {
                return -0.0;
            }
            c1 = '0x' + data[2] + '' + data[3] + '' + data[0] + '' + data[1];
            c2 = '0x' + data[6] + '' + data[7] + '' + data[4] + '' + data[5];
            c3 = '0x' + data[10] + '' + data[11] + '' + data[8] + '' + data[9];
            c4 = '0x' + data[14] + '' + data[15] + '' + data[12] + '' + data[13];
            c5 = '0x' + data[18] + '' + data[19] + '' + data[16] + '' + data[17];
            c6 = '0x' + data[22] + '' + data[23] + '' + data[20] + '' + data[21];
            c7 = '0x' + data[26] + '' + data[27] + '' + data[24] + '' + data[25];
            c8 = '0x' + data[30] + '' + data[31] + '' + data[28] + '' + data[29];

            this.c1 = this.convSignDecimal(parseInt(c1, 16));
            this.c2 = this.convSignDecimal(parseInt(c2, 16));
            this.c3 = this.convSignDecimal(parseInt(c3, 16));
            this.c4 = this.convSignDecimal(parseInt(c4, 16));
            this.c5 = this.convSignDecimal(parseInt(c5, 16));
            this.c6 = this.convSignDecimal(parseInt(c6, 16));
            this.c7 = this.convSignDecimal(parseInt(c7, 16));
            this.c8 = this.convSignDecimal(parseInt(c8, 16));
        }

    };

    this.calcPressure_st2 = function(dataMain) {
        var data = dataMain;

        if (data && data.length < 4) {
            return -0.0;
        }

        if (data && data.length >= 7) {
            if (data.length > 8) {
                // console.log('Barometer data length is more than 8');
                var data3 = '0x' + data[8] + '' + data[9] + '' + data[6] + '' + data[7] + '' + data[4] + '' + data[5];
                var val = this.convSignDecimal(parseInt(data3, 16));

                if (val < 0) {
                    val = val * -1;
                }

                return (val / 1000.0);

            } else {
                // console.log('Barometer data length is less than 8');
                var mantissa;
                var exponent;

                mantissa = '0x' + data[7] + '' + data[4] + '' + data[5]; //sfloat & 0x0FFF;
                mantissa = this.convSignDecimal(parseInt(mantissa, 16));
                exponent = '0x' + data[6]; //(sfloat >> 12) & 0xFF;
                exponent = this.convSignDecimal(parseInt(exponent, 16));

                var output;
                var magnitude = Math.pow(2.0, exponent);
                output = (mantissa * magnitude);

                return (output / 1000.0);
            }
        }
    };

    this.calcPressure = function(dataMain) {
        var data = dataMain;

        if (data && data.length < 4) {
            return -0.0;
        }

        if (data && data.length >= 7) {
            var temp;
            var pressure;
            var data1 = '0x' + data[2] + '' + data[3] + '' + data[0] + '' + data[1];
            var data2 = '0x' + data[6] + '' + data[7] + '' + data[4] + '' + data[5];

            temp = this.convSignDecimal(parseInt(data1, 16));
            pressure = this.convSignDecimal(parseInt(data2, 16));
            var tempTemp = temp;
            // Temperature calculation
            temperature = (((this.c1 * tempTemp) / 1024) + ((this.c2) / 4 - 16384));
            //  NSLog(@"Calculation of Barometer Temperature : temperature = %ld(%lx)",temperature,temperature);
            // Barometer calculation

            var S = this.c3 + ((this.c4 * tempTemp) / (1 << 17)) + ((this.c5 * (tempTemp * tempTemp)) / (17179869184));
            var O = (this.c6 * (1 << 14)) + (((this.c7 * tempTemp) / (1 << 3))) + ((this.c8 * (tempTemp * tempTemp)) / (1 << 19));
            var Pa = (((S * pressure) + O) / (1 << 14));
            return (Pa / 100);
        }
    };

    this.calLight = function(data) {
        if (data && data.length === 4) {
            var mantissa;
            var exponent;

            mantissa = '0x' + '0' + '' + data[3] + '' + data[1] + '' + data[2]; //sfloat & 0x0FFF;
            mantissa = this.convSignDecimal(parseInt(mantissa, 16));
            exponent = '0x' + '0' + '' + '0' + '' + '0' + '' + data[2]; //(sfloat >> 12) & 0xFF;
            exponent = this.convSignDecimal(parseInt(exponent, 16));

            var output;
            var magnitude = Math.pow(2.0, exponent);
            output = (mantissa * magnitude);

            return (output / 100.0);
        }
    };
    
    return this;
}