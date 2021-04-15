(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.window = global.window || {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /* eslint-disable no-var */
    function WorldMagneticModel() {
        this.coff = [
            "  1,  0,  -29404.5  ,     0.0    ,    6.7  ,      0.0",
            "  1,  1,   -1450.7  ,  4652.9    ,    7.7  ,    -25.1",
            "  2,  0,   -2500.0  ,     0.0    ,  -11.5  ,      0.0",
            "  2,  1,    2982.0  , -2991.6    ,   -7.1  ,    -30.2",
            "  2,  2,    1676.8  ,  -734.8    ,   -2.2  ,    -23.9",
            "  3,  0,    1363.9  ,     0.0    ,    2.8  ,      0.0",
            "  3,  1,   -2381.0  ,   -82.2    ,   -6.2  ,      5.7",
            "  3,  2,    1236.2  ,   241.8    ,    3.4  ,     -1.0",
            "  3,  3,     525.7  ,  -542.9    ,  -12.2  ,      1.1",
            "  4,  0,     903.1  ,     0.0    ,   -1.1  ,      0.0",
            "  4,  1,     809.4  ,   282.0    ,   -1.6  ,      0.2",
            "  4,  2,      86.2  ,  -158.4    ,   -6.0  ,      6.9",
            "  4,  3,    -309.4  ,   199.8    ,    5.4  ,      3.7",
            "  4,  4,      47.9  ,  -350.1    ,   -5.5  ,     -5.6",
            "  5,  0,    -234.4  ,     0.0    ,   -0.3  ,      0.0",
            "  5,  1,     363.1  ,    47.7    ,    0.6  ,      0.1",
            "  5,  2,     187.8  ,   208.4    ,   -0.7  ,      2.5",
            "  5,  3,    -140.7  ,  -121.3    ,    0.1  ,     -0.9",
            "  5,  4,    -151.2  ,    32.2    ,    1.2  ,      3.0",
            "  5,  5,      13.7  ,    99.1    ,    1.0  ,      0.5",
            "  6,  0,      65.9  ,     0.0    ,   -0.6  ,      0.0",
            "  6,  1,      65.6  ,   -19.1    ,   -0.4  ,      0.1",
            "  6,  2,      73.0  ,    25.0    ,    0.5  ,     -1.8",
            "  6,  3,    -121.5  ,    52.7    ,    1.4  ,     -1.4",
            "  6,  4,     -36.2  ,   -64.4    ,   -1.4  ,      0.9",
            "  6,  5,      13.5  ,     9.0    ,   -0.0  ,      0.1",
            "  6,  6,     -64.7  ,    68.1    ,    0.8  ,      1.0",
            "  7,  0,      80.6  ,     0.0    ,   -0.1  ,      0.0",
            "  7,  1,     -76.8  ,   -51.4    ,   -0.3  ,      0.5",
            "  7,  2,      -8.3  ,   -16.8    ,   -0.1  ,      0.6",
            "  7,  3,      56.5  ,     2.3    ,    0.7  ,     -0.7",
            "  7,  4,      15.8  ,    23.5    ,    0.2  ,     -0.2",
            "  7,  5,       6.4  ,    -2.2    ,   -0.5  ,     -1.2",
            "  7,  6,      -7.2  ,   -27.2    ,   -0.8  ,      0.2",
            "  7,  7,       9.8  ,    -1.9    ,    1.0  ,      0.3",
            "  8,  0,      23.6  ,     0.0    ,   -0.1  ,      0.0",
            "  8,  1,       9.8  ,     8.4    ,    0.1  ,     -0.3",
            "  8,  2,     -17.5  ,   -15.3    ,   -0.1  ,      0.7",
            "  8,  3,      -0.4  ,    12.8    ,    0.5  ,     -0.2",
            "  8,  4,     -21.1  ,   -11.8    ,   -0.1  ,      0.5",
            "  8,  5,      15.3  ,    14.9    ,    0.4  ,     -0.3",
            "  8,  6,      13.7  ,     3.6    ,    0.5  ,     -0.5",
            "  8,  7,     -16.5  ,    -6.9    ,    0.0  ,      0.4",
            "  8,  8,      -0.3  ,     2.8    ,    0.4  ,      0.1",
            "  9,  0,       5.0  ,     0.0    ,   -0.1  ,      0.0",
            "  9,  1,       8.2  ,   -23.3    ,   -0.2  ,     -0.3",
            "  9,  2,       2.9  ,    11.1    ,   -0.0  ,      0.2",
            "  9,  3,      -1.4  ,     9.8    ,    0.4  ,     -0.4",
            "  9,  4,      -1.1  ,    -5.1    ,   -0.3  ,      0.4",
            "  9,  5,     -13.3  ,    -6.2    ,   -0.0  ,      0.1",
            "  9,  6,       1.1  ,     7.8    ,    0.3  ,     -0.0",
            "  9,  7,       8.9  ,     0.4    ,   -0.0  ,     -0.2",
            "  9,  8,      -9.3  ,    -1.5    ,   -0.0  ,      0.5",
            "  9,  9,     -11.9  ,     9.7    ,   -0.4  ,      0.2",
            " 10,  0,      -1.9  ,     0.0    ,    0.0  ,      0.0",
            " 10,  1,      -6.2  ,     3.4    ,   -0.0  ,     -0.0",
            " 10,  2,      -0.1  ,    -0.2    ,   -0.0  ,      0.1",
            " 10,  3,       1.7  ,     3.5    ,    0.2  ,     -0.3",
            " 10,  4,      -0.9  ,     4.8    ,   -0.1  ,      0.1",
            " 10,  5,       0.6  ,    -8.6    ,   -0.2  ,     -0.2",
            " 10,  6,      -0.9  ,    -0.1    ,   -0.0  ,      0.1",
            " 10,  7,       1.9  ,    -4.2    ,   -0.1  ,     -0.0",
            " 10,  8,       1.4  ,    -3.4    ,   -0.2  ,     -0.1",
            " 10,  9,      -2.4  ,    -0.1    ,   -0.1  ,      0.2",
            " 10, 10,      -3.9  ,    -8.8    ,   -0.0  ,     -0.0",
            " 11,  0,       3.0  ,     0.0    ,   -0.0  ,      0.0",
            " 11,  1,      -1.4  ,    -0.0    ,   -0.1  ,     -0.0",
            " 11,  2,      -2.5  ,     2.6    ,   -0.0  ,      0.1",
            " 11,  3,       2.4  ,    -0.5    ,    0.0  ,      0.0",
            " 11,  4,      -0.9  ,    -0.4    ,   -0.0  ,      0.2",
            " 11,  5,       0.3  ,     0.6    ,   -0.1  ,     -0.0",
            " 11,  6,      -0.7  ,    -0.2    ,    0.0  ,      0.0",
            " 11,  7,      -0.1  ,    -1.7    ,   -0.0  ,      0.1",
            " 11,  8,       1.4  ,    -1.6    ,   -0.1  ,     -0.0",
            " 11,  9,      -0.6  ,    -3.0    ,   -0.1  ,     -0.1",
            " 11, 10,       0.2  ,    -2.0    ,   -0.1  ,      0.0",
            " 11, 11,       3.1  ,    -2.6    ,   -0.1  ,     -0.0",
            " 12,  0,      -2.0  ,     0.0    ,    0.0  ,      0.0",
            " 12,  1,      -0.1  ,    -1.2    ,   -0.0  ,     -0.0",
            " 12,  2,       0.5  ,     0.5    ,   -0.0  ,      0.0",
            " 12,  3,       1.3  ,     1.3    ,    0.0  ,     -0.1",
            " 12,  4,      -1.2  ,    -1.8    ,   -0.0  ,      0.1",
            " 12,  5,       0.7  ,     0.1    ,   -0.0  ,     -0.0",
            " 12,  6,       0.3  ,     0.7    ,    0.0  ,      0.0",
            " 12,  7,       0.5  ,    -0.1    ,   -0.0  ,     -0.0",
            " 12,  8,      -0.2  ,     0.6    ,    0.0  ,      0.1",
            " 12,  9,      -0.5  ,     0.2    ,   -0.0  ,     -0.0",
            " 12, 10,       0.1  ,    -0.9    ,   -0.0  ,     -0.0",
            " 12, 11,      -1.1  ,    -0.0    ,   -0.0  ,      0.0",
            " 12, 12,      -0.3  ,     0.5    ,   -0.1  ,     -0.1",
        ];
        /* static variables */
        /* some 13x13 2D arrays */
        this.c = new Array(13);
        this.cd = new Array(13);
        this.tc = new Array(13);
        this.dp = new Array(13);
        this.k = new Array(13);
        for (var i = 0; i < 13; i++) {
            this.c[i] = new Array(13);
            this.cd[i] = new Array(13);
            this.tc[i] = new Array(13);
            this.dp[i] = new Array(13);
            this.k[i] = new Array(13);
        }
        /* some 1D arrays */
        this.snorm = new Array(169);
        this.sp = new Array(13);
        this.cp = new Array(13);
        this.fn = new Array(13);
        this.fm = new Array(13);
        this.pp = new Array(13);
        /* locals */
        var maxdeg = 12;
        var maxord;
        var i, j, D1, D2, n, m;
        var gnm, hnm, dgnm, dhnm, flnmj;
        var c_str;
        var c_flds;
        /* INITIALIZE CONSTANTS */
        maxord = maxdeg;
        this.sp[0] = 0.0;
        this.cp[0] = this.snorm[0] = this.pp[0] = 1.0;
        this.dp[0][0] = 0.0;
        /* READ WORLD MAGNETIC MODEL SPHERICAL HARMONIC COEFFICIENTS */
        this.c[0][0] = 0.0;
        this.cd[0][0] = 0.0;
        for (i = 0; i < this.coff.length; i++) {
            c_str = this.coff[i];
            c_flds = c_str.split(",");
            n = parseInt(c_flds[0], 10);
            m = parseInt(c_flds[1], 10);
            gnm = parseFloat(c_flds[2]);
            hnm = parseFloat(c_flds[3]);
            dgnm = parseFloat(c_flds[4]);
            dhnm = parseFloat(c_flds[5]);
            if (m <= n) {
                this.c[m][n] = gnm;
                this.cd[m][n] = dgnm;
                if (m != 0) {
                    this.c[n][m - 1] = hnm;
                    this.cd[n][m - 1] = dhnm;
                }
            }
        }
        /* CONVERT SCHMIDT NORMALIZED GAUSS COEFFICIENTS TO UNNORMALIZED */
        this.snorm[0] = 1.0;
        for (n = 1; n <= maxord; n++) {
            this.snorm[n] = this.snorm[n - 1] * (2 * n - 1) / n;
            j = 2;
            for (m = 0, D1 = 1, D2 = (n - m + D1) / D1; D2 > 0; D2--, m += D1) {
                this.k[m][n] = (((n - 1) * (n - 1)) - (m * m)) / ((2 * n - 1) * (2 * n - 3));
                if (m > 0) {
                    flnmj = ((n - m + 1) * j) / (n + m);
                    this.snorm[n + m * 13] = this.snorm[n + (m - 1) * 13] * Math.sqrt(flnmj);
                    j = 1;
                    this.c[n][m - 1] = this.snorm[n + m * 13] * this.c[n][m - 1];
                    this.cd[n][m - 1] = this.snorm[n + m * 13] * this.cd[n][m - 1];
                }
                this.c[m][n] = this.snorm[n + m * 13] * this.c[m][n];
                this.cd[m][n] = this.snorm[n + m * 13] * this.cd[m][n];
            }
            this.fn[n] = (n + 1);
            this.fm[n] = n;
        }
        this.k[1][1] = 0.0;
        this.fm[0] = 0.0; // !!!!!! WMM C and Fortran both have a bug in that fm[0] is not initialised 
    }
    WorldMagneticModel.prototype.declination = function (altitudeKm, latitudeDegrees, longitudeDegrees, yearFloat) {
        /* locals */
        var a = 6378.137;
        var b = 6356.7523142;
        var re = 6371.2;
        var a2 = a * a;
        var b2 = b * b;
        var c2 = a2 - b2;
        var a4 = a2 * a2;
        var b4 = b2 * b2;
        var c4 = a4 - b4;
        var D3, D4;
        var dec;
        var n, m;
        var pi, dt, rlon, rlat, srlon, srlat, crlon, crlat, srlat2, crlat2, q, q1, q2, ct, d, aor, ar, br, r, r2, bpp, par, temp1, parp, temp2, bx, by, dtr, bp, bt, st, ca, sa;
        var maxord = 12;
        var alt = altitudeKm;
        var glon = longitudeDegrees;
        var glat = latitudeDegrees;
        /*************************************************************************/
        dt = yearFloat - 2020.0;
        //if more then 5 years has passed since last epoch update then return invalid
        if ((dt < 0.0) || (dt > 5.0))
            return -999;
        pi = 3.14159265359;
        dtr = pi / 180.0;
        rlon = glon * dtr;
        rlat = glat * dtr;
        srlon = Math.sin(rlon);
        srlat = Math.sin(rlat);
        crlon = Math.cos(rlon);
        crlat = Math.cos(rlat);
        srlat2 = srlat * srlat;
        crlat2 = crlat * crlat;
        this.sp[1] = srlon;
        this.cp[1] = crlon;
        /* CONVERT FROM GEODETIC COORDS. TO SPHERICAL COORDS. */
        q = Math.sqrt(a2 - c2 * srlat2);
        q1 = alt * q;
        q2 = ((q1 + a2) / (q1 + b2)) * ((q1 + a2) / (q1 + b2));
        ct = srlat / Math.sqrt(q2 * crlat2 + srlat2);
        st = Math.sqrt(1.0 - (ct * ct));
        r2 = (alt * alt) + 2.0 * q1 + (a4 - c4 * srlat2) / (q * q);
        r = Math.sqrt(r2);
        d = Math.sqrt(a2 * crlat2 + b2 * srlat2);
        ca = (alt + d) / r;
        sa = c2 * crlat * srlat / (r * d);
        for (m = 2; m <= maxord; m++) {
            this.sp[m] = this.sp[1] * this.cp[m - 1] + this.cp[1] * this.sp[m - 1];
            this.cp[m] = this.cp[1] * this.cp[m - 1] - this.sp[1] * this.sp[m - 1];
        }
        aor = re / r;
        ar = aor * aor;
        br = bt = bp = bpp = 0.0;
        for (n = 1; n <= maxord; n++) {
            ar = ar * aor;
            for (m = 0, D3 = 1, D4 = (n + m + D3) / D3; D4 > 0; D4--, m += D3) {
                /*
                   COMPUTE UNNORMALIZED ASSOCIATED LEGENDRE POLYNOMIALS
                   AND DERIVATIVES VIA RECURSION RELATIONS
                */
                if (n == m) {
                    this.snorm[n + m * 13] = st * this.snorm[n - 1 + (m - 1) * 13];
                    this.dp[m][n] = st * this.dp[m - 1][n - 1] + ct * this.snorm[n - 1 + (m - 1) * 13];
                }
                else if (n == 1 && m == 0) {
                    this.snorm[n + m * 13] = ct * this.snorm[n - 1 + m * 13];
                    this.dp[m][n] = ct * this.dp[m][n - 1] - st * this.snorm[n - 1 + m * 13];
                }
                else if (n > 1 && n != m) {
                    if (m > n - 2)
                        this.snorm[n - 2 + m * 13] = 0.0;
                    if (m > n - 2)
                        this.dp[m][n - 2] = 0.0;
                    this.snorm[n + m * 13] = ct * this.snorm[n - 1 + m * 13] - this.k[m][n] * this.snorm[n - 2 + m * 13];
                    this.dp[m][n] = ct * this.dp[m][n - 1] - st * this.snorm[n - 1 + m * 13] - this.k[m][n] * this.dp[m][n - 2];
                }
                /*
                TIME ADJUST THE GAUSS COEFFICIENTS
                */
                this.tc[m][n] = this.c[m][n] + dt * this.cd[m][n];
                if (m != 0)
                    this.tc[n][m - 1] = this.c[n][m - 1] + dt * this.cd[n][m - 1];
                /*
                ACCUMULATE TERMS OF THE SPHERICAL HARMONIC EXPANSIONS
                */
                par = ar * this.snorm[n + m * 13];
                if (m == 0) {
                    temp1 = this.tc[m][n] * this.cp[m];
                    temp2 = this.tc[m][n] * this.sp[m];
                }
                else {
                    temp1 = this.tc[m][n] * this.cp[m] + this.tc[n][m - 1] * this.sp[m];
                    temp2 = this.tc[m][n] * this.sp[m] - this.tc[n][m - 1] * this.cp[m];
                }
                bt = bt - ar * temp1 * this.dp[m][n];
                bp += (this.fm[m] * temp2 * par);
                br += (this.fn[n] * temp1 * par);
                /*
                SPECIAL CASE:  NORTH/SOUTH GEOGRAPHIC POLES
                */
                if (st == 0.0 && m == 1) {
                    if (n == 1)
                        this.pp[n] = this.pp[n - 1];
                    else
                        this.pp[n] = this.ct * this.pp[n - 1] - this.k[m][n] * this.pp[n - 2];
                    parp = ar * this.pp[n];
                    bpp += (this.fm[m] * temp2 * parp);
                }
            }
        }
        if (st == 0.0)
            bp = bpp;
        else
            bp /= st;
        /*
            ROTATE MAGNETIC VECTOR COMPONENTS FROM SPHERICAL TO
            GEODETIC COORDINATES
        */
        bx = -bt * ca - br * sa;
        by = bp;
        dec = Math.atan2(by, bx) / dtr;
        return dec;
    };
    WorldMagneticModel.prototype.knownAnswerTest = function () {
        /* http://www.ngdc.noaa.gov/geomag/WMM WMM2010testvalues.pdf */
        /* Lat	Lon Dec	    */
        /* Lon 240 = 120W, Lon 300 = 60W */
        /* Alt 0 km */
        var kat2010 = [
            "80.00	,0.00	 ,-6.13	    ",
            "0.00	,120.00	 ,0.97	    ",
            "-80.00	,240.00	 ,70.21	    "
        ];
        var kat2012p5 = [
            "80.00	,0.00	 ,-5.21	    ",
            "0.00	,120.00	 ,0.88	    ",
            "-80.00	,240.00	 ,70.04	    "
        ];
        var maxErr = 0.0;
        for (var i = 0; i < kat2010.length; i++) {
            var c_str = kat2010[i];
            var c_flds = c_str.split(",");
            var lat = parseFloat(c_flds[0]);
            var lon = parseFloat(c_flds[1]);
            var exp = parseFloat(c_flds[2]);
            var maxExp;
            var dec = this.declination(0, lat, lon, 2010.0);
            if (Math.abs(dec - exp) > maxErr) {
                maxErr = Math.abs(dec - exp);
                maxExp = exp;
            }
        }
        for (var i = 0; i < kat2012p5.length; i++) {
            var c_str = kat2012p5[i];
            var c_flds = c_str.split(",");
            var lat = parseFloat(c_flds[0]);
            var lon = parseFloat(c_flds[1]);
            var exp = parseFloat(c_flds[2]);
            var maxExp;
            var dec = this.declination(0, lat, lon, 2012.5);
            if (Math.abs(dec - exp) > maxErr) {
                maxErr = Math.abs(dec - exp);
                maxExp = exp;
            }
        }
        return maxErr * 100 / maxExp; //max % error
    };
    /*

    C***********************************************************************
    C
    C
    C     SUBROUTINE GEOMAG (GEOMAGNETIC FIELD COMPUTATION)
    C
    C
    C***********************************************************************
    C
    C     GEOMAG IS A NATIONAL GEOSPATIAL INTELLIGENCE AGENCY (NGA) STANDARD
    C     PRODUCT.  IT IS COVERED UNDER NGA MILITARY SPECIFICATION:
    C     MIL-W-89500 (1993).
    C
    C***********************************************************************
    C     Contact Information
    C
    C     Software and Model Support
    C     	National Geophysical Data Center
    C     	NOAA EGC/2
    C     	325 Broadway
    C     	Boulder, CO 80303 USA
    C     	Attn: Susan McLean or Stefan Maus
    C     	Phone:  (303) 497-6478 or -6522
    C     	Email:  Susan.McLean@noaa.gov or Stefan.Maus@noaa.gov
    C		Web: http://www.ngdc.noaa.gov/seg/WMM/
    C
    C     Sponsoring Government Agency
    C	   National Geospatial-Intelligence Agency
    C    	   PRG / CSAT, M.S. L-41
    C    	   3838 Vogel Road
    C    	   Arnold, MO 63010
    C    	   Attn: Craig Rollins
    C    	   Phone:  (314) 263-4186
    C    	   Email:  Craig.M.Rollins@Nga.Mil
    C
    C      Original Program By:
    C        Dr. John Quinn
    C        FLEET PRODUCTS DIVISION, CODE N342
    C        NAVAL OCEANOGRAPHIC OFFICE (NAVOCEANO)
    C        STENNIS SPACE CENTER (SSC), MS 39522-5001
    C
    C***********************************************************************
    C
    C     PURPOSE:  THIS ROUTINE COMPUTES THE DECLINATION (DEC),
    C               INCLINATION (DIP), TOTAL INTENSITY (TI) AND
    C               GRID VARIATION (GV - POLAR REGIONS ONLY, REFERENCED
    C               TO GRID NORTH OF A STEREOGRAPHIC PROJECTION) OF THE
    C               EARTH'S MAGNETIC FIELD IN GEODETIC COORDINATES
    C               FROM THE COEFFICIENTS OF THE CURRENT OFFICIAL
    C               DEPARTMENT OF DEFENSE (DOD) SPHERICAL HARMONIC WORLD
    C               MAGNETIC MODEL (WMM.COF).  THE WMM SERIES OF MODELS IS
    C               UPDATED EVERY 5 YEARS ON JANUARY 1ST OF THOSE YEARS
    C               WHICH ARE DIVISIBLE BY 5 (I.E. 2000, 2005, 2010 ETC.)
    C               BY NOAA'S NATIONAL GEOPHYSICAL DATA CENTER IN
    C               COOPERATION WITH THE BRITISH GEOLOGICAL SURVEY (BGS).
    C               THE MODEL IS BASED ON GEOMAGNETIC FIELD MEASUREMENTS
    C               FROM SATELLITE AND GROUND OBSERVATORIES.
    C
    C***********************************************************************
    C
    C     MODEL:  THE WMM SERIES GEOMAGNETIC MODELS ARE COMPOSED
    C             OF TWO PARTS:  THE MAIN FIELD MODEL, WHICH IS
    C             VALID AT THE BASE EPOCH OF THE CURRENT MODEL AND
    C             A SECULAR VARIATION MODEL, WHICH ACCOUNTS FOR SLOW
    C             TEMPORAL VARIATIONS IN THE MAIN GEOMAGNETIC FIELD
    C             FROM THE BASE EPOCH TO A MAXIMUM OF 5 YEARS BEYOND
    C             THE BASE EPOCH.  FOR EXAMPLE, THE BASE EPOCH OF
    C             THE WMM-2005 MODEL IS 2005.0.  THIS MODEL IS THEREFORE
    C             CONSIDERED VALID BETWEEN 2005.0 AND 2010.0. THE
    C             COMPUTED MAGNETIC PARAMETERS ARE REFERENCED TO THE
    C             WGS-84 ELLIPSOID.
    C
    C***********************************************************************
    C
    C     ACCURACY:  IN OCEAN AREAS AT THE EARTH'S SURFACE OVER THE
    C                ENTIRE 5 YEAR LIFE OF THE DEGREE AND ORDER 12
    C                SPHERICAL HARMONIC MODEL WMM-2005, THE ESTIMATED
    C                MAXIMUM RMS ERRORS FOR THE VARIOUS MAGNETIC COMPONENTS
    C                ARE:
    C
    C                DEC  -   0.5 Degrees
    C                DIP  -   0.5 Degrees
    C                TI   - 280.0 nanoTeslas (nT)
    C                GV   -   0.5 Degrees
    C
    C                OTHER MAGNETIC COMPONENTS THAT CAN BE DERIVED FROM
    C                THESE FOUR BY SIMPLE TRIGONOMETRIC RELATIONS WILL
    C                HAVE THE FOLLOWING APPROXIMATE ERRORS OVER OCEAN AREAS:
    C
    C                X    - 140 nT (North)
    C                Y    - 140 nT (East)
    C                Z    - 200 nT (Vertical) Positive is down
    C                H    - 200 nT (Horizontal)
    C
    C                OVER LAND THE MAXIMUM RMS ERRORS ARE EXPECTED TO BE
    C                HIGHER, ALTHOUGH THE RMS ERRORS FOR DEC, DIP, AND GV
    C                ARE STILL ESTIMATED TO BE LESS THAN 1.0 DEGREE, FOR
    C                THE ENTIRE 5-YEAR LIFE OF THE MODEL AT THE EARTH's
    C                SURFACE.  THE OTHER COMPONENT ERRORS OVER LAND ARE
    C                MORE DIFFICULT TO ESTIMATE AND SO ARE NOT GIVEN.
    C
    C                THE ACCURACY AT ANY GIVEN TIME FOR ALL OF THESE
    C                GEOMAGNETIC PARAMETERS DEPENDS ON THE GEOMAGNETIC
    C                LATITUDE.  THE ERRORS ARE LEAST FROM THE EQUATOR TO
    C                MID-LATITUDES AND GREATEST NEAR THE MAGNETIC POLES.
    C
    C                IT IS VERY IMPORTANT TO NOTE THAT A DEGREE AND
    C                ORDER 12 MODEL, SUCH AS WMM-2005, DESCRIBES ONLY
    C                THE LONG WAVELENGTH SPATIAL MAGNETIC FLUCTUATIONS
    C                DUE TO EARTH'S CORE.  NOT INCLUDED IN THE WMM SERIES
    C                MODELS ARE INTERMEDIATE AND SHORT WAVELENGTH
    C                SPATIAL FLUCTUATIONS OF THE GEOMAGNETIC FIELD
    C                WHICH ORIGINATE IN THE EARTH'S MANTLE AND CRUST.
    C                CONSEQUENTLY, ISOLATED ANGULAR ERRORS AT VARIOUS
    C                POSITIONS ON THE SURFACE (PRIMARILY OVER LAND, IN
    C                CONTINENTAL MARGINS AND OVER OCEANIC SEAMOUNTS,
    C                RIDGES AND TRENCHES) OF SEVERAL DEGREES MAY BE
    C                EXPECTED. ALSO NOT INCLUDED IN THE MODEL ARE
    C                NONSECULAR TEMPORAL FLUCTUATIONS OF THE GEOMAGNETIC
    C                FIELD OF MAGNETOSPHERIC AND IONOSPHERIC ORIGIN.
    C                DURING MAGNETIC STORMS, TEMPORAL FLUCTUATIONS CAN
    C                CAUSE SUBSTANTIAL DEVIATIONS OF THE GEOMAGNETIC
    C                FIELD FROM MODEL VALUES.  IN ARCTIC AND ANTARCTIC
    C                REGIONS, AS WELL AS IN EQUATORIAL REGIONS, DEVIATIONS
    C                FROM MODEL VALUES ARE BOTH FREQUENT AND PERSISTENT.
    C
    C                IF THE REQUIRED DECLINATION ACCURACY IS MORE
    C                STRINGENT THAN THE WMM SERIES OF MODELS PROVIDE, THEN
    C                THE USER IS ADVISED TO REQUEST SPECIAL (REGIONAL OR
    C                LOCAL) SURVEYS BE PERFORMED AND MODELS PREPARED.
    C                REQUESTS OF THIS NATURE SHOULD BE MADE TO NIMA
    C                AT THE ADDRESS ABOVE.
    C
    C***********************************************************************
    C
    C     USAGE:  THIS ROUTINE IS BROKEN UP INTO TWO PARTS:
    C
    C             A) AN INITIALIZATION MODULE, WHICH IS CALLED ONLY
    C                ONCE AT THE BEGINNING OF THE MAIN (CALLING)
    C                PROGRAM
    C             B) A PROCESSING MODULE, WHICH COMPUTES THE MAGNETIC
    C                FIELD PARAMETERS FOR EACH SPECIFIED GEODETIC
    C                POSITION (ALTITUDE, LATITUDE, LONGITUDE) AND TIME
    C
    C             INITIALIZATION IS MADE VIA A SINGLE CALL TO THE MAIN
    C             ENTRY POINT (GEOMAG), WHILE SUBSEQUENT PROCESSING
    C             CALLS ARE MADE THROUGH THE SECOND ENTRY POINT (GEOMG1).
    C             ONE CALL TO THE PROCESSING MODULE IS REQUIRED FOR EACH
    C             POSITION AND TIME.
    C
    C             THE VARIABLE MAXDEG IN THE INITIALIZATION CALL IS THE
    C             MAXIMUM DEGREE TO WHICH THE SPHERICAL HARMONIC MODEL
    C             IS TO BE COMPUTED.  IT MUST BE SPECIFIED BY THE USER
    C             IN THE CALLING ROUTINE.  NORMALLY IT IS 12 BUT IT MAY
    C             BE SET LESS THAN 12 TO INCREASE COMPUTATIONAL SPEED AT
    C             THE EXPENSE OF REDUCED ACCURACY.
    C
    C             THE PC VERSION OF THIS SUBROUTINE MUST BE COMPILED
    C             WITH A FORTRAN 77 COMPATIBLE COMPILER SUCH AS THE
    C             MICROSOFT OPTIMIZING FORTRAN COMPILER VERSION 4.1
    C             OR LATER.
    C
    C**********************************************************************
    C
    C     REFERENCES:
    C
    C       JOHN M. QUINN, DAVID J. KERRIDGE AND DAVID R. BARRACLOUGH,
    C            WORLD MAGNETIC CHARTS FOR 1985 - SPHERICAL HARMONIC
    C            MODELS OF THE GEOMAGNETIC FIELD AND ITS SECULAR
    C            VARIATION, GEOPHYS. J. R. ASTR. SOC. (1986) 87,
    C            PP 1143-1157
    C
    C       DEFENSE MAPPING AGENCY TECHNICAL REPORT, TR 8350.2:
    C            DEPARTMENT OF DEFENSE WORLD GEODETIC SYSTEM 1984,
    C            SEPT. 30 (1987)
    C
    C       JOHN M. QUINN, RACHEL J. COLEMAN, MICHAEL R. PECK, AND
    C            STEPHEN E. LAUBER; THE JOINT US/UK 1990 EPOCH
    C            WORLD MAGNETIC MODEL, TECHNICAL REPORT NO. 304,
    C            NAVAL OCEANOGRAPHIC OFFICE (1991)
    C
    C       JOHN M. QUINN, RACHEL J. COLEMAN, DONALD L. SHIEL, AND
    C            JOHN M. NIGRO; THE JOINT US/UK 1995 EPOCH WORLD
    C            MAGNETIC MODEL, TECHNICAL REPORT NO. 314, NAVAL
    C            OCEANOGRAPHIC OFFICE (1995)
    C
    C            SUSAN AMCMILLAN, DAVID R. BARRACLOUGH, JOHN M. QUINN, AND
    C            RACHEL J. COLEMAN;  THE 1995 REVISION OF THE JOINT US/UK
    C            GEOMAGNETIC FIELD MODELS - I. SECULAR VARIATION, JOURNAL OF
    C            GEOMAGNETISM AND GEOELECTRICITY, VOL. 49, PP. 229-243
    C            (1997)
    C
    C            JOHN M. QUINN, RACHEL J. COELMAN, SUSAM MACMILLAN, AND
    C            DAVID R. BARRACLOUGH;  THE 1995 REVISION OF THE JOINT
    C            US/UK GEOMAGNETIC FIELD MODELS: II. MAIN FIELD,JOURNAL OF
    C            GEOMAGNETISM AND GEOELECTRICITY, VOL. 49, PP. 245 - 261
    C            (1997)
    C
    C***********************************************************************
    C
    C     PARAMETER DESCRIPTIONS:
    C
    C       A      - SEMIMAJOR AXIS OF WGS-84 ELLIPSOID (KM)
    C       B      - SEMIMINOR AXIS OF WGS-84 ELLIPSOID (KM)
    C       RE     - MEAN RADIUS OF IAU-66 ELLIPSOID (KM)
    C       SNORM  - SCHMIDT NORMALIZATION FACTORS
    C       C      - GAUSS COEFFICIENTS OF MAIN GEOMAGNETIC MODEL (NT)
    C       CD     - GAUSS COEFFICIENTS OF SECULAR GEOMAGNETIC MODEL (NT/YR)
    C       TC     - TIME ADJUSTED GEOMAGNETIC GAUSS COEFFICIENTS (NT)
    C       OTIME  - TIME ON PREVIOUS CALL TO GEOMAG (YRS)
    C       OALT   - GEODETIC ALTITUDE ON PREVIOUS CALL TO GEOMAG (YRS)
    C       OLAT   - GEODETIC LATITUDE ON PREVIOUS CALL TO GEOMAG (DEG.)
    C       TIME   - COMPUTATION TIME (YRS)                        (INPUT)
    C                (EG. 1 JULY 1995 = 1995.500)
    C       ALT    - GEODETIC ALTITUDE (KM)                        (INPUT)
    C       GLAT   - GEODETIC LATITUDE (DEG.)                      (INPUT)
    C       GLON   - GEODETIC LONGITUDE (DEG.)                     (INPUT)
    C       EPOCH  - BASE TIME OF GEOMAGNETIC MODEL (YRS)
    C       DTR    - DEGREE TO RADIAN CONVERSION
    C       SP(M)  - SINE OF (M*SPHERICAL COORD. LONGITUDE)
    C       CP(M)  - COSINE OF (M*SPHERICAL COORD. LONGITUDE)
    C       ST     - SINE OF (SPHERICAL COORD. LATITUDE)
    C       CT     - COSINE OF (SPHERICAL COORD. LATITUDE)
    C       R      - SPHERICAL COORDINATE RADIAL POSITION (KM)
    C       CA     - COSINE OF SPHERICAL TO GEODETIC VECTOR ROTATION ANGLE
    C       SA     - SINE OF SPHERICAL TO GEODETIC VECTOR ROTATION ANGLE
    C       BR     - RADIAL COMPONENT OF GEOMAGNETIC FIELD (NT)
    C       BT     - THETA COMPONENT OF GEOMAGNETIC FIELD (NT)
    C       BP     - PHI COMPONENT OF GEOMAGNETIC FIELD (NT)
    C       P(N,M) - ASSOCIATED LEGENDRE POLYNOMIALS (UNNORMALIZED)
    C       PP(N)  - ASSOCIATED LEGENDRE POLYNOMIALS FOR M=1 (UNNORMALIZED)
    C       DP(N,M)- THETA DERIVATIVE OF P(N,M) (UNNORMALIZED)
    C       BX     - NORTH GEOMAGNETIC COMPONENT (NT)
    C       BY     - EAST GEOMAGNETIC COMPONENT (NT)
    C       BZ     - VERTICALLY DOWN GEOMAGNETIC COMPONENT (NT)
    C       BH     - HORIZONTAL GEOMAGNETIC COMPONENT (NT)
    C       DEC    - GEOMAGNETIC DECLINATION (DEG.)                (OUTPUT)
    C                  EAST=POSITIVE ANGLES
    C                  WEST=NEGATIVE ANGLES
    C       DIP    - GEOMAGNETIC INCLINATION (DEG.)                (OUTPUT)
    C                  DOWN=POSITIVE ANGLES
    C                    UP=NEGATIVE ANGLES
    C       TI     - GEOMAGNETIC TOTAL INTENSITY (NT)              (OUTPUT)
    C       GV     - GEOMAGNETIC GRID VARIATION (DEG.)             (OUTPUT)
    C                REFERENCED TO GRID NORTH
    C                GRID NORTH REFERENCED TO 0 MERIDIAN
    C                OF A POLAR STEREOGRAPHIC PROJECTION
    C                (ARCTIC/ANTARCTIC ONLY)
    C       MAXDEG - MAXIMUM DEGREE OF SPHERICAL HARMONIC MODEL    (INPUT)
    C       MOXORD - MAXIMUM ORDER OF SPHERICAL HARMONIC MODEL
    C
    C***********************************************************************
    C
    C     NOTE:  THIS VERSION OF GEOMAG USES A WMM SERIES GEOMAGNETIC
    C            FIELS MODEL REFERENCED TO THE WGS-84 GRAVITY MODEL
    C            ELLIPSOID
    C


    */

    /** A class for geographical mathematics. */
    class GeoMath {
        /**
         * Gets coordinates at a relative bearing and distance from a set of coordinates.
         * @param course The course, in degrees, from the reference coordinates.
         * @param distanceInNM The distance, in nautical miles, from the reference coordinates.
         * @param referenceCoordinates The reference coordinates to calculate from.
         * @returns The calculated coordinates.
         */
        static relativeBearingDistanceToCoords(course, distanceInNM, referenceCoordinates) {
            const courseRadians = course * Avionics.Utils.DEG2RAD;
            const distanceRadians = (Math.PI / (180 * 60)) * distanceInNM;
            const refLat = referenceCoordinates.lat * Avionics.Utils.DEG2RAD;
            const refLon = -(referenceCoordinates.long * Avionics.Utils.DEG2RAD);
            const lat = Math.asin(Math.sin(refLat) * Math.cos(distanceRadians) + Math.cos(refLat) * Math.sin(distanceRadians) * Math.cos(courseRadians));
            const dlon = Math.atan2(Math.sin(courseRadians) * Math.sin(distanceRadians) * Math.cos(refLat), Math.cos(distanceRadians) - Math.sin(refLat) * Math.sin(lat));
            const lon = Avionics.Utils.fmod(refLon - dlon + Math.PI, 2 * Math.PI) - Math.PI;
            return new LatLongAlt(lat * Avionics.Utils.RAD2DEG, -(lon * Avionics.Utils.RAD2DEG));
        }
        /**
         * Gets a magnetic heading given a true course and a magnetic variation.
         * @param trueCourse The true course to correct.
         * @param magneticVariation The measured magnetic variation.
         * @returns The magnetic heading, corrected for magnetic variation.
         */
        static correctMagvar(trueCourse, magneticVariation) {
            return trueCourse - GeoMath.normalizeMagVar(magneticVariation);
        }
        /**
         * Gets a true course given a magnetic heading and a magnetic variation.
         * @param headingMagnetic The magnetic heading to correct.
         * @param magneticVariation The measured magnetic variation.
         * @returns The true course, corrected for magnetic variation.
         */
        static removeMagvar(headingMagnetic, magneticVariation) {
            return headingMagnetic + GeoMath.normalizeMagVar(magneticVariation);
        }
        /**
         * Gets a magnetic variation difference in 0-360 degrees.
         * @param magneticVariation The magnetic variation to normalize.
         * @returns A normalized magnetic variation.
         */
        static normalizeMagVar(magneticVariation) {
            let normalizedMagVar;
            if (magneticVariation <= 180) {
                normalizedMagVar = magneticVariation;
            }
            else {
                normalizedMagVar = magneticVariation - 360;
            }
            return normalizedMagVar;
        }
        /**
         * Gets the magnetic variation for a given latitude and longitude.
         * @param lat The latitude to get a magvar for.
         * @param lon The longitude to get a magvar for.
         * @returns The magnetic variation at the specific latitude and longitude.
         */
        static getMagvar(lat, lon) {
            return GeoMath.magneticModel.declination(0, lat, lon, 2020);
        }
    }
    GeoMath.magneticModel = new WorldMagneticModel();

    /**
     * Creating a new waypoint to be added to a flight plan.
     */
    class WaypointBuilder {
        /**
         * Builds a WayPoint from basic data.
         * @param ident The ident of the waypoint to be created.
         * @param coordinates The coordinates of the waypoint.
         * @param instrument The base instrument instance.
         * @returns The built waypoint.
         */
        static fromCoordinates(ident, coordinates, instrument) {
            const waypoint = new WayPoint(instrument);
            waypoint.type = 'W';
            waypoint.infos = new IntersectionInfo(instrument);
            waypoint.infos.coordinates = coordinates;
            waypoint.ident = ident;
            waypoint.infos.ident = ident;
            return waypoint;
        }
        /**
         * Builds a WayPoint from a refrence waypoint.
         * @param ident The ident of the waypoint to be created.
         * @param placeCoordinates The coordinates of the reference waypoint.
         * @param bearing The magnetic bearing from the reference waypoint.
         * @param distance The distance from the reference waypoint.
         * @param instrument The base instrument instance.
         * @returns The built waypoint.
         */
        static fromPlaceBearingDistance(ident, placeCoordinates, bearing, distance, instrument) {
            const magvar = GeoMath.getMagvar(placeCoordinates.lat, placeCoordinates.long);
            let trueBearing = GeoMath.removeMagvar(bearing, magvar);
            trueBearing = trueBearing < 0 ? 360 + trueBearing : trueBearing > 360 ? trueBearing - 360 : trueBearing;
            const coordinates = Avionics.Utils.bearingDistanceToCoordinates(trueBearing, distance, placeCoordinates.lat, placeCoordinates.long);
            return WaypointBuilder.fromCoordinates(ident, coordinates, instrument);
        }
        /**
         * Builds a WayPoint at a distance from an existing waypoint along the flight plan.
         * @param ident The ident of the waypoint to be created.
         * @param placeIndex The index of the reference waypoint in the flight plan.
         * @param distance The distance from the reference waypoint.
         * @param instrument The base instrument instance.
         * @param fpm The flightplanmanager instance.
         * @returns The built waypoint.
         */
        static fromPlaceAlongFlightPlan(ident, placeIndex, distance, instrument, fpm) {
            console.log("running fromPlaceAlongFlightPlan");
            console.log("destination? " + fpm.getDestination() ? "True" : "False");
            const destinationDistanceInFlightplan = fpm.getDestination().cumulativeDistanceInFP;
            console.log("destinationDistanceInFlightplan " + destinationDistanceInFlightplan);
            const placeDistanceFromDestination = fpm.getWaypoint(placeIndex, NaN, true).cumulativeDistanceInFP;
            console.log("placeDistanceFromDestination " + placeDistanceFromDestination);
            const distanceFromDestination = destinationDistanceInFlightplan - placeDistanceFromDestination - distance;
            console.log("distanceFromDestination " + distanceFromDestination);
            const coordinates = fpm.getCoordinatesAtNMFromDestinationAlongFlightPlan(distanceFromDestination);
            return WaypointBuilder.fromCoordinates(ident, coordinates, instrument);
        }
    }

    /** A class for syncing a flight plan with the game */
    class FlightPlanAsoboSync {
        static init() {
            if (!FlightPlanAsoboSync.fpListenerInitialized) {
                RegisterViewListener("JS_LISTENER_FLIGHTPLAN");
                FlightPlanAsoboSync.fpListenerInitialized = true;
            }
        }
        static LoadFromGame(fpln) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("LOAD FPLN");
                return new Promise((resolve, reject) => {
                    FlightPlanAsoboSync.init();
                    setTimeout(() => {
                        Coherent.call("LOAD_CURRENT_GAME_FLIGHT");
                        Coherent.call("LOAD_CURRENT_ATC_FLIGHTPLAN");
                        setTimeout(() => {
                            Coherent.call("GET_FLIGHTPLAN").then((data) => __awaiter(this, void 0, void 0, function* () {
                                console.log("COHERENT GET_FLIGHTPLAN received");
                                const isDirectTo = data.isDirectTo;
                                // TODO: talk to matt about dirto
                                if (!isDirectTo) {
                                    if (data.waypoints.length === 0) {
                                        resolve();
                                        return;
                                    }
                                    yield fpln._parentInstrument.facilityLoader.getFacilityRaw(data.waypoints[0].icao, 10000);
                                    // set origin
                                    yield fpln.setOrigin(data.waypoints[0].icao);
                                    // set dest
                                    yield fpln.setDestination(data.waypoints[data.waypoints.length - 1].icao);
                                    // set route
                                    const enrouteStart = (data.departureWaypointsSize == -1) ? 1 : data.departureWaypointsSize;
                                    const enroute = data.waypoints.slice(enrouteStart);
                                    for (let i = 0; i < enroute.length - 1; i++) {
                                        const wpt = enroute[i];
                                        console.log(wpt.icao);
                                        if (wpt.icao.trim() !== "") {
                                            yield fpln.addWaypoint(wpt.icao);
                                        }
                                        else if (wpt.ident === "Custom") {
                                            const cwpt = WaypointBuilder.fromCoordinates("CUST" + i, wpt.lla, fpln._parentInstrument);
                                            yield fpln.addUserWaypoint(cwpt);
                                        }
                                    }
                                    // set departure
                                    //  rwy index
                                    yield fpln.setOriginRunwayIndex(data.originRunwayIndex);
                                    //  proc index
                                    yield fpln.setDepartureProcIndex(data.departureProcIndex);
                                    yield fpln.setDepartureRunwayIndex(data.departureRunwayIndex);
                                    //  enroutetrans index
                                    yield fpln.setDepartureEnRouteTransitionIndex(data.departureEnRouteTransitionIndex);
                                    // set arrival
                                    //  arrivalproc index
                                    yield fpln.setArrivalProcIndex(data.arrivalProcIndex);
                                    //  arrivaltrans index
                                    yield fpln.setArrivalEnRouteTransitionIndex(data.arrivalEnRouteTransitionIndex);
                                    // set approach
                                    //  approach index
                                    yield fpln.setApproachIndex(data.approachIndex);
                                    //  approachtrans index
                                    yield fpln.setApproachTransitionIndex(data.approachTransitionIndex);
                                    this.fpChecksum = fpln.getCurrentFlightPlan().checksum;
                                    resolve();
                                }
                            }));
                        }, 500);
                    }, 200);
                });
            });
        }
        static SaveToGame(fpln) {
            return __awaiter(this, void 0, void 0, function* () {
                // eslint-disable-next-line no-async-promise-executor
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    FlightPlanAsoboSync.init();
                    const plan = fpln.getCurrentFlightPlan();
                    if (WTDataStore.get('WT_CJ4_FPSYNC', 0) !== 0 && (plan.checksum !== this.fpChecksum)) {
                        // await Coherent.call("CREATE_NEW_FLIGHTPLAN");
                        yield Coherent.call("SET_CURRENT_FLIGHTPLAN_INDEX", 0).catch(console.log);
                        yield Coherent.call("CLEAR_CURRENT_FLIGHT_PLAN").catch(console.log);
                        if (plan.hasOrigin && plan.hasDestination) {
                            if (plan.hasOrigin) {
                                yield Coherent.call("SET_ORIGIN", plan.originAirfield.icao, false);
                            }
                            if (plan.hasDestination) {
                                yield Coherent.call("SET_DESTINATION", plan.destinationAirfield.icao, false);
                            }
                            let coIndex = 1;
                            for (let i = 0; i < plan.enroute.waypoints.length; i++) {
                                const wpt = plan.enroute.waypoints[i];
                                if (wpt.icao.trim() !== "") {
                                    yield Coherent.call("ADD_WAYPOINT", wpt.icao, coIndex, false);
                                    coIndex++;
                                }
                            }
                            yield Coherent.call("SET_ORIGIN_RUNWAY_INDEX", plan.procedureDetails.originRunwayIndex).catch(console.log);
                            yield Coherent.call("SET_DEPARTURE_RUNWAY_INDEX", plan.procedureDetails.departureRunwayIndex);
                            yield Coherent.call("SET_DEPARTURE_PROC_INDEX", plan.procedureDetails.departureIndex);
                            yield Coherent.call("SET_DEPARTURE_ENROUTE_TRANSITION_INDEX", plan.procedureDetails.departureTransitionIndex);
                            yield Coherent.call("SET_ARRIVAL_RUNWAY_INDEX", plan.procedureDetails.arrivalRunwayIndex);
                            yield Coherent.call("SET_ARRIVAL_PROC_INDEX", plan.procedureDetails.arrivalIndex);
                            yield Coherent.call("SET_ARRIVAL_ENROUTE_TRANSITION_INDEX", plan.procedureDetails.arrivalTransitionIndex);
                            yield Coherent.call("SET_APPROACH_INDEX", plan.procedureDetails.approachIndex).then(() => {
                                Coherent.call("SET_APPROACH_TRANSITION_INDEX", plan.procedureDetails.approachTransitionIndex);
                            });
                        }
                        this.fpChecksum = plan.checksum;
                    }
                    Coherent.call("RECOMPUTE_ACTIVE_WAYPOINT_INDEX");
                }));
            });
        }
    }
    FlightPlanAsoboSync.fpChecksum = 0;
    FlightPlanAsoboSync.fpListenerInitialized = false;

    /**
     * A segment of a flight plan.
     */
    class FlightPlanSegment {
        /**
         * Creates a new FlightPlanSegment.
         * @param type The type of the flight plan segment.
         * @param offset The offset within the original flight plan that
         * the segment starts at.
         * @param waypoints The waypoints in the flight plan segment.
         */
        constructor(type, offset, waypoints) {
            this.type = type;
            this.offset = offset;
            this.waypoints = waypoints;
        }
    }
    /** An empty flight plan segment. */
    FlightPlanSegment.Empty = new FlightPlanSegment(-1, -1, []);
    (function (SegmentType) {
        /** The origin airfield segment. */
        SegmentType[SegmentType["Origin"] = 0] = "Origin";
        /** The departure segment. */
        SegmentType[SegmentType["Departure"] = 1] = "Departure";
        /** The enroute segment. */
        SegmentType[SegmentType["Enroute"] = 2] = "Enroute";
        /** The arrival segment. */
        SegmentType[SegmentType["Arrival"] = 3] = "Arrival";
        /** The approach segment. */
        SegmentType[SegmentType["Approach"] = 4] = "Approach";
        /** The missed approach segment. */
        SegmentType[SegmentType["Missed"] = 5] = "Missed";
        /** The destination airfield segment. */
        SegmentType[SegmentType["Destination"] = 6] = "Destination";
    })(exports.SegmentType || (exports.SegmentType = {}));

    /** Generates fix names based on the ARINC default naming scheme. */
    class FixNamingScheme {
        /**
         * Generates a fix name for a course to distance type fix.
         * @param course The course that will be flown.
         * @param distance The distance along the course or from the reference fix.
         * @returns The generated fix name.
         */
        static courseToDistance(course, distance) {
            const roundedDistance = Math.round(distance);
            const distanceAlpha = distance > 26 ? 'Z' : this.alphabet[roundedDistance];
            return `D${course.toFixed(0).padStart(3, '0')}${distanceAlpha}`;
        }
        /**
         * Generates a fix name for a course turn to intercept type fix.
         * @param course The course that will be turned to.
         * @returns The generated fix name.
         */
        static courseToIntercept(course) {
            return `I${course.toFixed(0).padStart(3, '0')}`;
        }
    }
    FixNamingScheme.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
        'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    /**
     * Details of a hold procedure for a fix.
     */
    class HoldDetails {
        /**
         * Creates a default set of hold details.
         * @param course The course to create the hold details for.
         * @param courseTowardsHoldFix The course to the hold fix.
         * @returns A new set of hold details.
         */
        static createDefault(course, courseTowardsHoldFix) {
            const details = new HoldDetails();
            details.holdCourse = course;
            details.holdSpeedType = exports.HoldSpeedType.FAA;
            details.legTime = 60;
            details.speed = Math.max(Simplane.getGroundSpeed(), 140);
            details.windDirection = SimVar.GetSimVarValue("AMBIENT WIND DIRECTION", "degrees");
            details.windSpeed = SimVar.GetSimVarValue("AMBIENT WIND VELOCITY", "knots");
            details.legDistance = details.legTime * (details.speed / 3600);
            details.turnDirection = exports.HoldTurnDirection.Right;
            details.state = exports.HoldState.None;
            details.entryType = HoldDetails.calculateEntryType(course, courseTowardsHoldFix, details.turnDirection);
            return details;
        }
        /**
         * Calculates a hold entry type given the hold course and current
         * inbound course. See FMS guide page 14-21.
         * @param holdCourse The course that the hold will be flown with.
         * @param inboundCourse The course that is being flown towards the hold point.
         * @param turnDirection The direction of the hold turn.
         * @returns The hold entry type for a given set of courses.
         */
        static calculateEntryType(holdCourse, inboundCourse, turnDirection) {
            const courseDiff = Avionics.Utils.angleDiff(inboundCourse, holdCourse);
            if (turnDirection === exports.HoldTurnDirection.Right) {
                if (courseDiff >= -130 && courseDiff <= 70) {
                    return exports.HoldEntry.Direct;
                }
                else if (courseDiff < -130 || courseDiff > 175) {
                    return exports.HoldEntry.Teardrop;
                }
                else {
                    return exports.HoldEntry.Parallel;
                }
            }
            else {
                if (courseDiff >= -130 && courseDiff <= 70) {
                    return exports.HoldEntry.Direct;
                }
                else if (courseDiff > 70 || courseDiff < -175) {
                    return exports.HoldEntry.Teardrop;
                }
                else {
                    return exports.HoldEntry.Parallel;
                }
            }
        }
    }
    (function (HoldSpeedType) {
        /** Use FAA hold speed rules. */
        HoldSpeedType[HoldSpeedType["FAA"] = 0] = "FAA";
        /** Use ICAO hold speed rules. */
        HoldSpeedType[HoldSpeedType["ICAO"] = 1] = "ICAO";
    })(exports.HoldSpeedType || (exports.HoldSpeedType = {}));
    (function (HoldTurnDirection) {
        /** Use a right hand turn. */
        HoldTurnDirection[HoldTurnDirection["Right"] = 0] = "Right";
        /** Use a left hand turn. */
        HoldTurnDirection[HoldTurnDirection["Left"] = 1] = "Left";
    })(exports.HoldTurnDirection || (exports.HoldTurnDirection = {}));
    (function (HoldState) {
        /** The hold is not active. */
        HoldState[HoldState["None"] = 0] = "None";
        /** The hold is currently being entered. */
        HoldState[HoldState["Entering"] = 1] = "Entering";
        /** The hold is active. */
        HoldState[HoldState["Holding"] = 2] = "Holding";
        /** The hold is being exited. */
        HoldState[HoldState["Exiting"] = 3] = "Exiting";
    })(exports.HoldState || (exports.HoldState = {}));
    (function (HoldEntry) {
        /** Direct hold entry. */
        HoldEntry[HoldEntry["Direct"] = 0] = "Direct";
        /** Teardrop hold entry. */
        HoldEntry[HoldEntry["Teardrop"] = 1] = "Teardrop";
        /** Parallel hold entry. */
        HoldEntry[HoldEntry["Parallel"] = 2] = "Parallel";
    })(exports.HoldEntry || (exports.HoldEntry = {}));

    /**
     * A class for mapping raw facility data to WayPoints.
     */
    class RawDataMapper {
        /**
         * Maps a raw facility record to a WayPoint.
         * @param facility The facility record to map.
         * @param instrument The instrument to attach to the WayPoint.
         * @returns The mapped waypoint.
         */
        static toWaypoint(facility, instrument) {
            const waypoint = new WayPoint(instrument);
            waypoint.ident = facility.icao.substring(7, 12).trim();
            waypoint.icao = facility.icao;
            waypoint.type = facility.icao[0];
            switch (waypoint.type) {
                case 'A':
                    {
                        const info = new AirportInfo(instrument);
                        info.CopyBaseInfosFrom(waypoint);
                        info.UpdateNamedFrequencies();
                        info.approaches = facility.approaches;
                        info.approaches.forEach(approach => approach.transitions.forEach(trans => trans.name = trans.legs[0].fixIcao.substring(7, 12).trim()));
                        info.departures = facility.departures;
                        info.departures.forEach(departure => departure.runwayTransitions.forEach(trans => trans.name = RawDataMapper.generateRunwayTransitionName(trans)));
                        info.departures.forEach(departure => departure.enRouteTransitions.forEach(trans => trans.name = RawDataMapper.generateDepartureEnRouteTransitionName(trans)));
                        info.arrivals = facility.arrivals;
                        info.arrivals.forEach(arrival => arrival.runwayTransitions.forEach(trans => trans.name = RawDataMapper.generateRunwayTransitionName(trans)));
                        info.arrivals.forEach(arrival => arrival.enRouteTransitions.forEach(trans => trans.name = RawDataMapper.generateArrivalTransitionName(trans)));
                        info.runways = facility.runways;
                        info.oneWayRunways = [];
                        facility.runways.forEach(runway => info.oneWayRunways.push(...Object.assign(new Runway(), runway).splitIfTwoWays()));
                        info.oneWayRunways.sort(RawDataMapper.sortRunways);
                        waypoint.infos = info;
                    }
                    break;
                case 'V':
                    waypoint.infos = new VORInfo(instrument);
                    break;
                case 'N':
                    waypoint.infos = new NDBInfo(instrument);
                    break;
                case 'W':
                    waypoint.infos = new IntersectionInfo(instrument);
                    break;
                default:
                    waypoint.infos = new WayPointInfo(instrument);
                    break;
            }
            if (waypoint.type !== 'A') {
                waypoint.infos.CopyBaseInfosFrom(waypoint);
                waypoint.infos.routes = facility.routes;
            }
            waypoint.infos.coordinates = new LatLongAlt(facility.lat, facility.lon);
            return waypoint;
        }
        /**
         * A comparer for sorting runways by number, and then by L, C, and R.
         * @param r1 The first runway to compare.
         * @param r2 The second runway to compare.
         * @returns -1 if the first is before, 0 if equal, 1 if the first is after.
         */
        static sortRunways(r1, r2) {
            if (parseInt(r1.designation) === parseInt(r2.designation)) {
                let v1 = 0;
                if (r1.designation.indexOf("L") != -1) {
                    v1 = 1;
                }
                else if (r1.designation.indexOf("C") != -1) {
                    v1 = 2;
                }
                else if (r1.designation.indexOf("R") != -1) {
                    v1 = 3;
                }
                let v2 = 0;
                if (r2.designation.indexOf("L") != -1) {
                    v2 = 1;
                }
                else if (r2.designation.indexOf("C") != -1) {
                    v2 = 2;
                }
                else if (r2.designation.indexOf("R") != -1) {
                    v2 = 3;
                }
                return v1 - v2;
            }
            return parseInt(r1.designation) - parseInt(r2.designation);
        }
        /**
         * Generates a runway transition name from the designated runway in the transition data.
         * @param runwayTransition The runway transition to generate the name for.
         * @returns The runway transition name.
         */
        static generateRunwayTransitionName(runwayTransition) {
            let name = `RW${runwayTransition.runwayNumber}`;
            switch (runwayTransition.runwayDesignation) {
                case 1:
                    name += "L";
                    break;
                case 2:
                    name += "R";
                    break;
                case 3:
                    name += "C";
                    break;
            }
            return name;
        }
        /**
         * Generates an arrival transition name from a provided arrival enroute transition.
         * @param enrouteTransition The enroute transition to generate a name for.
         * @returns The generated transition name.
         */
        static generateArrivalTransitionName(enrouteTransition) {
            return enrouteTransition.legs[0].fixIcao.substring(7, 12).trim();
        }
        /**
         * Generates a departure transition name from a provided departure enroute transition.
         * @param enrouteTransition The enroute transition to generate a name for.
         * @returns The generated transition name.
         */
        static generateDepartureEnRouteTransitionName(enrouteTransition) {
            return enrouteTransition.legs[enrouteTransition.legs.length - 1].fixIcao.substring(7, 12).trim();
        }
    }

    /**
     * Creates a collection of waypoints from a legs procedure.
     */
    class LegsProcedure {
        /**
         * Creates an instance of a LegsProcedure.
         * @param _legs The legs that are part of the procedure.
         * @param _previousFix The previous fix before the procedure starts.
         * @param _fixMinusTwo The fix before the previous fix.
         * @param _instrument The instrument that is attached to the flight plan.
         */
        constructor(_legs, _previousFix, _fixMinusTwo, _instrument) {
            this._legs = _legs;
            this._previousFix = _previousFix;
            this._fixMinusTwo = _fixMinusTwo;
            this._instrument = _instrument;
            /** The current index in the procedure. */
            this._currentIndex = 0;
            /** Whether or not there is a discontinuity pending to be mapped. */
            this._isDiscontinuityPending = false;
            /** A collection of the loaded facilities needed for this procedure. */
            this._facilities = new Map();
            /** Whether or not the facilities have completed loading. */
            this._facilitiesLoaded = false;
            /**The collection of facility promises to await on first load. */
            this._facilitiesToLoad = new Map();
            /** Whether or not a non initial-fix procedure start has been added to the procedure. */
            this._addedProcedureStart = false;
            /** A collection of filtering rules for filtering ICAO data to pre-load for the procedure. */
            this.legFilteringRules = [
                icao => icao.trim() !== '',
                //Icao is not empty
                icao => icao[0] !== 'R',
                //Icao is not runway icao, which is not searchable
                icao => icao[0] !== 'A',
                //Icao is not airport icao, which can be skipped
                icao => icao.substr(1, 2) !== '  ',
                //Icao is not missing a region code
                icao => !this._facilitiesToLoad.has(icao) //Icao is not already being loaded
            ];
            for (const leg of this._legs) {
                if (this.isIcaoValid(leg.fixIcao)) {
                    this._facilitiesToLoad.set(leg.fixIcao, this._instrument.facilityLoader.getFacilityRaw(leg.fixIcao, 2000));
                }
                if (this.isIcaoValid(leg.originIcao)) {
                    this._facilitiesToLoad.set(leg.originIcao, this._instrument.facilityLoader.getFacilityRaw(leg.originIcao, 2000));
                }
            }
        }
        /**
         * Checks whether or not there are any legs remaining in the procedure.
         * @returns True if there is a next leg, false otherwise.
         */
        hasNext() {
            return this._currentIndex < this._legs.length || this._isDiscontinuityPending;
        }
        /**
         * Gets the next mapped leg from the procedure.
         * @returns The mapped waypoint from the leg of the procedure.
         */
        getNext() {
            return __awaiter(this, void 0, void 0, function* () {
                let isLegMappable = false;
                let mappedLeg;
                if (!this._facilitiesLoaded) {
                    const facilityResults = yield Promise.all(this._facilitiesToLoad.values());
                    for (const facility of facilityResults.filter(f => f !== undefined)) {
                        this._facilities.set(facility.icao, facility);
                    }
                    this._facilitiesLoaded = true;
                }
                while (!isLegMappable && this._currentIndex < this._legs.length) {
                    const currentLeg = this._legs[this._currentIndex];
                    isLegMappable = true;
                    //Some procedures don't start with 15 (initial fix) but instead start with a heading and distance from
                    //a fix: the procedure then starts with the fix exactly
                    if (this._currentIndex === 0 && currentLeg.type === 10 && !this._addedProcedureStart) {
                        mappedLeg = this.mapExactFix(currentLeg, this._previousFix);
                        this._addedProcedureStart = true;
                    }
                    else {
                        try {
                            switch (currentLeg.type) {
                                case 3:
                                    mappedLeg = this.mapHeadingUntilDistanceFromOrigin(currentLeg, this._previousFix);
                                    break;
                                case 4:
                                    //Only map if the fix is itself not a runway fix to avoid double
                                    //adding runway fixes
                                    if (currentLeg.fixIcao === '' || currentLeg.fixIcao[0] !== 'R') {
                                        mappedLeg = this.mapOriginRadialForDistance(currentLeg, this._previousFix);
                                    }
                                    else {
                                        isLegMappable = false;
                                    }
                                    break;
                                case 5:
                                case 21:
                                    mappedLeg = this.mapHeadingToInterceptNextLeg(currentLeg, this._previousFix, this._legs[this._currentIndex + 1]);
                                    break;
                                case 6:
                                case 23:
                                    mappedLeg = this.mapHeadingUntilRadialCrossing(currentLeg, this._previousFix);
                                    break;
                                case 9:
                                case 10:
                                    mappedLeg = this.mapBearingAndDistanceFromOrigin(currentLeg);
                                    break;
                                case 11:
                                case 22:
                                    mappedLeg = this.mapVectors(currentLeg, this._previousFix);
                                    break;
                                case 14:
                                    mappedLeg = this.mapHold(currentLeg, this._fixMinusTwo);
                                    break;
                                case 15:
                                    {
                                        if (currentLeg.fixIcao[0] !== 'A') {
                                            const leg = this.mapExactFix(currentLeg, this._previousFix);
                                            const prevLeg = this._previousFix;
                                            //If a type 15 (initial fix) comes up in the middle of a plan
                                            if (leg.icao === prevLeg.icao && leg.infos.coordinates.lat === prevLeg.infos.coordinates.lat
                                                && leg.infos.coordinates.long === prevLeg.infos.coordinates.long) {
                                                isLegMappable = false;
                                            }
                                            else {
                                                mappedLeg = leg;
                                            }
                                        }
                                        //If type 15 is an airport itself, we don't need to map it (and the data is generally wrong)
                                        else {
                                            isLegMappable = false;
                                        }
                                    }
                                    break;
                                case 7:
                                case 17:
                                case 18:
                                    mappedLeg = this.mapExactFix(currentLeg, this._previousFix);
                                    break;
                                case 2:
                                case 19:
                                    mappedLeg = this.mapHeadingUntilAltitude(currentLeg, this._previousFix);
                                    break;
                                default:
                                    isLegMappable = false;
                                    break;
                            }
                        }
                        catch (err) {
                            console.log(`LegsProcedure: Unexpected unmappable leg: ${err}`);
                        }
                        if (mappedLeg !== undefined) {
                            if (this.altitudeIsVerticalAngleInfo(currentLeg)) {
                                mappedLeg.legAltitudeDescription = 1;
                                mappedLeg.legAltitude1 = 100 * Math.round((currentLeg.altitude2 * 3.28084) / 100);
                                mappedLeg.legAltitude2 = 100 * Math.round((currentLeg.altitude1 * 3.28084) / 100);
                            }
                            else {
                                mappedLeg.legAltitudeDescription = currentLeg.altDesc;
                                mappedLeg.legAltitude1 = 100 * Math.round((currentLeg.altitude1 * 3.28084) / 100);
                                mappedLeg.legAltitude2 = 100 * Math.round((currentLeg.altitude2 * 3.28084) / 100);
                            }
                        }
                        this._currentIndex++;
                    }
                }
                if (mappedLeg !== undefined) {
                    this._fixMinusTwo = this._previousFix;
                    this._previousFix = mappedLeg;
                    return mappedLeg;
                }
                else {
                    return undefined;
                }
            });
        }
        altitudeIsVerticalAngleInfo(leg) {
            return (leg.type === 4 || leg.type === 18)
                && (leg.altDesc === 1 || leg.altDesc === 2)
                && (leg.altitude1 > 0 && leg.altitude2 > 0);
        }
        /**
         * Maps a heading until distance from origin leg.
         * @param leg The procedure leg to map.
         * @param prevLeg The previously mapped waypoint in the procedure.
         * @returns The mapped leg.
         */
        mapHeadingUntilDistanceFromOrigin(leg, prevLeg) {
            const origin = this._facilities.get(leg.originIcao);
            const originIdent = origin.icao.substring(7, 12).trim();
            const bearingToOrigin = Avionics.Utils.computeGreatCircleHeading(prevLeg.infos.coordinates, new LatLongAlt(origin.lat, origin.lon));
            const distanceToOrigin = Avionics.Utils.computeGreatCircleDistance(prevLeg.infos.coordinates, new LatLongAlt(origin.lat, origin.lon)) / LegsProcedure.distanceNormalFactorNM;
            const deltaAngle = this.deltaAngleRadians(bearingToOrigin, leg.course);
            const targetDistance = (leg.distance / 1852) / LegsProcedure.distanceNormalFactorNM;
            const distanceAngle = Math.asin((Math.sin(distanceToOrigin) * Math.sin(deltaAngle)) / Math.sin(targetDistance));
            const inverseDistanceAngle = Math.PI - distanceAngle;
            const legDistance1 = 2 * Math.atan(Math.tan(0.5 * (targetDistance - distanceToOrigin)) * (Math.sin(0.5 * (deltaAngle + distanceAngle))
                / Math.sin(0.5 * (deltaAngle - distanceAngle))));
            const legDistance2 = 2 * Math.atan(Math.tan(0.5 * (targetDistance - distanceToOrigin)) * (Math.sin(0.5 * (deltaAngle + inverseDistanceAngle))
                / Math.sin(0.5 * (deltaAngle - inverseDistanceAngle))));
            const legDistance = targetDistance > distanceToOrigin ? legDistance1 : Math.min(legDistance1, legDistance2);
            const course = leg.course + GeoMath.getMagvar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
            const coordinates = Avionics.Utils.bearingDistanceToCoordinates(course, legDistance * LegsProcedure.distanceNormalFactorNM, prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
            return this.buildWaypoint(`${originIdent}${Math.trunc(legDistance * LegsProcedure.distanceNormalFactorNM)}`, coordinates);
        }
        /**
         * Maps a bearing/distance fix in the procedure.
         * @param leg The procedure leg to map.
         * @returns The mapped leg.
         */
        mapBearingAndDistanceFromOrigin(leg) {
            const origin = this._facilities.get(leg.originIcao);
            const originIdent = origin.icao.substring(7, 12).trim();
            const course = leg.course + GeoMath.getMagvar(origin.lat, origin.lon);
            const coordinates = Avionics.Utils.bearingDistanceToCoordinates(leg.course, leg.distance / 1852, origin.lat, origin.lon);
            return this.buildWaypoint(`${originIdent}${Math.trunc(leg.distance / 1852)}`, coordinates);
        }
        /**
         * Maps a radial on the origin for a specified distance leg in the procedure.
         * @param leg The procedure leg to map.
         * @param prevLeg The previously mapped leg.
         * @returns The mapped leg.
         */
        mapOriginRadialForDistance(leg, prevLeg) {
            if (leg.fixIcao.trim() !== '') {
                return this.mapExactFix(leg, prevLeg);
            }
            else {
                const origin = this._facilities.get(leg.originIcao);
                const originIdent = origin.icao.substring(7, 12).trim();
                const course = leg.course + GeoMath.getMagvar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
                const coordinates = Avionics.Utils.bearingDistanceToCoordinates(course, leg.distance / 1852, prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
                const distanceFromOrigin = Avionics.Utils.computeGreatCircleDistance(new LatLongAlt(origin.lat, origin.lon), coordinates);
                return this.buildWaypoint(`${originIdent}${Math.trunc(distanceFromOrigin / 1852)}`, coordinates);
            }
        }
        /**
         * Maps a heading turn to intercept the next leg in the procedure.
         * @param leg The procedure leg to map.
         * @param prevLeg The previously mapped leg.
         * @param nextLeg The next leg in the procedure to intercept.
         * @returns The mapped leg.
         */
        mapHeadingToInterceptNextLeg(leg, prevLeg, nextLeg) {
            let referenceCoordinates;
            let courseToIntercept;
            let referenceFix;
            switch (nextLeg.type) {
                case 4:
                case 7:
                case 15:
                case 17:
                case 18:
                    referenceFix = this._facilities.get(nextLeg.fixIcao);
                    referenceCoordinates = new LatLongAlt(referenceFix.lat, referenceFix.lon);
                    courseToIntercept = nextLeg.course - 180;
                    if (courseToIntercept < 0) {
                        courseToIntercept += 360;
                    }
                    break;
                case 9:
                    referenceFix = this._facilities.get(nextLeg.originIcao);
                    referenceCoordinates = new LatLongAlt(referenceFix.lat, referenceFix.lon);
                    courseToIntercept = nextLeg.course;
                    break;
            }
            if (referenceCoordinates !== undefined && courseToIntercept !== undefined) {
                const distanceFromOrigin = Avionics.Utils.computeGreatCircleDistance(prevLeg.infos.coordinates, referenceCoordinates);
                const bearingToOrigin = Avionics.Utils.computeGreatCircleHeading(prevLeg.infos.coordinates, referenceCoordinates);
                const bearingFromOrigin = Avionics.Utils.computeGreatCircleHeading(referenceCoordinates, prevLeg.infos.coordinates);
                const ang1 = this.deltaAngleRadians(bearingToOrigin, leg.course);
                const ang2 = this.deltaAngleRadians(bearingFromOrigin, courseToIntercept);
                const ang3 = Math.acos(Math.sin(ang1) * Math.sin(ang2) * Math.cos(distanceFromOrigin / LegsProcedure.distanceNormalFactorNM) - Math.cos(ang1) * Math.cos(ang2));
                const legDistance = Math.acos((Math.cos(ang1) + Math.cos(ang2) * Math.cos(ang3)) / (Math.sin(ang2) * Math.sin(ang3))) * LegsProcedure.distanceNormalFactorNM;
                const course = leg.course + GeoMath.getMagvar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
                const coordinates = Avionics.Utils.bearingDistanceToCoordinates(course, legDistance, prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
                return this.buildWaypoint(FixNamingScheme.courseToIntercept(course), coordinates);
            }
        }
        /**
         * Maps flying a heading until crossing a radial of a reference fix.
         * @param leg The procedure leg to map.
         * @param prevLeg The previously mapped leg.
         * @returns The mapped leg.
         */
        mapHeadingUntilRadialCrossing(leg, prevLeg) {
            const origin = this._facilities.get(leg.originIcao);
            const originCoordinates = new LatLongAlt(origin.lat, origin.lon);
            const originToCoordinates = Avionics.Utils.computeGreatCircleHeading(originCoordinates, prevLeg.infos.coordinates);
            const coordinatesToOrigin = Avionics.Utils.computeGreatCircleHeading(prevLeg.infos.coordinates, new LatLongAlt(origin.lat, origin.lon));
            const distanceToOrigin = Avionics.Utils.computeGreatCircleDistance(prevLeg.infos.coordinates, originCoordinates) / LegsProcedure.distanceNormalFactorNM;
            const alpha = this.deltaAngleRadians(coordinatesToOrigin, leg.course);
            const beta = this.deltaAngleRadians(originToCoordinates, leg.theta);
            const gamma = Math.acos(Math.sin(alpha) * Math.sin(beta) * Math.cos(distanceToOrigin) - Math.cos(alpha) * Math.cos(beta));
            const legDistance = Math.acos((Math.cos(beta) + Math.cos(alpha) * Math.cos(gamma)) / (Math.sin(alpha) * Math.sin(gamma)));
            const course = leg.course + GeoMath.getMagvar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
            const coordinates = Avionics.Utils.bearingDistanceToCoordinates(course, legDistance * LegsProcedure.distanceNormalFactorNM, prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
            return this.buildWaypoint(`${this.getIdent(origin.icao)}${leg.theta}`, coordinates);
        }
        /**
         * Maps flying a heading until a proscribed altitude.
         * @param leg The procedure leg to map.
         * @param prevLeg The previous leg in the procedure.
         * @returns The mapped leg.
         */
        mapHeadingUntilAltitude(leg, prevLeg) {
            const altitudeFeet = (leg.altitude1 * 3.2808399);
            const distanceInNM = altitudeFeet / 750.0;
            const course = leg.course + GeoMath.getMagvar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
            const coordinates = GeoMath.relativeBearingDistanceToCoords(course, distanceInNM, prevLeg.infos.coordinates);
            return this.buildWaypoint(`(${Math.trunc(altitudeFeet)})`, coordinates, prevLeg.infos.magneticVariation);
        }
        /**
         * Maps a vectors instruction.
         * @param leg The procedure leg to map.
         * @param prevLeg The previous leg in the procedure.
         * @returns The mapped leg.
         */
        mapVectors(leg, prevLeg) {
            const course = leg.course + GeoMath.getMagvar(prevLeg.infos.coordinates.lat, prevLeg.infos.coordinates.long);
            const coordinates = GeoMath.relativeBearingDistanceToCoords(course, 5, prevLeg.infos.coordinates);
            const waypoint = this.buildWaypoint('(VECT)', coordinates);
            waypoint.isVectors = true;
            waypoint.endsInDiscontinuity = true;
            return waypoint;
        }
        /**
         * Maps an exact fix leg in the procedure.
         * @param leg The procedure leg to map.
         * @param prevLeg The previous mapped leg in the procedure.
         * @returns The mapped leg.
         */
        mapExactFix(leg, prevLeg) {
            const facility = this._facilities.get(leg.fixIcao);
            if (facility) {
                return RawDataMapper.toWaypoint(facility, this._instrument);
            }
            else {
                const origin = this._facilities.get(leg.originIcao);
                const originIdent = origin.icao.substring(7, 12).trim();
                const coordinates = Avionics.Utils.bearingDistanceToCoordinates(leg.theta, leg.rho / 1852, origin.lat, origin.lon);
                return this.buildWaypoint(`${originIdent}${Math.trunc(leg.rho / 1852)}`, coordinates);
            }
        }
        /**
         * Maps a hold leg in the procedure.
         * @param leg The procedure leg to map.
         * @param fixMinusTwo The fix that is two previous to this leg.
         * @returns The mapped leg.
         */
        mapHold(leg, fixMinusTwo) {
            const facility = this._facilities.get(leg.fixIcao);
            const waypoint = RawDataMapper.toWaypoint(facility, this._instrument);
            waypoint.hasHold = true;
            const course = Avionics.Utils.computeGreatCircleHeading(fixMinusTwo.infos.coordinates, waypoint.infos.coordinates);
            const holdDetails = HoldDetails.createDefault(leg.course, course);
            holdDetails.turnDirection = leg.turnDirection === 1 ? exports.HoldTurnDirection.Left : exports.HoldTurnDirection.Right;
            holdDetails.entryType = HoldDetails.calculateEntryType(leg.course, course, holdDetails.turnDirection);
            waypoint.holdDetails = holdDetails;
            return waypoint;
        }
        /**
         * Gets the difference between two headings in zero north normalized radians.
         * @param a The degrees of heading a.
         * @param b The degrees of heading b.
         * @returns The difference between the two headings in zero north normalized radians.
         */
        deltaAngleRadians(a, b) {
            return Math.abs((Avionics.Utils.fmod((a - b) + 180, 360) - 180) * Avionics.Utils.DEG2RAD);
        }
        /**
         * Gets an ident from an ICAO.
         * @param icao The icao to pull the ident from.
         * @returns The parsed ident.
         */
        getIdent(icao) {
            return icao.substring(7, 12).trim();
        }
        /**
         * Checks if an ICAO is valid to load.
         * @param icao The icao to check.
         * @returns Whether or not the ICAO is valid.
         */
        isIcaoValid(icao) {
            for (const rule of this.legFilteringRules) {
                if (!rule(icao)) {
                    return false;
                }
            }
            return true;
        }
        /**
         * Builds a WayPoint from basic data.
         * @param ident The ident of the waypoint.
         * @param coordinates The coordinates of the waypoint.
         * @param magneticVariation The magnetic variation of the waypoint, if any.
         * @returns The built waypoint.
         */
        buildWaypoint(ident, coordinates, magneticVariation) {
            const waypoint = new WayPoint(this._instrument);
            waypoint.type = 'W';
            waypoint.infos = new IntersectionInfo(this._instrument);
            waypoint.infos.coordinates = coordinates;
            waypoint.infos.magneticVariation = magneticVariation;
            waypoint.ident = ident;
            waypoint.infos.ident = ident;
            return waypoint;
        }
    }
    /** A normalization factor for calculating distances from triangular ratios. */
    LegsProcedure.distanceNormalFactorNM = (21639 / 2) * Math.PI;

    /**
     * The details of procedures selected in the flight plan.
     */
    class ProcedureDetails {
        constructor() {
            /** The index of the origin runway in the origin runway information. */
            this.originRunwayIndex = -1;
            /** The index of the departure in the origin airport information. */
            this.departureIndex = -1;
            /** The index of the departure transition in the origin airport departure information. */
            this.departureTransitionIndex = -1;
            /** The index of the selected runway in the original airport departure information. */
            this.departureRunwayIndex = -1;
            /** The index of the arrival in the destination airport information. */
            this.arrivalIndex = -1;
            /** The index of the arrival transition in the destination airport arrival information. */
            this.arrivalTransitionIndex = -1;
            /** The index of the selected runway transition at the destination airport arrival information. */
            this.arrivalRunwayIndex = -1;
            /** The index of the apporach in the destination airport information.*/
            this.approachIndex = -1;
            /** The index of the approach transition in the destination airport approach information.*/
            this.approachTransitionIndex = -1;
            /** The index of the destination runway in the destination runway information. */
            this.destinationRunwayIndex = -1;
            /** The length from the threshold of the runway extension fix. */
            this.destinationRunwayExtension = -1;
        }
    }

    /**
     * Information about the current direct-to procedures in the flight plan.
     */
    class DirectTo {
        constructor() {
            /** Whether or not the current direct-to is in the flight plan. */
            this.waypointIsInFlightPlan = false;
            /** Whether or not direct-to is active. */
            this.isActive = false;
            /** The current direct-to waypoint index, if part of the flight plan. */
            this.planWaypointIndex = 0;
            /** The current active index in the direct to waypoints. */
            this.currentWaypointIndex = 0;
        }
    }

    /**
     * A flight plan managed by the FlightPlanManager.
     */
    class ManagedFlightPlan {
        constructor() {
            /** The cruise altitude for this flight plan. */
            this.cruiseAltitude = 0;
            /** The index of the currently active waypoint. */
            this.activeWaypointIndex = 0;
            /** The details for selected procedures on this flight plan. */
            this.procedureDetails = new ProcedureDetails();
            /** The details of any direct-to procedures on this flight plan. */
            this.directTo = new DirectTo();
            /** The current active segments of the flight plan. */
            this._segments = [new FlightPlanSegment(exports.SegmentType.Enroute, 0, [])];
        }
        /** The departure segment of the flight plan. */
        get departure() { return this.getSegment(exports.SegmentType.Departure); }
        /** The enroute segment of the flight plan. */
        get enroute() { return this.getSegment(exports.SegmentType.Enroute); }
        /** The arrival segment of the flight plan. */
        get arrival() { return this.getSegment(exports.SegmentType.Arrival); }
        /** The approach segment of the flight plan. */
        get approach() { return this.getSegment(exports.SegmentType.Approach); }
        /** The approach segment of the flight plan. */
        get missed() { return this.getSegment(exports.SegmentType.Missed); }
        /** Whether the flight plan has an origin airfield. */
        get hasOrigin() { return this.originAirfield; }
        /** Whether the flight plan has a destination airfield. */
        get hasDestination() { return this.destinationAirfield; }
        /** The currently active waypoint. */
        get activeWaypoint() { return this.waypoints[this.activeWaypointIndex]; }
        /** The waypoints of the flight plan. */
        get waypoints() {
            const waypoints = [];
            if (this.originAirfield) {
                waypoints.push(this.originAirfield);
            }
            for (const segment of this._segments) {
                waypoints.push(...segment.waypoints);
            }
            if (this.destinationAirfield) {
                waypoints.push(this.destinationAirfield);
            }
            return waypoints;
        }
        /** The length of the flight plan. */
        get length() {
            const lastSeg = this._segments[this._segments.length - 1];
            return lastSeg.offset + lastSeg.waypoints.length + (this.hasDestination ? 1 : 0);
        }
        get checksum() {
            let checksum = 0;
            const waypoints = this.waypoints;
            for (let i = 0; i < waypoints.length; i++) {
                checksum += waypoints[i].infos.coordinates.lat;
                checksum += waypoints[i].legAltitude1 + waypoints[i].legAltitude2 + waypoints[i].legAltitudeDescription + waypoints[i].speedConstraint;
            }
            return checksum;
        }
        /** The non-approach waypoints of the flight plan. */
        get nonApproachWaypoints() {
            const waypoints = [];
            if (this.originAirfield) {
                waypoints.push(this.originAirfield);
            }
            for (const segment of this._segments.filter(s => s.type < exports.SegmentType.Approach)) {
                waypoints.push(...segment.waypoints);
            }
            if (this.destinationAirfield) {
                waypoints.push(this.destinationAirfield);
            }
            return waypoints;
        }
        /**
         * Sets the parent instrument that the flight plan is attached to locally.
         * @param instrument The instrument that the flight plan is attached to.
         */
        setParentInstrument(instrument) {
            this._parentInstrument = instrument;
        }
        /**
         * Clears the flight plan.
         */
        clearPlan() {
            return __awaiter(this, void 0, void 0, function* () {
                this.originAirfield = undefined;
                this.destinationAirfield = undefined;
                this.cruiseAltitude = 0;
                this.activeWaypointIndex = 0;
                this.procedureDetails = new ProcedureDetails();
                this.directTo = new DirectTo();
                //await GPS.clearPlan();
                this._segments = [new FlightPlanSegment(exports.SegmentType.Enroute, 0, [])];
            });
        }
        /**
         * Syncs the flight plan to FS9GPS.
         */
        syncToGPS() {
            return __awaiter(this, void 0, void 0, function* () {
                // await GPS.clearPlan();
                // for (var i = 0; i < this.waypoints.length; i++) {
                //   const waypoint = this.waypoints[i];
                //   if (waypoint.icao && waypoint.icao.trim() !== '') {
                //     await GPS.addIcaoWaypoint(waypoint.icao, i);
                //   }
                //   else {
                //     await GPS.addUserWaypoint(waypoint.infos.coordinates.lat, waypoint.infos.coordinates.long, i, waypoint.ident);
                //   }
                //   if (waypoint.endsInDiscontinuity) {
                //     break;
                //   }
                // }
                // await GPS.setActiveWaypoint(this.activeWaypointIndex);
                // await GPS.logCurrentPlan();
            });
        }
        /**
         * Adds a waypoint to the flight plan.
         * @param waypoint The waypoint to add.
         * @param index The index to add the waypoint at. If ommitted the waypoint will
         * be appended to the end of the flight plan.
         * @param segmentType The type of segment to add the waypoint to.
         */
        addWaypoint(waypoint, index, segmentType) {
            const mappedWaypoint = (waypoint instanceof WayPoint) ? waypoint : RawDataMapper.toWaypoint(waypoint, this._parentInstrument);
            if (mappedWaypoint.type === 'A' && index === 0) {
                this.originAirfield = mappedWaypoint;
                this.procedureDetails.departureIndex = -1;
                this.procedureDetails.departureRunwayIndex = -1;
                this.procedureDetails.departureTransitionIndex = -1;
                this.procedureDetails.originRunwayIndex = -1;
                this.reflowSegments();
                this.reflowDistances();
            }
            else if (mappedWaypoint.type === 'A' && index === undefined) {
                this.destinationAirfield = mappedWaypoint;
                this.procedureDetails.arrivalIndex = -1;
                this.procedureDetails.arrivalRunwayIndex = -1;
                this.procedureDetails.arrivalTransitionIndex = -1;
                this.procedureDetails.approachIndex = -1;
                this.procedureDetails.approachTransitionIndex = -1;
                this.reflowSegments();
                this.reflowDistances();
            }
            else {
                let segment = segmentType !== undefined
                    ? this.getSegment(segmentType)
                    : this.findSegmentByWaypointIndex(index);
                // hitting first waypoint in segment > enroute
                if (segment.type > exports.SegmentType.Enroute && index == segment.offset) {
                    const segIdx = this._segments.findIndex((seg) => { return seg.type == segment.type; });
                    // is prev segment enroute?
                    const prevSeg = this._segments[segIdx - 1];
                    if (prevSeg.type == exports.SegmentType.Enroute) {
                        segment = prevSeg;
                    }
                }
                if (segment) {
                    if (index > this.length) {
                        index = undefined;
                    }
                    if (index !== undefined) {
                        const segmentIndex = index - segment.offset;
                        if (segmentIndex < segment.waypoints.length) {
                            segment.waypoints.splice(segmentIndex, 0, mappedWaypoint);
                        }
                        else {
                            segment.waypoints.push(mappedWaypoint);
                        }
                    }
                    else {
                        segment.waypoints.push(mappedWaypoint);
                    }
                    this.reflowSegments();
                    this.reflowDistances();
                    if (this.activeWaypointIndex === 0 && this.length > 1) {
                        this.activeWaypointIndex = 1;
                    }
                    else if (this.activeWaypointIndex === 1 && waypoint.isRunway && segment.type === exports.SegmentType.Departure) {
                        this.activeWaypointIndex = 2;
                    }
                }
            }
        }
        /**
         * Removes a waypoint from the flight plan.
         * @param index The index of the waypoint to remove.
         */
        removeWaypoint(index) {
            if (this.originAirfield && index === 0) {
                this.originAirfield = undefined;
                this.reflowSegments();
                this.reflowDistances();
            }
            else if (this.destinationAirfield && index === this.length - 1) {
                this.destinationAirfield = undefined;
            }
            else {
                const segment = this.findSegmentByWaypointIndex(index);
                if (segment) {
                    segment.waypoints.splice(index - segment.offset, 1);
                    if (segment.waypoints.length === 0 && segment.type !== exports.SegmentType.Enroute) {
                        this.removeSegment(segment.type);
                    }
                    this.reflowSegments();
                    this.reflowDistances();
                }
            }
            if (index < this.activeWaypointIndex) {
                this.activeWaypointIndex--;
            }
        }
        /**
         * Gets a waypoint by index from the flight plan.
         * @param index The index of the waypoint to get.
         */
        getWaypoint(index) {
            if (this.originAirfield && index === 0) {
                return this.originAirfield;
            }
            if (this.destinationAirfield && index === this.length - 1) {
                return this.destinationAirfield;
            }
            const segment = this.findSegmentByWaypointIndex(index);
            if (segment) {
                return segment.waypoints[index - segment.offset];
            }
        }
        /**
         * Adds a plan segment to the flight plan.
         * @param type The type of the segment to add.
         */
        addSegment(type) {
            const segment = new FlightPlanSegment(type, 0, []);
            this._segments.push(segment);
            this._segments.sort((a, b) => a.type - b.type);
            this.reflowSegments();
            return segment;
        }
        /**
         * Removes a plan segment from the flight plan.
         * @param type The type of plan segment to remove.
         */
        removeSegment(type) {
            const segmentIndex = this._segments.findIndex(s => s.type === type);
            if (segmentIndex > -1) {
                this._segments.splice(segmentIndex, 1);
            }
        }
        /**
         * Reflows waypoint index offsets accross plans segments.
         */
        reflowSegments() {
            let index = 0;
            if (this.originAirfield) {
                index = 1;
            }
            for (const segment of this._segments) {
                segment.offset = index;
                index += segment.waypoints.length;
            }
        }
        /**
         * Gets a flight plan segment of the specified type.
         * @param type The type of flight plan segment to get.
         * @returns The found segment, or FlightPlanSegment.Empty if not found.
         */
        getSegment(type) {
            const segment = this._segments.find(s => s.type === type);
            return segment !== undefined ? segment : FlightPlanSegment.Empty;
        }
        /**
         * Finds a flight plan segment by waypoint index.
         * @param index The index of the waypoint to find the segment for.
         * @returns The located segment, if any.
         */
        findSegmentByWaypointIndex(index) {
            for (let i = 0; i < this._segments.length; i++) {
                const segMaxIdx = this._segments[i].offset + this._segments[i].waypoints.length;
                if (segMaxIdx > index) {
                    return this._segments[i];
                }
            }
            return this._segments[this._segments.length - 1];
        }
        /**
         * Recalculates all waypoint bearings and distances in the flight plan.
         */
        reflowDistances() {
            let cumulativeDistance = 0;
            const waypoints = this.waypoints;
            for (let i = 0; i < waypoints.length; i++) {
                if (i > 0) {
                    //If there's an approach selected and this is the last approach waypoint, use the destination waypoint for coordinates
                    //Runway waypoints do not have coordinates
                    const referenceWaypoint = waypoints[i];
                    const prevWaypoint = waypoints[i - 1];
                    const trueCourseToWaypoint = Avionics.Utils.computeGreatCircleHeading(prevWaypoint.infos.coordinates, referenceWaypoint.infos.coordinates);
                    referenceWaypoint.bearingInFP = trueCourseToWaypoint - GeoMath.getMagvar(prevWaypoint.infos.coordinates.lat, prevWaypoint.infos.coordinates.long);
                    referenceWaypoint.bearingInFP = referenceWaypoint.bearingInFP < 0 ? 360 + referenceWaypoint.bearingInFP : referenceWaypoint.bearingInFP;
                    referenceWaypoint.distanceInFP = Avionics.Utils.computeGreatCircleDistance(prevWaypoint.infos.coordinates, referenceWaypoint.infos.coordinates);
                    cumulativeDistance += referenceWaypoint.distanceInFP;
                    referenceWaypoint.cumulativeDistanceInFP = cumulativeDistance;
                }
            }
        }
        /**
         * Copies a sanitized version of the flight plan for shared data storage.
         * @returns The sanitized flight plan.
         */
        serialize() {
            var _a;
            const planCopy = new ManagedFlightPlan();
            const copyWaypoint = (waypoint) => ({
                icao: waypoint.icao,
                ident: waypoint.ident,
                type: waypoint.type,
                legAltitudeDescription: waypoint.legAltitudeDescription,
                legAltitude1: waypoint.legAltitude1,
                legAltitude2: waypoint.legAltitude2,
                isVectors: waypoint.isVectors,
                endsInDiscontinuity: waypoint.endsInDiscontinuity,
                bearingInFP: waypoint.bearingInFP,
                distanceInFP: waypoint.distanceInFP,
                cumulativeDistanceInFP: waypoint.cumulativeDistanceInFP,
                isRunway: waypoint.isRunway,
                hasHold: waypoint.hasHold,
                holdDetails: waypoint.holdDetails,
                infos: {
                    icao: waypoint.infos.icao,
                    ident: waypoint.infos.ident,
                    airwayIn: waypoint.infos.airwayIn,
                    airwayOut: waypoint.infos.airwayOut,
                    routes: waypoint.infos.routes,
                    coordinates: {
                        lat: waypoint.infos.coordinates.lat,
                        long: waypoint.infos.coordinates.long,
                        alt: waypoint.infos.coordinates.alt
                    }
                }
            });
            const copyAirfield = (airfield) => {
                const copy = Object.assign(new WayPoint(undefined), airfield);
                copy.infos = Object.assign(new AirportInfo(undefined), copy.infos);
                delete copy.instrument;
                delete copy.infos.instrument;
                delete copy._svgElements;
                delete copy.infos._svgElements;
                return copy;
            };
            planCopy.activeWaypointIndex = this.activeWaypointIndex;
            planCopy.destinationAirfield = this.destinationAirfield && copyAirfield(this.destinationAirfield);
            planCopy.originAirfield = this.originAirfield && copyAirfield(this.originAirfield);
            planCopy.procedureDetails = Object.assign({}, this.procedureDetails);
            planCopy.directTo = Object.assign({}, this.directTo);
            planCopy.directTo.interceptPoints = (_a = planCopy.directTo.interceptPoints) === null || _a === void 0 ? void 0 : _a.map(w => copyWaypoint(w));
            const copySegments = [];
            for (const segment of this._segments) {
                const copySegment = new FlightPlanSegment(segment.type, segment.offset, []);
                for (const waypoint of segment.waypoints) {
                    copySegment.waypoints.push(copyWaypoint(waypoint));
                }
                copySegments.push(copySegment);
            }
            planCopy._segments = copySegments;
            return planCopy;
        }
        /**
         * Copies the flight plan.
         * @returns The copied flight plan.
         */
        copy() {
            const newFlightPlan = Object.assign(new ManagedFlightPlan(), this);
            newFlightPlan.setParentInstrument(this._parentInstrument);
            newFlightPlan._segments = [];
            for (let i = 0; i < this._segments.length; i++) {
                const seg = this._segments[i];
                newFlightPlan._segments[i] = Object.assign(new FlightPlanSegment(seg.type, seg.offset, []), seg);
                newFlightPlan._segments[i].waypoints = [...seg.waypoints.map(w => Object.assign(new WayPoint(w.instrument), w))];
            }
            newFlightPlan.procedureDetails = Object.assign(new ProcedureDetails(), this.procedureDetails);
            newFlightPlan.directTo = Object.assign(new DirectTo(), this.directTo);
            newFlightPlan.directTo.interceptPoints = this.directTo.interceptPoints !== undefined ? [...this.directTo.interceptPoints] : undefined;
            return newFlightPlan;
        }
        /**
         * Reverses the flight plan.
         */
        reverse() {
            //TODO: Fix flight plan indexes after reversal
            //this._waypoints.reverse();
        }
        /**
         * Goes direct to the specified waypoint index in the flight plan.
         * @param index The waypoint index to go direct to.
         */
        addDirectTo(index) {
            const interceptPoints = this.calculateDirectIntercept(this.getWaypoint(index));
            this.addWaypoint(interceptPoints[0], index);
            this.activeWaypointIndex = index + 1;
            this.directTo.isActive = true;
            this.directTo.waypointIsInFlightPlan = true;
            this.directTo.planWaypointIndex = index + 1;
            this.directTo.interceptPoints = interceptPoints;
        }
        /**
         * Calculates an intercept path to a direct-to waypoint.
         * @param waypoint The waypoint to calculate the path to.
         * @returns The waypoints that make up the intercept path.
         */
        calculateDirectIntercept(waypoint) {
            const lat = SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude");
            const long = SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude");
            const planeCoords = new LatLongAlt(lat, long);
            const groundSpeed = SimVar.GetSimVarValue("GPS GROUND SPEED", "knots");
            const planeHeading = SimVar.GetSimVarValue("PLANE HEADING DEGREES TRUE", "Radians") * Avionics.Utils.RAD2DEG;
            const headingToFix = Avionics.Utils.computeGreatCircleHeading(planeCoords, waypoint.infos.coordinates);
            const angleDiff = Math.abs(Avionics.Utils.angleDiff(planeHeading, headingToFix));
            const turnDurationSeconds = (angleDiff / 3) + 6;
            const interceptDistance = (groundSpeed / 60 / 60) * turnDurationSeconds * 1.25;
            const createInterceptPoint = (coords) => {
                const interceptWaypoint = new WayPoint(this._parentInstrument);
                interceptWaypoint.ident = '$DIR';
                interceptWaypoint.infos = new IntersectionInfo(this._parentInstrument);
                interceptWaypoint.infos.coordinates = coords;
                return interceptWaypoint;
            };
            const coords = Avionics.Utils.bearingDistanceToCoordinates(planeHeading, Math.min(interceptDistance, 1.0), lat, long);
            return [createInterceptPoint(coords)];
            //TODO: Work out better direct to intercept waypoint(s)
            /*
            if (angleDiff < 90 && angleDiff > -90) {
              const coords = Avionics.Utils.bearingDistanceToCoordinates(planeHeading, interceptDistance, lat, long);
              return [createInterceptPoint(planeCoords), createInterceptPoint(coords)];
            }
            else {
              const coords1 = Avionics.Utils.bearingDistanceToCoordinates(planeHeading, interceptDistance / 2, lat, long);
              const coords2 = Avionics.Utils.bearingDistanceToCoordinates(planeHeading + (angleDiff / 2), interceptDistance / 2, coords1.lat, coords1.long);
        
              return [createInterceptPoint(planeCoords), createInterceptPoint(coords1), createInterceptPoint(coords2)];
            }
            */
        }
        /**
         * Builds a departure into the flight plan from indexes in the departure airport information.
         */
        buildDeparture() {
            return __awaiter(this, void 0, void 0, function* () {
                const legs = [];
                const origin = this.originAirfield;
                const departureIndex = this.procedureDetails.departureIndex;
                const runwayIndex = this.procedureDetails.departureRunwayIndex;
                const transitionIndex = this.procedureDetails.departureTransitionIndex;
                const selectedOriginRunwayIndex = this.procedureDetails.originRunwayIndex;
                const airportInfo = origin.infos;
                if (departureIndex !== -1 && runwayIndex !== -1) {
                    const runwayTransition = airportInfo.departures[departureIndex].runwayTransitions[runwayIndex];
                    if (runwayTransition !== undefined) {
                        legs.push(...runwayTransition.legs);
                    }
                }
                if (departureIndex !== -1) {
                    legs.push(...airportInfo.departures[departureIndex].commonLegs);
                }
                if (transitionIndex !== -1 && departureIndex !== -1) {
                    // TODO: are enroutetransitions working?
                    if (airportInfo.departures[departureIndex].enRouteTransitions.length > 0) {
                        const transition = airportInfo.departures[departureIndex].enRouteTransitions[transitionIndex].legs;
                        legs.push(...transition);
                    }
                }
                let segment = this.departure;
                if (segment !== FlightPlanSegment.Empty) {
                    for (let i = 0; i < segment.waypoints.length; i++) {
                        this.removeWaypoint(segment.offset);
                    }
                    this.removeSegment(segment.type);
                }
                if (legs.length > 0 || selectedOriginRunwayIndex !== -1 || (departureIndex !== -1 && runwayIndex !== -1)) {
                    segment = this.addSegment(exports.SegmentType.Departure);
                    let procedure = new LegsProcedure(legs, origin, undefined, this._parentInstrument);
                    let runway;
                    if (selectedOriginRunwayIndex !== -1) {
                        runway = airportInfo.oneWayRunways[selectedOriginRunwayIndex];
                    }
                    else if (runwayIndex !== -1) {
                        runway = this.getRunway(airportInfo.oneWayRunways, airportInfo.departures[departureIndex].runwayTransitions[runwayIndex].name);
                    }
                    if (runway) {
                        const selectedRunwayMod = runway.designation.slice(-1);
                        let selectedRunwayOutput = undefined;
                        if (selectedRunwayMod == "L" || selectedRunwayMod == "C" || selectedRunwayMod == "R") {
                            if (runway.designation.length == 2) {
                                selectedRunwayOutput = "0" + runway.designation;
                            }
                            else {
                                selectedRunwayOutput = runway.designation;
                            }
                        }
                        else {
                            if (runway.designation.length == 2) {
                                selectedRunwayOutput = runway.designation;
                            }
                            else {
                                selectedRunwayOutput = "0" + runway.designation;
                            }
                        }
                        const runwayWaypoint = procedure.buildWaypoint(`RW${selectedRunwayOutput}`, runway.beginningCoordinates);
                        // runwayWaypoint.legAltitudeDescription = 1;
                        // runwayWaypoint.legAltitude1 = (runway.elevation * 3.28084) + 50;
                        runwayWaypoint.isRunway = true;
                        this.addWaypoint(runwayWaypoint, undefined, segment.type);
                        procedure = new LegsProcedure(legs, runwayWaypoint, origin, this._parentInstrument);
                    }
                    let waypointIndex = segment.offset;
                    while (procedure.hasNext()) {
                        const waypoint = yield procedure.getNext();
                        if (waypoint !== undefined) {
                            this.addWaypoint(waypoint, ++waypointIndex, segment.type);
                        }
                    }
                }
            });
        }
        /**
         * Builds an arrival into the flight plan from indexes in the arrival airport information.
         */
        buildArrival() {
            return __awaiter(this, void 0, void 0, function* () {
                const legs = [];
                const destination = this.destinationAirfield;
                const arrivalIndex = this.procedureDetails.arrivalIndex;
                const arrivalRunwayIndex = this.procedureDetails.arrivalRunwayIndex;
                const arrivalTransitionIndex = this.procedureDetails.arrivalTransitionIndex;
                const destinationInfo = destination.infos;
                if (arrivalIndex !== -1 && arrivalTransitionIndex !== -1) {
                    const transition = destinationInfo.arrivals[arrivalIndex].enRouteTransitions[arrivalTransitionIndex];
                    if (transition !== undefined) {
                        legs.push(...transition.legs);
                    }
                }
                if (arrivalIndex !== -1) {
                    legs.push(...destinationInfo.arrivals[arrivalIndex].commonLegs);
                }
                if (arrivalIndex !== -1 && arrivalRunwayIndex !== -1) {
                    const runwayTransition = destinationInfo.arrivals[arrivalIndex].runwayTransitions[arrivalRunwayIndex];
                    legs.push(...runwayTransition.legs);
                }
                let { startIndex, segment } = this.truncateSegment(exports.SegmentType.Arrival);
                if (legs.length > 0) {
                    if (segment === FlightPlanSegment.Empty) {
                        segment = this.addSegment(exports.SegmentType.Arrival);
                        startIndex = segment.offset;
                    }
                    const procedure = new LegsProcedure(legs, this.getWaypoint(segment.offset - 1), this.getWaypoint(segment.offset - 2), this._parentInstrument);
                    let waypointIndex = segment.offset;
                    while (procedure.hasNext()) {
                        const waypoint = yield procedure.getNext();
                        if (waypoint) {
                            this.addWaypoint(waypoint, ++waypointIndex, segment.type);
                        }
                    }
                }
            });
        }
        /**
         * Builds an approach into the flight plan from indexes in the arrival airport information.
         */
        buildApproach() {
            return __awaiter(this, void 0, void 0, function* () {
                const legs = [];
                const destination = this.destinationAirfield;
                const approachIndex = this.procedureDetails.approachIndex;
                const approachTransitionIndex = this.procedureDetails.approachTransitionIndex;
                const destinationRunwayIndex = this.procedureDetails.destinationRunwayIndex;
                const destinationRunwayExtension = this.procedureDetails.destinationRunwayExtension;
                const destinationInfo = destination.infos;
                if (approachIndex !== -1 && approachTransitionIndex !== -1) {
                    const transition = destinationInfo.approaches[approachIndex].transitions[approachTransitionIndex].legs;
                    legs.push(...transition);
                }
                if (approachIndex !== -1) {
                    legs.push(...destinationInfo.approaches[approachIndex].finalLegs);
                }
                let { startIndex, segment } = this.truncateSegment(exports.SegmentType.Approach);
                let { startIndex: missedStartIndex, segment: missedSegment } = this.truncateSegment(exports.SegmentType.Missed);
                if (legs.length > 0 || approachIndex !== -1 || destinationRunwayIndex !== -1) {
                    //If we're in the missed approach segment, shift everything backwards to
                    //load a second approach.
                    if (missedSegment.waypoints.length > 0) {
                        this.removeSegment(exports.SegmentType.Approach);
                        segment = this.addSegment(exports.SegmentType.Approach);
                        const fromIndex = missedStartIndex - missedSegment.offset - 2;
                        const toIndex = missedStartIndex - missedSegment.offset - 1;
                        if (fromIndex > -1) {
                            segment.waypoints.push(missedSegment.waypoints[fromIndex]);
                        }
                        segment.waypoints.push(missedSegment.waypoints[toIndex]);
                        this.reflowSegments();
                        this.reflowDistances();
                        startIndex = segment.offset + 1;
                        this.activeWaypointIndex = startIndex;
                    }
                    this.removeSegment(exports.SegmentType.Missed);
                    missedSegment = this.addSegment(exports.SegmentType.Missed);
                    if (segment === FlightPlanSegment.Empty) {
                        segment = this.addSegment(exports.SegmentType.Approach);
                        startIndex = segment.offset;
                        const prevWaypointIndex = segment.offset - 1;
                        if (prevWaypointIndex > 0) {
                            this.getWaypoint(segment.offset - 1).endsInDiscontinuity = true;
                        }
                    }
                    const procedure = new LegsProcedure(legs, this.getWaypoint(startIndex - 1), this.getWaypoint(startIndex - 2), this._parentInstrument);
                    let waypointIndex = startIndex;
                    while (procedure.hasNext()) {
                        const waypoint = yield procedure.getNext();
                        if (waypoint !== undefined) {
                            this.addWaypoint(waypoint, ++waypointIndex, segment.type);
                        }
                    }
                    let runway;
                    if (approachIndex !== -1) {
                        runway = this.getRunway(destinationInfo.oneWayRunways, destinationInfo.approaches[approachIndex].runway);
                    }
                    else if (destinationRunwayIndex !== -1) {
                        runway = destinationInfo.oneWayRunways[destinationRunwayIndex];
                    }
                    if (runway) {
                        const selectedRunwayMod = runway.designation.slice(-1);
                        let selectedRunwayOutput = undefined;
                        if (selectedRunwayMod == "L" || selectedRunwayMod == "C" || selectedRunwayMod == "R") {
                            if (runway.designation.length == 2) {
                                selectedRunwayOutput = "0" + runway.designation;
                            }
                            else {
                                selectedRunwayOutput = runway.designation;
                            }
                        }
                        else {
                            if (runway.designation.length == 2) {
                                selectedRunwayOutput = runway.designation;
                            }
                            else {
                                selectedRunwayOutput = "0" + runway.designation;
                            }
                        }
                        if (approachIndex === -1 && destinationRunwayIndex !== -1 && destinationRunwayExtension !== -1) {
                            const runwayExtensionWaypoint = procedure.buildWaypoint(`RX${selectedRunwayOutput}`, Avionics.Utils.bearingDistanceToCoordinates(runway.direction + 180, destinationRunwayExtension, runway.beginningCoordinates.lat, runway.beginningCoordinates.long));
                            this.addWaypoint(runwayExtensionWaypoint, undefined, exports.SegmentType.Approach);
                        }
                        const runwayWaypoint = procedure.buildWaypoint(`RW${selectedRunwayOutput}`, runway.beginningCoordinates);
                        runwayWaypoint.legAltitudeDescription = 1;
                        runwayWaypoint.legAltitude1 = (runway.elevation * 3.28084) + 50;
                        runwayWaypoint.isRunway = true;
                        this.addWaypoint(runwayWaypoint, undefined, exports.SegmentType.Approach);
                        if (approachIndex !== -1) {
                            missedStartIndex = missedSegment.offset;
                            const missedProcedure = new LegsProcedure(destinationInfo.approaches[approachIndex].missedLegs, this.getWaypoint(missedStartIndex - 1), this.getWaypoint(missedStartIndex - 2), this._parentInstrument);
                            while (missedProcedure.hasNext()) {
                                const waypoint = yield missedProcedure.getNext();
                                if (waypoint !== undefined) {
                                    this.addWaypoint(waypoint, ++missedStartIndex, missedSegment.type);
                                }
                            }
                        }
                    }
                }
            });
        }
        /**
         * Truncates a flight plan segment. If the active waypoint index is current in the segment,
         * a discontinuity will be added at the end of the active waypoint and the startIndex will
         * point to the next waypoint in the segment after the active.
         * @param type The type of segment to truncate.
         * @returns A segment to add to and a starting waypoint index.
         */
        truncateSegment(type) {
            let segment = this.getSegment(type);
            const startIndex = this.findSegmentByWaypointIndex(this.activeWaypointIndex) === segment
                ? this.activeWaypointIndex + 1
                : segment.offset;
            if (segment !== FlightPlanSegment.Empty) {
                const finalIndex = segment.offset + segment.waypoints.length;
                if (startIndex < finalIndex) {
                    for (let i = startIndex; i < finalIndex; i++) {
                        this.removeWaypoint(startIndex);
                    }
                }
            }
            if (segment.waypoints.length === 0) {
                this.removeSegment(segment.type);
                segment = FlightPlanSegment.Empty;
            }
            else {
                segment.waypoints[Math.min(Math.max((startIndex - 1) - segment.offset, 0), segment.waypoints.length - 1)].endsInDiscontinuity = true;
            }
            return { startIndex, segment };
        }
        /**
         * Gets the runway information from a given runway name.
         * @param runways The collection of runways to search.
         * @param runwayName The runway name.
         * @returns The found runway, if any.
         */
        getRunway(runways, runwayName) {
            if (runways.length > 0) {
                let runwayIndex;
                runwayName = runwayName.replace('RW', '');
                const runwayLetter = runwayName[runwayName.length - 1];
                if (runwayLetter === ' ' || runwayLetter === 'C') {
                    const runwayDirection = runwayName.trim();
                    runwayIndex = runways.findIndex(r => r.designation === runwayDirection || r.designation === `${runwayDirection}C`);
                }
                else {
                    runwayIndex = runways.findIndex(r => r.designation === runwayName);
                }
                if (runwayIndex !== -1) {
                    return runways[runwayIndex];
                }
            }
        }
        /**
         * Converts a plain object into a ManagedFlightPlan.
         * @param flightPlanObject The object to convert.
         * @param parentInstrument The parent instrument attached to this flight plan.
         * @returns The converted ManagedFlightPlan.
         */
        static fromObject(flightPlanObject, parentInstrument) {
            const plan = Object.assign(new ManagedFlightPlan(), flightPlanObject);
            plan.setParentInstrument(parentInstrument);
            plan.directTo = Object.assign(new DirectTo(), plan.directTo);
            const mapObject = (obj, parentType) => {
                if (obj && obj.infos) {
                    obj = Object.assign(new WayPoint(parentInstrument), obj);
                }
                if (obj && obj.coordinates) {
                    switch (parentType) {
                        case 'A':
                            obj = Object.assign(new AirportInfo(parentInstrument), obj);
                            break;
                        case 'W':
                            obj = Object.assign(new IntersectionInfo(parentInstrument), obj);
                            break;
                        case 'V':
                            obj = Object.assign(new VORInfo(parentInstrument), obj);
                            break;
                        case 'N':
                            obj = Object.assign(new NDBInfo(parentInstrument), obj);
                            break;
                        default:
                            obj = Object.assign(new WayPointInfo(parentInstrument), obj);
                    }
                    obj.coordinates = Object.assign(new LatLongAlt(), obj.coordinates);
                }
                return obj;
            };
            const visitObject = (obj) => {
                for (const key in obj) {
                    if (typeof obj[key] === 'object' && obj[key] && obj[key].scroll === undefined) {
                        if (Array.isArray(obj[key])) {
                            visitArray(obj[key]);
                        }
                        else {
                            visitObject(obj[key]);
                        }
                        obj[key] = mapObject(obj[key], obj.type);
                    }
                }
            };
            const visitArray = (array) => {
                array.forEach((item, index) => {
                    if (Array.isArray(item)) {
                        visitArray(item);
                    }
                    else if (typeof item === 'object') {
                        visitObject(item);
                    }
                    array[index] = mapObject(item);
                });
            };
            visitObject(plan);
            return plan;
        }
    }

    /**
     * A system for managing flight plan data used by various instruments.
     */
    class FlightPlanManager {
        /**
         * Constructs an instance of the FlightPlanManager with the provided
         * parent instrument attached.
         * @param parentInstrument The parent instrument attached to this FlightPlanManager.
         */
        constructor(_parentInstrument) {
            this._parentInstrument = _parentInstrument;
            this._isRegistered = false;
            this._isMaster = false;
            this._isSyncPaused = false;
            this._currentFlightPlanVersion = 0;
            this.__currentFlightPlanIndex = 0;
            /**
             * The current stored flight plan data.
             * @type ManagedFlightPlan[]
             */
            this._flightPlans = [];
            this._loadFlightPlans();
            if (_parentInstrument.instrumentIdentifier == "CJ4_FMC") {
                this._isMaster = true;
                _parentInstrument.addEventListener("FlightStart", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const plan = new ManagedFlightPlan();
                        plan.setParentInstrument(_parentInstrument);
                        this._flightPlans = [];
                        this._flightPlans.push(plan);
                        if (WTDataStore.get('WT_CJ4_FPSYNC', 0) !== 0) {
                            this.pauseSync();
                            yield FlightPlanAsoboSync.LoadFromGame(this);
                        }
                        this.resumeSync();
                        // ctd magic sauce?
                        Coherent.call("SET_ACTIVE_WAYPOINT_INDEX", 0);
                        Coherent.call("RECOMPUTE_ACTIVE_WAYPOINT_INDEX");
                    });
                }.bind(this));
            }
            FlightPlanManager.DEBUG_INSTANCE = this;
        }
        get _currentFlightPlanIndex() {
            return this.__currentFlightPlanIndex;
        }
        set _currentFlightPlanIndex(value) {
            this.__currentFlightPlanIndex = value;
        }
        /**
         * Gets the current stored version of the flight plan.
         */
        get CurrentFlightPlanVersion() {
            return this._currentFlightPlanVersion;
        }
        update(_deltaTime) {
        }
        onCurrentGameFlightLoaded(_callback) {
            _callback();
        }
        registerListener() {
        }
        addHardCodedConstraints(wp) {
        }
        /**
         * Loads sim flight plan data into WayPoint objects for consumption.
         * @param data The flight plan data to load.
         * @param currentWaypoints The waypoints array to modify with the data loaded.
         * @param callback A callback to call when the data has completed loading.
         */
        _loadWaypoints(data, currentWaypoints, callback) {
        }
        /**
         * Updates the current active waypoint index from the sim.
         */
        updateWaypointIndex() {
            return __awaiter(this, void 0, void 0, function* () {
                //const waypointIndex = await Coherent.call("GET_ACTIVE_WAYPOINT_INDEX");
                //this._activeWaypointIndex = waypointIndex;
            });
        }
        /**
         * Scans for updates to the synchronized flight plan and loads them into the flight plan
         * manager if the flight plan is out of date.
         * @param {() => void} callback A callback to call when the update has completed.
         * @param {Boolean} log Whether or not to log the loaded flight plan value.
         */
        updateFlightPlan(callback = () => { }, log = false) {
            const flightPlanVersion = SimVar.GetSimVarValue("L:WT.FlightPlan.Version", "number");
            if (flightPlanVersion !== this._currentFlightPlanVersion) {
                this._loadFlightPlans();
                this._currentFlightPlanVersion = flightPlanVersion;
            }
            callback();
        }
        /**
         * Loads the flight plans from data storage.
         */
        _loadFlightPlans() {
            this._getFlightPlan();
            if (this._flightPlans.length === 0) {
                const newFpln = new ManagedFlightPlan();
                newFpln.setParentInstrument(this._parentInstrument);
                this._flightPlans.push(new ManagedFlightPlan());
            }
            else {
                this._flightPlans = this._flightPlans.map(fp => ManagedFlightPlan.fromObject(fp, this._parentInstrument));
            }
        }
        updateCurrentApproach(callback = () => { }, log = false) {
            callback();
        }
        get cruisingAltitude() {
            return 0;
        }
        /**
         * Gets the index of the currently active flight plan.
         */
        getCurrentFlightPlanIndex() {
            return this._currentFlightPlanIndex;
        }
        /**
         * Switches the active flight plan index to the supplied index.
         * @param index The index to now use for the active flight plan.
         * @param callback A callback to call when the operation has completed.
         */
        setCurrentFlightPlanIndex(index, callback = EmptyCallback.Boolean) {
            if (index >= 0 && index < this._flightPlans.length) {
                this._currentFlightPlanIndex = index;
                callback(true);
            }
            else {
                callback(false);
            }
        }
        /**
         * Creates a new flight plan.
         * @param callback A callback to call when the operation has completed.
         */
        createNewFlightPlan(callback = EmptyCallback.Void) {
            const newFlightPlan = new ManagedFlightPlan();
            newFlightPlan.setParentInstrument(this._parentInstrument);
            this._flightPlans.push(newFlightPlan);
            this._updateFlightPlanVersion();
            callback();
        }
        /**
         * Copies the currently active flight plan into the specified flight plan index.
         * @param index The index to copy the currently active flight plan into.
         * @param callback A callback to call when the operation has completed.
         */
        copyCurrentFlightPlanInto(index, callback = EmptyCallback.Void) {
            return __awaiter(this, void 0, void 0, function* () {
                const copiedFlightPlan = this._flightPlans[this._currentFlightPlanIndex].copy();
                const activeWaypointIndex = copiedFlightPlan.activeWaypointIndex;
                this._flightPlans[index] = copiedFlightPlan;
                this._updateFlightPlanVersion();
                callback();
            });
        }
        /**
         * Copies the flight plan at the specified index to the currently active flight plan index.
         * @param index The index to copy into the currently active flight plan.
         * @param callback A callback to call when the operation has completed.
         */
        copyFlightPlanIntoCurrent(index, callback = EmptyCallback.Void) {
            return __awaiter(this, void 0, void 0, function* () {
                const copiedFlightPlan = this._flightPlans[index].copy();
                const activeWaypointIndex = copiedFlightPlan.activeWaypointIndex;
                this._flightPlans[this._currentFlightPlanIndex] = copiedFlightPlan;
                if (this._currentFlightPlanIndex === 0) ;
                this._updateFlightPlanVersion();
                callback();
            });
        }
        /**
         * Clears the currently active flight plan.
         * @param callback A callback to call when the operation has completed.
         */
        clearFlightPlan(callback = EmptyCallback.Void) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this._flightPlans[this._currentFlightPlanIndex].clearPlan();
                this._updateFlightPlanVersion();
                callback();
            });
        }
        /**
         * Gets the origin of the currently active flight plan.
         */
        getOrigin() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.originAirfield;
        }
        /**
         * Sets the origin in the currently active flight plan.
         * @param icao The ICAO designation of the origin airport.
         * @param callback A callback to call when the operation has completed.
         */
        setOrigin(icao, callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                const airport = yield this._parentInstrument.facilityLoader.getFacilityRaw(icao);
                yield currentFlightPlan.clearPlan();
                yield currentFlightPlan.addWaypoint(airport, 0);
                this._updateFlightPlanVersion();
                callback();
            });
        }
        /**
         * Gets the index of the active waypoint in the flight plan.
         * @param forceSimVarCall Unused
         * @param useCorrection Unused
         */
        getActiveWaypointIndex(forceSimVarCall = false, useCorrection = false) {
            return this._flightPlans[this._currentFlightPlanIndex].activeWaypointIndex;
        }
        /**
         * Sets the index of the active waypoint in the flight plan.
         * @param index The index to make active in the flight plan.
         * @param callback A callback to call when the operation has completed.
         * @param fplnIndex The index of the flight plan
         */
        setActiveWaypointIndex(index, callback = EmptyCallback.Void, fplnIndex = this._currentFlightPlanIndex) {
            const currentFlightPlan = this._flightPlans[fplnIndex];
            if (index >= 0 && index < currentFlightPlan.length) {
                currentFlightPlan.activeWaypointIndex = index;
                if (currentFlightPlan.directTo.isActive && currentFlightPlan.directTo.waypointIsInFlightPlan
                    && currentFlightPlan.activeWaypointIndex > currentFlightPlan.directTo.planWaypointIndex) {
                    currentFlightPlan.directTo.isActive = false;
                }
            }
            this._updateFlightPlanVersion();
            callback();
        }
        /** Unknown */
        recomputeActiveWaypointIndex(callback = EmptyCallback.Void) {
            callback();
        }
        /**
         * Gets the index of the waypoint prior to the currently active waypoint.
         * @param forceSimVarCall Unused
         */
        getPreviousActiveWaypoint(forceSimVarCall = false) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            const previousWaypointIndex = currentFlightPlan.activeWaypointIndex - 1;
            return currentFlightPlan.getWaypoint(previousWaypointIndex);
        }
        /**
         * Gets the ident of the active waypoint.
         * @param forceSimVarCall Unused
         */
        getActiveWaypointIdent(forceSimVarCall = false) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (currentFlightPlan.activeWaypoint) {
                return currentFlightPlan.activeWaypoint.ident;
            }
            return "";
        }
        /**
         * Gets the active waypoint index from fs9gps. Currently unimplemented.
         * @param forceSimVarCall Unused
         */
        getGPSActiveWaypointIndex(forceSimVarCall = false) {
            return this.getActiveWaypointIndex();
        }
        /**
         * Gets the active waypoint.
         * @param forceSimVarCall Unused
         * @param useCorrection Unused
         */
        getActiveWaypoint(forceSimVarCall = false, useCorrection = false) {
            return this._flightPlans[this._currentFlightPlanIndex].activeWaypoint;
        }
        /**
         * Gets the next waypoint following the active waypoint.
         * @param forceSimVarCall Unused
         */
        getNextActiveWaypoint(forceSimVarCall = false) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            const nextWaypointIndex = currentFlightPlan.activeWaypointIndex + 1;
            return currentFlightPlan.getWaypoint(nextWaypointIndex);
        }
        /**
         * Gets the distance, in NM, to the active waypoint.
         */
        getDistanceToActiveWaypoint() {
            const lat = SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude");
            const long = SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude");
            const ll = new LatLongAlt(lat, long);
            const waypoint = this.getActiveWaypoint();
            if (waypoint && waypoint.infos) {
                return Avionics.Utils.computeDistance(ll, waypoint.infos.coordinates);
            }
            return 0;
        }
        /**
         * Gets the bearing, in degrees, to the active waypoint.
         */
        getBearingToActiveWaypoint() {
            const lat = SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude");
            const long = SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude");
            const ll = new LatLongAlt(lat, long);
            const waypoint = this.getActiveWaypoint();
            if (waypoint && waypoint.infos) {
                return Avionics.Utils.computeGreatCircleHeading(ll, waypoint.infos.coordinates);
            }
            return 0;
        }
        /**
         * Gets the estimated time enroute to the active waypoint.
         */
        getETEToActiveWaypoint() {
            const lat = SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude");
            const long = SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude");
            const ll = new LatLongAlt(lat, long);
            const waypoint = this.getActiveWaypoint();
            if (waypoint && waypoint.infos) {
                const dist = Avionics.Utils.computeDistance(ll, waypoint.infos.coordinates);
                let groundSpeed = SimVar.GetSimVarValue("GPS GROUND SPEED", "knots");
                if (groundSpeed < 50) {
                    groundSpeed = 50;
                }
                if (groundSpeed > 0.1) {
                    return dist / groundSpeed * 3600;
                }
            }
            return 0;
        }
        /**
         * Gets the destination airfield of the current flight plan, if any.
         */
        getDestination() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.destinationAirfield;
        }
        /**
         * Gets the currently selected departure information for the current flight plan.
         */
        getDeparture() {
            const origin = this.getOrigin();
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (origin) {
                const originInfos = origin.infos;
                if (originInfos.departures !== undefined && currentFlightPlan.procedureDetails.departureIndex !== -1) {
                    return originInfos.departures[currentFlightPlan.procedureDetails.departureIndex];
                }
            }
            return undefined;
        }
        /**
         * Gets the currently selected arrival information for the current flight plan.
         */
        getArrival() {
            const destination = this.getDestination();
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (destination) {
                const originInfos = destination.infos;
                if (originInfos.arrivals !== undefined && currentFlightPlan.procedureDetails.arrivalIndex !== -1) {
                    return originInfos.arrivals[currentFlightPlan.procedureDetails.arrivalIndex];
                }
            }
            return undefined;
        }
        /**
         * Gets the currently selected approach information for the current flight plan.
         */
        getAirportApproach() {
            const destination = this.getDestination();
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (destination) {
                const originInfos = destination.infos;
                if (originInfos.approaches !== undefined && currentFlightPlan.procedureDetails.approachIndex !== -1) {
                    return originInfos.approaches[currentFlightPlan.procedureDetails.approachIndex];
                }
            }
            return undefined;
        }
        getApproachConstraints() {
            return __awaiter(this, void 0, void 0, function* () {
                const approachWaypoints = [];
                const destination = yield this._parentInstrument.facilityLoader.getFacilityRaw(this.getDestination().icao);
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (destination) {
                    const approach = destination.approaches[currentFlightPlan.procedureDetails.approachIndex];
                    if (approach) {
                        let approachTransition = approach.transitions[0];
                        if (approach.transitions.length > 0) {
                            approachTransition = approach.transitions[currentFlightPlan.procedureDetails.approachTransitionIndex];
                        }
                        if (approach && approach.finalLegs) {
                            for (let i = 0; i < approach.finalLegs.length; i++) {
                                const wp = new WayPoint(this._parentInstrument);
                                wp.icao = approach.finalLegs[i].fixIcao;
                                wp.ident = wp.icao.substr(7);
                                wp.legAltitudeDescription = approach.finalLegs[i].altDesc;
                                wp.legAltitude1 = approach.finalLegs[i].altitude1 * 3.28084;
                                wp.legAltitude2 = approach.finalLegs[i].altitude2 * 3.28084;
                                approachWaypoints.push(wp);
                            }
                        }
                        if (approachTransition && approachTransition.legs) {
                            for (let i = 0; i < approachTransition.legs.length; i++) {
                                const wp = new WayPoint(this._parentInstrument);
                                wp.icao = approachTransition.legs[i].fixIcao;
                                wp.ident = wp.icao.substr(7);
                                wp.legAltitudeDescription = approachTransition.legs[i].altDesc;
                                wp.legAltitude1 = approachTransition.legs[i].altitude1 * 3.28084;
                                wp.legAltitude2 = approachTransition.legs[i].altitude2 * 3.28084;
                                approachWaypoints.push(wp);
                            }
                        }
                    }
                }
                return approachWaypoints;
            });
        }
        /**
         * Gets the departure waypoints for the current flight plan.
         */
        getDepartureWaypoints() {
            return this._flightPlans[this._currentFlightPlanIndex].departure.waypoints;
        }
        /**
         * Gets a map of the departure waypoints (?)
         */
        getDepartureWaypointsMap() {
            return this._flightPlans[this._currentFlightPlanIndex].departure.waypoints;
        }
        /**
         * Gets the enroute waypoints for the current flight plan.
         * @param outFPIndex An array of waypoint indexes to be pushed to.
         */
        getEnRouteWaypoints(outFPIndex) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            const enrouteSegment = currentFlightPlan.enroute;
            if (enrouteSegment !== FlightPlanSegment.Empty) {
                for (let i = 0; i < enrouteSegment.waypoints.length; i++) {
                    outFPIndex.push(enrouteSegment.offset + i);
                }
            }
            return enrouteSegment.waypoints;
        }
        /**
         * Gets the index of the last waypoint in the enroute segment of the current flight plan.
         */
        getEnRouteWaypointsLastIndex() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            const enrouteSegment = currentFlightPlan.enroute;
            return enrouteSegment.offset + (enrouteSegment.waypoints.length - 1);
        }
        /**
         * Gets the arrival waypoints for the current flight plan.
         */
        getArrivalWaypoints() {
            return this._flightPlans[this._currentFlightPlanIndex].arrival.waypoints;
        }
        /**
         * Gets the arrival waypoints for the current flight plan as a map. (?)
         */
        getArrivalWaypointsMap() {
            return this._flightPlans[this._currentFlightPlanIndex].arrival.waypoints;
        }
        /**
         * Gets the waypoints for the current flight plan with altitude constraints.
         */
        getWaypointsWithAltitudeConstraints() {
            return this._flightPlans[this._currentFlightPlanIndex].waypoints;
        }
        /**
         * Gets the flight plan segment for a flight plan waypoint.
         * @param waypoint The waypoint we want to find the segment for.
         */
        getSegmentFromWaypoint(waypoint) {
            const index = waypoint === undefined ? this.getActiveWaypointIndex() : this.indexOfWaypoint(waypoint);
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.findSegmentByWaypointIndex(index);
        }
        /**
         * Sets the destination for the current flight plan.
         * @param icao The ICAO designation for the destination airfield.
         * @param callback A callback to call once the operation completes.
         */
        setDestination(icao, callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const waypoint = yield this._parentInstrument.facilityLoader.getFacilityRaw(icao);
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.hasDestination) {
                    currentFlightPlan.removeWaypoint(currentFlightPlan.length - 1);
                }
                this._flightPlans[this._currentFlightPlanIndex].addWaypoint(waypoint);
                this._updateFlightPlanVersion();
                callback();
            });
        }
        /**
         * Adds a waypoint to the current flight plan.
         * @param icao The ICAO designation for the waypoint.
         * @param index The index of the waypoint to add.
         * @param callback A callback to call once the operation completes.
         * @param setActive Whether or not to set the added waypoint as active immediately.
         */
        addWaypoint(icao, index = Infinity, callback = () => { }, setActive = true) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                const waypoint = yield this._parentInstrument.facilityLoader.getFacilityRaw(icao);
                currentFlightPlan.addWaypoint(waypoint, index);
                this._updateFlightPlanVersion();
                callback();
            });
        }
        /**
         * Adds a user waypoint to the current flight plan.
         * @param waypoint The user waypoint to add.
         * @param index The index to add the waypoint at in the flight plan.
         * @param callback A callback to call once the operation completes.
         */
        addUserWaypoint(waypoint, index = Infinity, callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                currentFlightPlan.addWaypoint(waypoint, index);
                this._updateFlightPlanVersion();
                callback();
            });
        }
        /**
         * Sets the altitude for a waypoint in the current flight plan.
         * @param altitude The altitude to set for the waypoint.
         * @param index The index of the waypoint to set.
         * @param callback A callback to call once the operation is complete.
         */
        setWaypointAltitude(altitude, index, callback = () => { }) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            const waypoint = currentFlightPlan.getWaypoint(index);
            if (waypoint) {
                waypoint.infos.coordinates.alt = altitude;
                this._updateFlightPlanVersion();
            }
            callback();
        }
        /**
         * Sets additional data on a waypoint in the current flight plan.
         * @param index The index of the waypoint to set additional data for.
         * @param key The key of the data.
         * @param value The value of the data.
         * @param callback A callback to call once the operation is complete.
         */
        setWaypointAdditionalData(index, key, value, callback = () => { }) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            const waypoint = currentFlightPlan.getWaypoint(index);
            if (waypoint) {
                waypoint.additionalData[key] = value;
                this._updateFlightPlanVersion();
            }
            callback();
        }
        /**
         * Gets additional data on a waypoint in the current flight plan.
         * @param index The index of the waypoint to set additional data for.
         * @param key The key of the data.
         * @param callback A callback to call with the value once the operation is complete.
         */
        getWaypointAdditionalData(index, key, callback = () => { }) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            const waypoint = currentFlightPlan.getWaypoint(index);
            if (waypoint) {
                callback(waypoint.additionalData[key]);
            }
            else {
                callback(undefined);
            }
        }
        /**
         * Reverses the currently active flight plan.
         * @param {() => void} callback A callback to call when the operation is complete.
         */
        invertActiveFlightPlan(callback = () => { }) {
            this._flightPlans[this._currentFlightPlanIndex].reverse();
            this._updateFlightPlanVersion();
            callback();
        }
        /**
         * Not sure what this is supposed to do.
         * @param callback Stuff?
         */
        getApproachIfIcao(callback = () => { }) {
            callback(this.getApproach());
        }
        /**
         * Unused
         * @param {*} _callback Unused
         */
        addFlightPlanUpdateCallback(_callback) {
        }
        /**
         * Adds a waypoint to the currently active flight plan by ident(?)
         * @param ident The ident of the waypoint.
         * @param index The index to add the waypoint at.
         * @param callback A callback to call when the operation finishes.
         */
        addWaypointByIdent(ident, index, callback = EmptyCallback.Void) {
            this.addWaypoint(ident, index, callback);
        }
        /**
         * Removes a waypoint from the currently active flight plan.
         * @param index The index of the waypoint to remove.
         * @param thenSetActive Unused
         * @param callback A callback to call when the operation finishes.
         */
        removeWaypoint(index, thenSetActive = false, callback = () => { }) {
            this._flightPlans[this._currentFlightPlanIndex].removeWaypoint(index);
            this._updateFlightPlanVersion();
            callback();
        }
        /**
         * Gets the index of a given waypoint in the current flight plan.
         * @param waypoint The waypoint to get the index of.
         */
        indexOfWaypoint(waypoint) {
            return this._flightPlans[this._currentFlightPlanIndex].waypoints.indexOf(waypoint);
        }
        /**
         * Gets the number of waypoints in a flight plan.
         * @param flightPlanIndex The index of the flight plan. If omitted, will get the current flight plan.
         */
        getWaypointsCount(flightPlanIndex = NaN) {
            var _a, _b;
            if (isNaN(flightPlanIndex)) {
                flightPlanIndex = this._currentFlightPlanIndex;
            }
            return (_b = (_a = this._flightPlans[flightPlanIndex]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        }
        /**
         * Gets a count of the number of departure waypoints in the current flight plan.
         */
        getDepartureWaypointsCount() {
            return this._flightPlans[this._currentFlightPlanIndex].departure.waypoints.length;
        }
        /**
         * Gets a count of the number of arrival waypoints in the current flight plan.
         */
        getArrivalWaypointsCount() {
            return this._flightPlans[this._currentFlightPlanIndex].arrival.waypoints.length;
        }
        /**
         * Gets a waypoint from a flight plan.
         * @param index The index of the waypoint to get.
         * @param flightPlanIndex The index of the flight plan to get the waypoint from. If omitted, will get from the current flight plan.
         * @param considerApproachWaypoints Whether or not to consider approach waypoints.
         */
        getWaypoint(index, flightPlanIndex = NaN, considerApproachWaypoints) {
            if (isNaN(flightPlanIndex)) {
                flightPlanIndex = this._currentFlightPlanIndex;
            }
            return this._flightPlans[flightPlanIndex].getWaypoint(index);
        }
        /**
         * Gets all non-approach waypoints from a flight plan.
         * @param flightPlanIndex The index of the flight plan to get the waypoints from. If omitted, will get from the current flight plan.
         */
        getWaypoints(flightPlanIndex = NaN) {
            if (isNaN(flightPlanIndex)) {
                flightPlanIndex = this._currentFlightPlanIndex;
            }
            return this._flightPlans[flightPlanIndex].nonApproachWaypoints;
        }
        /**
         * Gets all waypoints from a flight plan.
         * @param flightPlanIndex The index of the flight plan to get the waypoints from. If omitted, will get from the current flight plan.
         */
        getAllWaypoints(flightPlanIndex) {
            if (flightPlanIndex === undefined) {
                flightPlanIndex = this._currentFlightPlanIndex;
            }
            if (this._flightPlans[flightPlanIndex] === undefined) {
                return [];
            }
            return this._flightPlans[flightPlanIndex].waypoints;
        }
        /**
         * Gets the index of the departure runway in the current flight plan.
         */
        getDepartureRunwayIndex() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (currentFlightPlan.hasOrigin) {
                return currentFlightPlan.procedureDetails.departureRunwayIndex;
            }
            return -1;
        }
        /**
         * Gets the string value of the departure runway in the current flight plan.
         */
        getDepartureRunway() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (currentFlightPlan.hasOrigin
                && currentFlightPlan.procedureDetails.departureRunwayIndex !== -1
                && currentFlightPlan.procedureDetails.departureIndex !== -1) {
                const depRunway = currentFlightPlan.originAirfield.infos
                    .departures[currentFlightPlan.procedureDetails.departureIndex]
                    .runwayTransitions[currentFlightPlan.procedureDetails.departureRunwayIndex]
                    .name.replace("RW", "");
                const runway = currentFlightPlan.originAirfield.infos.oneWayRunways
                    .find(r => { return r.designation.indexOf(depRunway) !== -1; });
                if (runway) {
                    return runway;
                }
                else {
                    return undefined;
                }
            }
            else if (currentFlightPlan.procedureDetails.originRunwayIndex !== -1) {
                return currentFlightPlan.originAirfield.infos.oneWayRunways[currentFlightPlan.procedureDetails.originRunwayIndex];
            }
            return undefined;
        }
        /**
         * Gets the best runway based on the current plane heading.
         */
        getDetectedCurrentRunway() {
            const origin = this.getOrigin();
            if (origin && origin.infos instanceof AirportInfo) {
                const runways = origin.infos.oneWayRunways;
                if (runways && runways.length > 0) {
                    const direction = Simplane.getHeadingMagnetic();
                    let bestRunway = runways[0];
                    let bestDeltaAngle = Math.abs(Avionics.Utils.angleDiff(direction, bestRunway.direction));
                    for (let i = 1; i < runways.length; i++) {
                        const deltaAngle = Math.abs(Avionics.Utils.angleDiff(direction, runways[i].direction));
                        if (deltaAngle < bestDeltaAngle) {
                            bestDeltaAngle = deltaAngle;
                            bestRunway = runways[i];
                        }
                    }
                    return bestRunway;
                }
            }
            return undefined;
        }
        /**
         * Gets the departure procedure index for the current flight plan.
         */
        getDepartureProcIndex() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.procedureDetails.departureIndex;
        }
        /**
         * Sets the departure procedure index for the current flight plan.
         * @param index The index of the departure procedure in the origin airport departures information.
         * @param callback A callback to call when the operation completes.
         */
        setDepartureProcIndex(index, callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.departureIndex !== index) {
                    currentFlightPlan.procedureDetails.departureIndex = index;
                    yield currentFlightPlan.buildDeparture();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Sets the departure runway index for the current flight plan.
         * @param index The index of the runway in the origin airport runway information.
         * @param callback A callback to call when the operation completes.
         */
        setDepartureRunwayIndex(index, callback = EmptyCallback.Void) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.departureIndex > -1 && index > -1) {
                    const apt = currentFlightPlan.originAirfield.infos;
                    const rwyTrans = apt.departures[currentFlightPlan.procedureDetails.departureIndex].runwayTransitions;
                    if (rwyTrans !== undefined && rwyTrans.length - 1 < index) {
                        callback();
                        return;
                    }
                }
                if (currentFlightPlan.procedureDetails.departureRunwayIndex !== index) {
                    currentFlightPlan.procedureDetails.departureRunwayIndex = index;
                    yield currentFlightPlan.buildDeparture();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Sets the origin runway index for the current flight plan.
         * @param index The index of the runway in the origin airport runway information.
         * @param callback A callback to call when the operation completes.
         */
        setOriginRunwayIndex(index, callback = EmptyCallback.Void) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.originRunwayIndex !== index) {
                    currentFlightPlan.procedureDetails.originRunwayIndex = index;
                    yield currentFlightPlan.buildDeparture();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Gets the departure transition index for the current flight plan.
         */
        getDepartureEnRouteTransitionIndex() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.procedureDetails.departureTransitionIndex;
        }
        /**
         * Sets the departure transition index for the current flight plan.
         * @param index The index of the departure transition to select.
         * @param callback A callback to call when the operation completes.
         */
        setDepartureEnRouteTransitionIndex(index, callback = EmptyCallback.Void) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.departureTransitionIndex !== index) {
                    currentFlightPlan.procedureDetails.departureTransitionIndex = index;
                    yield currentFlightPlan.buildDeparture();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Unused
         */
        getDepartureDiscontinuity() {
        }
        /**
         * Unused
         * @param callback A callback to call when the operation completes.
         */
        clearDepartureDiscontinuity(callback = EmptyCallback.Void) {
            callback();
        }
        /**
         * Removes the departure from the currently active flight plan.
         * @param callback A callback to call when the operation completes.
         */
        removeDeparture(callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                currentFlightPlan.procedureDetails.departureIndex = -1;
                yield currentFlightPlan.buildDeparture();
                this._updateFlightPlanVersion();
                callback();
            });
        }
        /**
         * Gets the arrival procedure index in the currenly active flight plan.
         */
        getArrivalProcIndex() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (currentFlightPlan.hasDestination && currentFlightPlan.procedureDetails.arrivalIndex !== -1) {
                return currentFlightPlan.procedureDetails.arrivalIndex;
            }
            return -1;
        }
        /**
         * Gets the arrival transition procedure index in the currently active flight plan.
         */
        getArrivalTransitionIndex() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.procedureDetails.arrivalTransitionIndex;
        }
        /**
         * Sets the arrival procedure index for the current flight plan.
         * @param {Number} index The index of the arrival procedure to select.
         * @param {() => void} callback A callback to call when the operation completes.
         */
        setArrivalProcIndex(index, callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.arrivalIndex !== index) {
                    currentFlightPlan.procedureDetails.arrivalIndex = index;
                    yield currentFlightPlan.buildArrival();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Unused
         */
        getArrivalDiscontinuity() {
        }
        /**
         * Unused
         * @param {*} callback
         */
        clearArrivalDiscontinuity(callback = EmptyCallback.Void) {
            callback();
        }
        /**
         * Clears a discontinuity from the end of a waypoint.
         * @param index
         */
        clearDiscontinuity(index) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            const waypoint = currentFlightPlan.getWaypoint(index);
            if (waypoint !== undefined) {
                waypoint.endsInDiscontinuity = false;
            }
            this._updateFlightPlanVersion();
        }
        /**
         * Sets the arrival transition index for the current flight plan.
         * @param {Number} index The index of the arrival transition to select.
         * @param {() => void} callback A callback to call when the operation completes.
         */
        setArrivalEnRouteTransitionIndex(index, callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.arrivalTransitionIndex !== index) {
                    currentFlightPlan.procedureDetails.arrivalTransitionIndex = index;
                    yield currentFlightPlan.buildArrival();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Sets the arrival runway index in the currently active flight plan.
         * @param {Number} index The index of the runway to select.
         * @param {() => void} callback A callback to call when the operation completes.
         */
        setArrivalRunwayIndex(index, callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.arrivalRunwayIndex !== index) {
                    currentFlightPlan.procedureDetails.arrivalRunwayIndex = index;
                    yield currentFlightPlan.buildArrival();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Sets the destination runway index in the currently active flight plan.
         * @param index The index of the runway to select.
         * @param runwayExtension The length of the runway extension fix to create, or -1 if none.
         * @param callback A callback to call when the operation completes.
         */
        setDestinationRunwayIndex(index, runwayExtension = -1, callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.destinationRunwayIndex !== index
                    || currentFlightPlan.procedureDetails.destinationRunwayExtension !== runwayExtension) {
                    currentFlightPlan.procedureDetails.destinationRunwayIndex = index;
                    currentFlightPlan.procedureDetails.destinationRunwayExtension = runwayExtension;
                    yield currentFlightPlan.buildApproach();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Gets the index of the approach in the currently active flight plan.
         */
        getApproachIndex() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.procedureDetails.approachIndex;
        }
        /**
         * Sets the approach index in the currently active flight plan.
         * @param index The index of the approach in the destination airport information.
         * @param callback A callback to call when the operation has completed.
         * @param transition The approach transition index to set in the approach information.
         */
        setApproachIndex(index, callback = () => { }, transition = -1) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.approachIndex !== index) {
                    currentFlightPlan.procedureDetails.approachIndex = index;
                    yield currentFlightPlan.buildApproach();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Whether or not an approach is loaded in the current flight plan.
         * @param forceSimVarCall Unused
         */
        isLoadedApproach(forceSimVarCall = false) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.procedureDetails.approachIndex !== -1;
        }
        /**
         * Whether or not the approach is active in the current flight plan.
         * @param forceSimVarCall Unused
         */
        isActiveApproach(forceSimVarCall = false) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.approach.waypoints.length > 0
                && currentFlightPlan.activeWaypointIndex >= currentFlightPlan.approach.offset;
        }
        /**
         * Activates the approach segment in the current flight plan.
         * @param {() => void} callback
         */
        activateApproach(callback = EmptyCallback.Void) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (!this.isActiveApproach()) ;
                callback();
            });
        }
        /**
         * Deactivates the approach segments in the current flight plan.
         */
        deactivateApproach() {
        }
        /**
         * Attemptes to auto-activate the approach in the current flight plan.
         */
        tryAutoActivateApproach() {
        }
        /**
         * Gets the index of the active waypoint on the approach in the current flight plan.
         */
        getApproachActiveWaypointIndex() {
            return this._flightPlans[this._currentFlightPlanIndex].activeWaypointIndex;
        }
        /**
         * Gets the approach procedure from the current flight plan destination airport procedure information.
         */
        getApproach() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (currentFlightPlan.hasDestination && currentFlightPlan.procedureDetails.approachIndex !== -1) {
                return currentFlightPlan.destinationAirfield.infos.approaches[currentFlightPlan.procedureDetails.approachIndex];
            }
            return undefined;
        }
        /**
         * Get the nav frequency for the selected approach in the current flight plan.
         * @returns The approach nav frequency, if an ILS approach.
         */
        getApproachNavFrequency() {
            const approach = this.getApproach();
            if (approach && approach.name.includes('ILS')) {
                const destination = this.getDestination();
                const approachRunway = this.getApproach().runway.trim();
                const aptInfo = destination.infos;
                const frequency = aptInfo.namedFrequencies.find(f => f.name.replace("RW0", "").replace("RW", "").indexOf(approachRunway) !== -1);
                if (frequency) {
                    return frequency.value;
                }
            }
            return NaN;
        }
        /**
         * Gets the index of the approach transition in the current flight plan.
         */
        getApproachTransitionIndex() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            return currentFlightPlan.procedureDetails.approachTransitionIndex;
        }
        /**
         * Gets the last waypoint index before the start of the approach segment in
         * the current flight plan.
         */
        getLastIndexBeforeApproach() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            // TODO: if we have an approach return last index
            if (currentFlightPlan.approach !== FlightPlanSegment.Empty) {
                return currentFlightPlan.approach.offset - 1;
            }
            else {
                return this.getWaypointsCount();
            }
        }
        /**
         * Gets the approach runway from the current flight plan.
         */
        getApproachRunway() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (currentFlightPlan.hasDestination && currentFlightPlan.procedureDetails.approachIndex !== -1) {
                const destination = currentFlightPlan.waypoints[currentFlightPlan.waypoints.length - 1];
                const approachRunwayName = destination.infos.approaches[currentFlightPlan.procedureDetails.approachIndex].runway;
                const runway = currentFlightPlan.getRunway(destination.infos.oneWayRunways, approachRunwayName);
                return runway;
            }
            return undefined;
        }
        /**
         * Gets the approach waypoints for the current flight plan.
         * @param fpIndex The flight plan index.
         */
        getApproachWaypoints(fpIndex = this._currentFlightPlanIndex) {
            return this._flightPlans[fpIndex].approach.waypoints;
        }
        /**
         * Sets the approach transition index for the current flight plan.
         * @param index The index of the transition in the destination airport approach information.
         * @param callback A callback to call when the operation completes.
         */
        setApproachTransitionIndex(index, callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                if (currentFlightPlan.procedureDetails.approachTransitionIndex !== index) {
                    currentFlightPlan.procedureDetails.approachTransitionIndex = index;
                    yield currentFlightPlan.buildApproach();
                    this._updateFlightPlanVersion();
                }
                callback();
            });
        }
        /**
         * Removes the arrival segment from the current flight plan.
         * @param callback A callback to call when the operation completes.
         */
        removeArrival(callback = () => { }) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                currentFlightPlan.procedureDetails.arrivalIndex = -1;
                currentFlightPlan.procedureDetails.arrivalRunwayIndex = -1;
                currentFlightPlan.procedureDetails.arrivalTransitionIndex = -1;
                yield currentFlightPlan.buildArrival();
                this._updateFlightPlanVersion();
                callback();
            });
        }
        /**
         * Activates direct-to an ICAO designated fix.
         * @param icao The ICAO designation for the fix to fly direct-to.
         * @param callback A callback to call when the operation completes.
         */
        activateDirectTo(icao, callback = EmptyCallback.Void) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                const waypointIndex = currentFlightPlan.waypoints.findIndex(w => w.icao === icao);
                yield this.activateDirectToByIndex(waypointIndex, callback);
            });
        }
        /**
         * Activates direct-to an existing waypoint in the flight plan.
         * @param waypointIndex The index of the waypoint.
         * @param callback A callback to call when the operation completes.
         */
        activateDirectToByIndex(waypointIndex, callback = EmptyCallback.Void) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                const waypoint = currentFlightPlan.getWaypoint(waypointIndex);
                if (waypointIndex !== -1) {
                    this.pauseSync();
                    while (currentFlightPlan.waypoints.findIndex(w => w.ident === "$DIR") > -1) {
                        currentFlightPlan.removeWaypoint(currentFlightPlan.waypoints.findIndex(w => w.ident === "$DIR"));
                    }
                    const newWaypointIndex = currentFlightPlan.waypoints.findIndex(x => x === waypoint);
                    currentFlightPlan.addDirectTo(newWaypointIndex);
                    this.resumeSync();
                }
                callback();
            });
        }
        /**
         * Cancels the current direct-to and proceeds back along the flight plan.
         * @param callback A callback to call when the operation completes.
         */
        cancelDirectTo(callback = EmptyCallback.Void) {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            //currentFlightPlan.directTo.cancel();
            callback();
        }
        /**
         * Gets whether or not the flight plan is current in a direct-to procedure.
         */
        getIsDirectTo() {
            return this._flightPlans[this._currentFlightPlanIndex].directTo.isActive;
        }
        /**
         * Gets the target of the direct-to procedure in the current flight plan.
         */
        getDirectToTarget() {
            const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
            if (currentFlightPlan.directTo.waypointIsInFlightPlan) {
                return currentFlightPlan.waypoints[currentFlightPlan.directTo.planWaypointIndex];
            }
            else {
                return currentFlightPlan.directTo.waypoint;
            }
        }
        /**
         * Gets the origin/start waypoint of the direct-to procedure in the current flight plan.
         */
        getDirecToOrigin() {
            return this._flightPlans[this._currentFlightPlanIndex].directTo.interceptPoints[0];
        }
        getCoordinatesHeadingAtDistanceAlongFlightPlan(distance) {
        }
        /**
         * Adds a hold at the specified waypoint index in the flight plan.
         * @param index The waypoint index to hold at.
         * @param details The details of the hold to execute.
         */
        addHoldAtWaypointIndex(index, details) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                const waypoint = currentFlightPlan.getWaypoint(index);
                if (waypoint) {
                    const newHoldWaypoint = Object.assign(new WayPoint(this._parentInstrument), waypoint);
                    newHoldWaypoint.infos = Object.assign(new WayPointInfo(this._parentInstrument), waypoint.infos);
                    const segment = currentFlightPlan.findSegmentByWaypointIndex(index);
                    newHoldWaypoint.hasHold = true;
                    newHoldWaypoint.holdDetails = details;
                    currentFlightPlan.addWaypoint(newHoldWaypoint, index + 1, segment.type);
                    yield this._updateFlightPlanVersion();
                }
            });
        }
        /**
         * Modifies a hold at the specified waypoint index in the flight plan.
         * @param index The waypoint index to hold at.
         * @param details The details of the hold to execute.
         */
        modifyHoldDetails(index, details) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                const waypoint = currentFlightPlan.getWaypoint(index);
                if (waypoint && waypoint.hasHold) {
                    waypoint.holdDetails = details;
                    yield this._updateFlightPlanVersion();
                }
            });
        }
        /**
         * Deletes a hold at the specified waypoint index in the flight plan.
         * @param index The waypoint index to delete the hold at.
         */
        deleteHoldAtWaypointIndex(index) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentFlightPlan = this._flightPlans[this._currentFlightPlanIndex];
                const waypoint = currentFlightPlan.getWaypoint(index);
                if (waypoint && waypoint.hasHold) {
                    currentFlightPlan.removeWaypoint(index);
                    yield this._updateFlightPlanVersion();
                }
            });
        }
        /**
         * Gets the coordinates of a point that is a specific distance from the destination along the flight plan.
         * @param distance The distance from destination we want the coordinates for.
         */
        getCoordinatesAtNMFromDestinationAlongFlightPlan(distance) {
            const allWaypoints = this.getAllWaypoints();
            const destination = this.getDestination();
            if (destination) {
                const fromStartDistance = destination.cumulativeDistanceInFP - distance;
                let prev;
                let next;
                for (let i = 0; i < allWaypoints.length - 1; i++) {
                    prev = allWaypoints[i];
                    next = allWaypoints[i + 1];
                    if (prev.cumulativeDistanceInFP < fromStartDistance && next.cumulativeDistanceInFP > fromStartDistance) {
                        break;
                    }
                }
                const prevCD = prev.cumulativeDistanceInFP;
                const nextCD = next.cumulativeDistanceInFP;
                const d = (fromStartDistance - prevCD) / (nextCD - prevCD);
                const output = new LatLongAlt();
                output.lat = Avionics.Utils.lerpAngle(prev.infos.coordinates.lat, next.infos.coordinates.lat, d);
                output.long = Avionics.Utils.lerpAngle(prev.infos.coordinates.long, next.infos.coordinates.long, d);
                return output;
            }
        }
        /**
         * Gets the current stored flight plan
         */
        _getFlightPlan() {
            const fpln = window.localStorage.getItem(FlightPlanManager.FlightPlanKey);
            if (fpln === null || fpln === '') {
                this._flightPlans = [];
                const initFpln = new ManagedFlightPlan();
                initFpln.setParentInstrument(this._parentInstrument);
                this._flightPlans.push(initFpln);
            }
            else {
                if (window.localStorage.getItem(FlightPlanManager.FlightPlanCompressedKey) == "1") {
                    this._flightPlans = JSON.parse(LZUTF8.decompress(fpln, { inputEncoding: "StorageBinaryString" }));
                }
                else {
                    this._flightPlans = JSON.parse(fpln);
                }
            }
        }
        getCurrentFlightPlan() {
            return this._flightPlans[this._currentFlightPlanIndex];
        }
        getFlightPlan(index) {
            return this._flightPlans[index];
        }
        /**
         * Updates the synchronized flight plan version and saves it to shared storage.
         */
        _updateFlightPlanVersion() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._isSyncPaused) {
                    return;
                }
                let fpJson = JSON.stringify(this._flightPlans.map(fp => fp.serialize()));
                if (fpJson.length > 2500000) {
                    fpJson = LZUTF8.compress(fpJson, { outputEncoding: "StorageBinaryString" });
                    window.localStorage.setItem(FlightPlanManager.FlightPlanCompressedKey, "1");
                }
                else {
                    window.localStorage.setItem(FlightPlanManager.FlightPlanCompressedKey, "0");
                }
                window.localStorage.setItem(FlightPlanManager.FlightPlanKey, fpJson);
                SimVar.SetSimVarValue(FlightPlanManager.FlightPlanVersionKey, 'number', ++this._currentFlightPlanVersion);
                FlightPlanAsoboSync.SaveToGame(this);
            });
        }
        pauseSync() {
            this._isSyncPaused = true;
        }
        resumeSync() {
            this._isSyncPaused = false;
            this._updateFlightPlanVersion();
        }
    }
    FlightPlanManager.FlightPlanKey = "WT.FlightPlan";
    FlightPlanManager.FlightPlanCompressedKey = "WT.FlightPlan.Compressed";
    FlightPlanManager.FlightPlanVersionKey = "L:WT.FlightPlan.Version";

    /**
     * Methods for interacting with the FS9GPS subsystem.
     */
    class GPS {
        /**
         * Clears the FS9GPS flight plan.
         */
        static clearPlan() {
            return __awaiter(this, void 0, void 0, function* () {
                const totalGpsWaypoints = SimVar.GetSimVarValue('C:fs9gps:FlightPlanWaypointsNumber', 'number');
                for (let i = 0; i < totalGpsWaypoints; i++) {
                    //Always remove waypoint 0 here, which shifts the rest of the waypoints down one
                    yield GPS.deleteWaypoint(0);
                }
            });
        }
        /**
         * Adds a waypoint to the FS9GPS flight plan by ICAO designation.
         * @param icao The MSFS ICAO to add to the flight plan.
         * @param index The index of the waypoint to add in the flight plan.
         */
        static addIcaoWaypoint(icao, index) {
            return __awaiter(this, void 0, void 0, function* () {
                yield SimVar.SetSimVarValue('C:fs9gps:FlightPlanNewWaypointICAO', 'string', icao);
                yield SimVar.SetSimVarValue('C:fs9gps:FlightPlanAddWaypoint', 'number', index);
            });
        }
        /**
         * Adds a user waypoint to the FS9GPS flight plan.
         * @param lat The latitude of the user waypoint.
         * @param lon The longitude of the user waypoint.
         * @param index The index of the waypoint to add in the flight plan.
         * @param ident The ident of the waypoint.
         */
        static addUserWaypoint(lat, lon, index, ident) {
            return __awaiter(this, void 0, void 0, function* () {
                yield SimVar.SetSimVarValue('C:fs9gps:FlightPlanNewWaypointLatitude', 'degrees', lat);
                yield SimVar.SetSimVarValue('C:fs9gps:FlightPlanNewWaypointLongitude', 'degrees', lon);
                if (ident) {
                    yield SimVar.SetSimVarValue('C:fs9gps:FlightPlanNewWaypointIdent', 'string', ident);
                }
                yield SimVar.SetSimVarValue('C:fs9gps:FlightPlanAddWaypoint', 'number', index);
            });
        }
        /**
         * Deletes a waypoint from the FS9GPS flight plan.
         * @param index The index of the waypoint in the flight plan to delete.
         */
        static deleteWaypoint(index) {
            return __awaiter(this, void 0, void 0, function* () {
                yield SimVar.SetSimVarValue('C:fs9gps:FlightPlanDeleteWaypoint', 'number', index);
            });
        }
        /**
         * Sets the active FS9GPS waypoint.
         * @param {Number} index The index of the waypoint to set active.
         */
        static setActiveWaypoint(index) {
            return __awaiter(this, void 0, void 0, function* () {
                yield SimVar.SetSimVarValue('C:fs9gps:FlightPlanActiveWaypoint', 'number', index);
            });
        }
        /**
         * Gets the active FS9GPS waypoint.
         */
        static getActiveWaypoint() {
            return SimVar.GetSimVarValue('C:fs9gps:FlightPlanActiveWaypoint', 'number');
        }
        /**
         * Logs the current FS9GPS flight plan.
         */
        static logCurrentPlan() {
            return __awaiter(this, void 0, void 0, function* () {
                const waypointIdents = [];
                const totalGpsWaypoints = SimVar.GetSimVarValue('C:fs9gps:FlightPlanWaypointsNumber', 'number');
                for (let i = 0; i < totalGpsWaypoints; i++) {
                    yield SimVar.SetSimVarValue('C:fs9gps:FlightPlanWaypointIndex', 'number', i);
                    waypointIdents.push(SimVar.GetSimVarValue('C:fs9gps:FlightPlanWaypointIdent', 'string'));
                }
                console.log(`GPS Plan: ${waypointIdents.join(' ')}`);
            });
        }
    }

    class MessageDefinition {
        constructor(_text, _target) {
            this._text = _text;
            this._target = _target;
        }
        get text() {
            return this._text;
        }
        get target() {
            return this._target;
        }
    }
    (function (MESSAGE_TARGET) {
        MESSAGE_TARGET[MESSAGE_TARGET["FMC"] = 0] = "FMC";
        MESSAGE_TARGET[MESSAGE_TARGET["PFD_TOP"] = 1] = "PFD_TOP";
        MESSAGE_TARGET[MESSAGE_TARGET["PFD_BOT"] = 2] = "PFD_BOT";
        MESSAGE_TARGET[MESSAGE_TARGET["MAP_MID"] = 3] = "MAP_MID";
        MESSAGE_TARGET[MESSAGE_TARGET["MFD_TOP"] = 4] = "MFD_TOP";
    })(exports.MESSAGE_TARGET || (exports.MESSAGE_TARGET = {}));
    (function (MESSAGE_LEVEL) {
        MESSAGE_LEVEL[MESSAGE_LEVEL["White"] = 0] = "White";
        MESSAGE_LEVEL[MESSAGE_LEVEL["Yellow"] = 1] = "Yellow"; // yellow
    })(exports.MESSAGE_LEVEL || (exports.MESSAGE_LEVEL = {}));

    class OperatingMessage {
        constructor(_msgDefs, _level, _weight) {
            this._msgDefs = _msgDefs;
            this._level = _level;
            this._weight = _weight;
        }
        get msgDefs() {
            return this._msgDefs;
        }
        get level() {
            return this._level;
        }
        get weight() {
            return this._weight;
        }
    }

    (function (FMS_MESSAGE_ID) {
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["INIT_POS"] = 0] = "INIT_POS";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["NO_FPLN"] = 1] = "NO_FPLN";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["FPLN_DISCO"] = 2] = "FPLN_DISCO";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["CHK_SPD"] = 3] = "CHK_SPD";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["CHK_ALT_SEL"] = 4] = "CHK_ALT_SEL";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["HOLD"] = 5] = "HOLD";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["TOD"] = 6] = "TOD";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["TERM"] = 7] = "TERM";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["TERM_LPV"] = 8] = "TERM_LPV";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["APPR"] = 9] = "APPR";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["APPR_LPV"] = 10] = "APPR_LPV";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["SEQ_INHIBIT"] = 11] = "SEQ_INHIBIT";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["LOC_WILL_BE_TUNED"] = 12] = "LOC_WILL_BE_TUNED";
        FMS_MESSAGE_ID[FMS_MESSAGE_ID["CHECK_LOC_TUNING"] = 13] = "CHECK_LOC_TUNING";
    })(exports.FMS_MESSAGE_ID || (exports.FMS_MESSAGE_ID = {}));
    /** A class that contains the CJ4 message definitions */
    class CJ4_MessageDefinitions {
        /** Gets the message definitions */
        static get definitions() {
            return this._definitions;
        }
    }
    CJ4_MessageDefinitions._definitions = new Map([
        [exports.FMS_MESSAGE_ID.INIT_POS, new OperatingMessage([new MessageDefinition("INITIALIZE POSITION", exports.MESSAGE_TARGET.FMC)], exports.MESSAGE_LEVEL.Yellow, 50)],
        [exports.FMS_MESSAGE_ID.NO_FPLN, new OperatingMessage([new MessageDefinition("NO FLIGHT PLAN", exports.MESSAGE_TARGET.FMC),
                new MessageDefinition("NO FLIGHT PLAN", exports.MESSAGE_TARGET.MAP_MID)], exports.MESSAGE_LEVEL.White, 20)],
        [exports.FMS_MESSAGE_ID.FPLN_DISCO, new OperatingMessage([new MessageDefinition("FPLN DISCONTINUITY", exports.MESSAGE_TARGET.FMC),
                new MessageDefinition("DISCONTINUITY", exports.MESSAGE_TARGET.MAP_MID)], exports.MESSAGE_LEVEL.Yellow, 90)],
        [exports.FMS_MESSAGE_ID.CHK_SPD, new OperatingMessage([new MessageDefinition("CHECK SPEED", exports.MESSAGE_TARGET.FMC),
                new MessageDefinition("SPD", exports.MESSAGE_TARGET.PFD_BOT)], exports.MESSAGE_LEVEL.Yellow, 80)],
        [exports.FMS_MESSAGE_ID.CHK_ALT_SEL, new OperatingMessage([new MessageDefinition("CHECK ALT SEL", exports.MESSAGE_TARGET.FMC)], exports.MESSAGE_LEVEL.White, 70)],
        [exports.FMS_MESSAGE_ID.HOLD, new OperatingMessage([new MessageDefinition("HOLD", exports.MESSAGE_TARGET.PFD_BOT)], exports.MESSAGE_LEVEL.White, 70)],
        [exports.FMS_MESSAGE_ID.TOD, new OperatingMessage([new MessageDefinition("TOD", exports.MESSAGE_TARGET.PFD_BOT)], exports.MESSAGE_LEVEL.White, 50)],
        [exports.FMS_MESSAGE_ID.TERM, new OperatingMessage([new MessageDefinition("TERM", exports.MESSAGE_TARGET.PFD_TOP)], exports.MESSAGE_LEVEL.White, 50)],
        [exports.FMS_MESSAGE_ID.TERM_LPV, new OperatingMessage([new MessageDefinition("LPV TERM", exports.MESSAGE_TARGET.PFD_TOP)], exports.MESSAGE_LEVEL.White, 51)],
        [exports.FMS_MESSAGE_ID.APPR, new OperatingMessage([new MessageDefinition("APPR", exports.MESSAGE_TARGET.PFD_TOP)], exports.MESSAGE_LEVEL.White, 52)],
        [exports.FMS_MESSAGE_ID.APPR_LPV, new OperatingMessage([new MessageDefinition("LPV APPR", exports.MESSAGE_TARGET.PFD_TOP)], exports.MESSAGE_LEVEL.White, 53)],
        [exports.FMS_MESSAGE_ID.SEQ_INHIBIT, new OperatingMessage([new MessageDefinition("SEQ INHB", exports.MESSAGE_TARGET.PFD_TOP)], exports.MESSAGE_LEVEL.White, 60)],
        [exports.FMS_MESSAGE_ID.LOC_WILL_BE_TUNED, new OperatingMessage([new MessageDefinition("LOC WILL BE TUNED", exports.MESSAGE_TARGET.FMC)], exports.MESSAGE_LEVEL.White, 50)],
        [exports.FMS_MESSAGE_ID.CHECK_LOC_TUNING, new OperatingMessage([new MessageDefinition("CHECK LOC TUNING", exports.MESSAGE_TARGET.FMC)], exports.MESSAGE_LEVEL.White, 75)]
    ]);

    class MessageService {
        constructor() {
            this._activeMsgs = new Map();
            this._receivers = new Map();
            // noop
        }
        static getInstance() {
            if (MessageService._instance === undefined) {
                MessageService._instance = new MessageService();
            }
            return MessageService._instance;
        }
        /**
         * Posts messages to the targets defined in the message definition
         * @param msgkey The message identifier
         * @param exitHandler A function that returns true when the msg should not be shown anymore
         * @param blinkHandler A function that returns a boolean indicating if the message should blink
         */
        post(msgkey, exitHandler, blinkHandler = () => false) {
            if (CJ4_MessageDefinitions.definitions.has(msgkey)) {
                const opmsg = CJ4_MessageDefinitions.definitions.get(msgkey);
                opmsg.msgDefs.forEach(def => {
                    if (this._receivers.has(def.target)) {
                        this._receivers.get(def.target).process(msgkey, def.text, opmsg.level, opmsg.weight, def.target, blinkHandler);
                    }
                });
                this._activeMsgs.set(msgkey, new MessageConditionChecks(exitHandler));
            }
        }
        /**
         * Clears a message from all targets
         * @param msgkey The message identifier
         */
        clear(msgkey) {
            if (this._activeMsgs.has(msgkey)) {
                this._activeMsgs.get(msgkey).exitHandler = () => true;
            }
        }
        /** Update function which calls the exitHandler function and clears messages that have to go */
        update() {
            this._activeMsgs.forEach((v, k) => {
                if (v.exitHandler() === true) {
                    const opmsg = CJ4_MessageDefinitions.definitions.get(k);
                    opmsg.msgDefs.forEach(def => {
                        if (this._receivers.has(def.target)) {
                            this._receivers.get(def.target).clear(k);
                        }
                    });
                    this._activeMsgs.delete(k);
                }
            });
        }
        /**
         * Registers a receiver implementation to the target display
         * @param target The target display
         * @param receiver The receiver
         */
        registerReceiver(target, receiver) {
            this._receivers.set(target, receiver);
        }
    }
    /** Just a wrapper */
    class MessageConditionChecks {
        constructor(_exitHandler) {
            this._exitHandler = _exitHandler;
        }
        get exitHandler() {
            return this._exitHandler;
        }
        set exitHandler(v) {
            this._exitHandler = v;
        }
    }

    class Message {
        /**
         * Constructs a new instance of Message
         * @param _content The message text
         * @param _level The {@link MessageLevel} of this message
         * @param _weight The message weight (priority)
         * @param _target The message target display
         */
        constructor(_content, _level, _weight, _target) {
            this._content = _content;
            this._level = _level;
            this._weight = _weight;
            this._target = _target;
            this._timestamp = new Date().valueOf();
        }
        /** Gets the unix timestamp for when the message was created */
        get timestamp() {
            return this._timestamp;
        }
        /** Gets the ID of the message definition */
        get Id() {
            return this._id;
        }
        /** Gets the {@link MessageLevel} of severity of the message */
        get level() {
            return this._level;
        }
        /** Gets the message weight (priority) */
        get weight() {
            return this._weight;
        }
        /** Gets the message target display */
        get target() {
            return this._target;
        }
        /** Gets the text content of this message */
        get content() {
            return this._content;
        }
    }

    class CJ4_SpeedObserver {
        /**
         *
         */
        constructor(_fpm) {
            this._fpm = _fpm;
            this._fpChecksum = 0;
            this._currentSpeedRestriction = 0;
            this._vnavDescentIas = 290;
        }
        update() {
            if (this._fpChecksum !== this._fpm.getFlightPlan(0).checksum) {
                this.updateSpeedProfile();
                this._vnavDescentIas = WTDataStore.get('CJ4_vnavDescentIas', 290);
                this._fpChecksum = this._fpm.getFlightPlan(0).checksum;
            }
            this.observeSpeed();
        }
        /** Observes the current speed restriction */
        observeSpeed() {
            // check if vnav is on
            const isVnavOn = SimVar.GetSimVarValue("L:WT_CJ4_VNAV_ON", "number") == 1;
            if (isVnavOn) {
                this._currentSpeedRestriction = this._speedProfile[this._fpm.getActiveWaypointIndex()];
                // TODO if VPATH is active check for descent target speed
                if (Simplane.getIndicatedSpeed() > (this._currentSpeedRestriction + 20)) {
                    MessageService.getInstance().post(exports.FMS_MESSAGE_ID.CHK_SPD, () => {
                        return (Simplane.getIndicatedSpeed() < (this._currentSpeedRestriction + 20)) || !isVnavOn;
                    });
                }
            }
        }
        /** Looks back in the flight plan to build an array of speed restrictions for each leg */
        updateSpeedProfile() {
            // ...
            this._speedProfile = new Array(this._fpm.getFlightPlan(0).waypoints.length).fill(999);
            const wpts = this._fpm.getFlightPlan(0).waypoints;
            let activeRestriction = 999;
            for (let i = 0; i < wpts.length; i++) {
                const wpt = wpts[i];
                let constraint = wpt.speedConstraint;
                if (constraint === -1) {
                    constraint = 999;
                }
                if (constraint !== 999 && constraint !== activeRestriction) {
                    activeRestriction = constraint;
                }
                this._speedProfile[i] = activeRestriction;
            }
        }
    }

    class CJ4_FMC_Page {
        constructor(_fmc) {
            this._fmc = _fmc;
            this._isDirty = true;
            this.refreshInterval = 1000;
        }
        /** Sets a boolean indicating if the page should be invalidated */
        set isDirty(v) {
            this._isDirty = v;
        }
        /**
         * Runs the update() method of the page implementation and calls invalidate() when needed
         */
        updateCheck() {
            this.update();
            if (this._isDirty === true) {
                this.invalidate();
            }
        }
        /** Rerenders the page and reinitializes event bindings */
        invalidate() {
            this._isDirty = true;
            this._fmc.clearDisplay();
            this.render();
            this.bindEvents();
            this._isDirty = false;
        }
    }

    class CJ4_FMC_MsgPage extends CJ4_FMC_Page {
        constructor() {
            super(...arguments);
            this._msgsChecksum = -1;
            this._currentPage = 0;
            this._pageCount = 1;
            this._offset = 0;
        }
        set currentPage(value) {
            this._currentPage = value;
            if (this._currentPage > (this._pageCount - 1)) {
                this._currentPage = 0;
            }
            else if (this._currentPage < 0) {
                this._currentPage = (this._pageCount - 1);
            }
            if (this._currentPage == 0) {
                this._offset = 0;
            }
            else {
                this._offset = ((this._currentPage) * 6);
            }
        }
        gotoNextPage() {
            this.currentPage = this._currentPage + 1;
            this.update(true);
        }
        gotoPrevPage() {
            this.currentPage = this._currentPage - 1;
            this.update(true);
        }
        hasRefresh() {
            return true;
        }
        update(force = false) {
            this._msgs = this._fmc._fmcMsgReceiver.getActiveMsgs();
            const chksum = this.getMsgsChecksum();
            if (force === true || chksum !== this._msgsChecksum) {
                this._msgsChecksum = chksum;
                this._pageCount = Math.max(1, (Math.ceil((this._msgs.length - 1) / 6)));
                this.isDirty = true;
            }
        }
        render() {
            const rows = [];
            rows.push(["", `${this._currentPage + 1}/${this._pageCount}[blue]`, "MESSAGES[blue]"]);
            rows.push(["-----NEW MESSAGES-------[blue s-text]"]);
            for (let i = this._offset; i < Math.min(6, this._msgs.length); i++) {
                const msg = this._msgs[i];
                rows.push([`${msg.content}[${msg.level === exports.MESSAGE_LEVEL.Yellow ? "yellow" : "white"}]`]);
                rows.push([""]);
            }
            this._fmc._templateRenderer.setTemplateRaw(rows);
        }
        bindEvents() {
            this._fmc.onPrevPage = () => {
                this.gotoPrevPage();
            };
            this._fmc.onNextPage = () => {
                this.gotoNextPage();
            };
        }
        /** Gets the checksum of the current active message ids */
        getMsgsChecksum() {
            let checksum = 0;
            for (let i = this._offset; i < this._msgs.length; i++) {
                const msg = this._msgs[i];
                checksum += msg.Id;
            }
            return checksum;
        }
    }

    /**
     * A class that handles searching for nearest VOR stations.
     */
    class CJ4_NearestVORSearch {
        /**
         * Searches for the nearest VOR stations to the current aircraft position.
         * @param distance The maximum distance in NM to search.
         * @param maxItems The maximum number of VOR stations to return.
         */
        static searchNearest(distance, maxItems) {
            return __awaiter(this, void 0, void 0, function* () {
                const instrId = 'CJ4_FMC';
                const batch = new SimVar.SimVarBatch("C:fs9gps:NearestVorItemsNumber", "C:fs9gps:NearestVorCurrentLine");
                batch.add("C:fs9gps:NearestVorCurrentICAO", "string", "string");
                batch.add("C:fs9gps:NearestVorCurrentDistance", "nautical miles", "number");
                batch.add("C:fs9gps:NearestVorCurrentFrequency", "MHz", "number");
                const startSearch = () => __awaiter(this, void 0, void 0, function* () {
                    const lat = SimVar.GetSimVarValue("GPS POSITION LAT", "degree latitude");
                    const long = SimVar.GetSimVarValue("GPS POSITION LON", "degree longitude");
                    yield SimVar.SetSimVarValue("C:fs9gps:NearestVorCurrentLatitude", "degree latitude", lat, instrId);
                    yield SimVar.SetSimVarValue("C:fs9gps:NearestVorCurrentLongitude", "degree longitude", long, instrId);
                    yield SimVar.SetSimVarValue("C:fs9gps:NearestVorMaximumItems", "number", maxItems, instrId);
                    yield SimVar.SetSimVarValue("C:fs9gps:NearestVorMaximumDistance", "nautical miles", distance, instrId);
                });
                const stall = (timeout) => {
                    return new Promise(resolve => setTimeout(() => resolve(), timeout));
                };
                while (true) {
                    const lat = SimVar.GetSimVarValue("GPS POSITION LAT", "degree latitude");
                    const long = SimVar.GetSimVarValue("GPS POSITION LON", "degree longitude");
                    const currentLat = SimVar.GetSimVarValue("C:fs9gps:NearestVorCurrentLatitude", "degree latitude", instrId);
                    const currentLon = SimVar.GetSimVarValue("C:fs9gps:NearestVorCurrentLongitude", "degree longitude", instrId);
                    if (currentLat.toFixed(4) !== lat.toFixed(4) || currentLon.toFixed(4) !== long.toFixed(4)) {
                        yield startSearch();
                        yield stall(1000);
                    }
                    else {
                        break;
                    }
                }
                yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    let numItems = 0;
                    let retries = 0;
                    const checkNumItems = () => {
                        setTimeout(() => {
                            const currentNumItems = SimVar.GetSimVarValue('C:fs9gps:NearestVorItemsNumber', 'number', instrId);
                            if (currentNumItems === 0 || currentNumItems !== numItems) {
                                if (currentNumItems === 0) {
                                    retries++;
                                }
                                if (retries > 8) {
                                    retries = 0;
                                    startSearch().then(() => { });
                                }
                                numItems = currentNumItems;
                                checkNumItems();
                            }
                            else {
                                resolve();
                            }
                        }, 250);
                    };
                    checkNumItems();
                }));
                return yield new Promise((resolve) => SimVar.GetSimVarArrayValues(batch, values => {
                    resolve(values.map(vor => ({
                        icao: vor[0],
                        distance: vor[1],
                        frequency: parseFloat(vor[2].toFixed(2))
                    })).sort((a, b) => a.distance - b.distance));
                }, instrId));
            });
        }
    }

    /**
     * The CJ4 Nav Radio system.
     */
    class CJ4_NavRadioSystem {
        constructor() {
            /** The states of the nav radios. */
            this.radioStates = [];
            this.presets = [];
            /** Whether or not a nearest VOR search is pending. */
            this.searchPending = false;
            this.radioStates[1] = new CJ4NavRadioState(1);
            this.radioStates[2] = new CJ4NavRadioState(2);
        }
        /**
         * Initializes the radio system.
         */
        initialize() {
            const presetsString = WTDataStore.get(`WT_CJ4_NAV_RADIO_PRESETS`, '[]');
            this.presets = JSON.parse(presetsString);
            setInterval(() => {
                this.radioStates[1].initialize();
                this.radioStates[2].initialize();
            }, 1000);
        }
        /**
         * Updates the nav radio system.
         */
        update() {
            const radio1Freq = parseFloat(SimVar.GetSimVarValue('NAV ACTIVE FREQUENCY:1', 'MHz').toFixed(2));
            const radio2Freq = parseFloat(SimVar.GetSimVarValue('NAV ACTIVE FREQUENCY:2', 'MHz').toFixed(2));
            if (radio1Freq !== this.radioStates[1].frequency) {
                this.radioStates[1].frequency = radio1Freq;
            }
            if (radio2Freq !== this.radioStates[2].frequency) {
                this.radioStates[2].frequency = radio2Freq;
            }
            this.updateAutoTuning();
        }
        /**
         * Sets a nav radio preset.
         * @param index The index of the preset to set.
         * @param frequency The frequency to set the preset to.
         */
        setPreset(index, frequency) {
            this.presets[index] = frequency;
            WTDataStore.set(`WT_CJ4_NAV_RADIO_PRESETS`, JSON.stringify(this.presets));
        }
        /**
         * Parses an input frequency string to return a valid nav frequency.
         * @param value The value to parse.
         * @returns The nav frequency, if valid.
         */
        parseFrequencyInput(value) {
            let frequency = parseFloat(value);
            if (isFinite(frequency)) {
                frequency = Math.round(frequency * 100) / 100;
                if (frequency >= 108 && frequency <= 117.95) {
                    return frequency;
                }
                if (frequency >= 8 && frequency <= 17.95) {
                    return frequency + 100;
                }
                if (frequency >= 118 && frequency <= 179) {
                    return (frequency / 10) + 100;
                }
                if (frequency >= 800 && frequency <= 1795) {
                    return (frequency / 100) + 100;
                }
            }
            return NaN;
        }
        /**
         * Updates the auto-tuning of the nav radios.
         */
        updateAutoTuning() {
            const now = Date.now();
            const nav1TimeSinceTuned = now - this.radioStates[1].lastAutoTuned;
            const nav2TimeSinceTuned = now - this.radioStates[2].lastAutoTuned;
            const sixMinutes = 6 * 60 * 1000;
            let shouldSearch1 = false;
            let shouldSearch2 = false;
            if (this.radioStates[1].mode === exports.NavRadioMode.Auto && nav1TimeSinceTuned > sixMinutes && !this.searchPending) {
                shouldSearch1 = true;
            }
            if (this.radioStates[2].mode === exports.NavRadioMode.Auto && nav2TimeSinceTuned > sixMinutes && !this.searchPending) {
                shouldSearch2 = true;
            }
            if (shouldSearch1 || shouldSearch2) {
                this.searchPending = true;
                CJ4_NearestVORSearch.searchNearest(100, 10).then(stations => {
                    if (stations[0] && shouldSearch1) {
                        this.radioStates[1].setAutomaticFrequency(stations[0].frequency);
                        this.radioStates[1].lastAutoTuned = Date.now();
                    }
                    if (stations[1] && shouldSearch2) {
                        this.radioStates[2].setAutomaticFrequency(stations[1].frequency);
                        this.radioStates[2].lastAutoTuned = Date.now();
                    }
                    this.searchPending = false;
                });
            }
        }
    }
    (function (NavRadioMode) {
        NavRadioMode["Manual"] = "MAN";
        NavRadioMode["Auto"] = "AUTO";
    })(exports.NavRadioMode || (exports.NavRadioMode = {}));
    /**
     * The state of a single NAV radio.
     */
    class CJ4NavRadioState {
        /**
         * Creates an instance of CJ4NavRadioState.
         * @param radioIndex The index of the radio.
         */
        constructor(radioIndex) {
            /** The current nav radio mode. */
            this.mode = exports.NavRadioMode.Manual;
            /** The current nav radio frequency. */
            this.frequency = 110.0;
            /** The last time the nav radio was auto-tuned. */
            this.lastAutoTuned = 0;
            this.radioIndex = radioIndex;
        }
        /**
         * Initializes the radio state.
         */
        initialize() {
            this.frequency = WTDataStore.get(`WT_CJ4_LAST_NAV_FREQ:${this.radioIndex}`, 110.0);
            SimVar.SetSimVarValue(`K:NAV${this.radioIndex}_RADIO_SET_HZ`, 'Hz', this.frequency * 1000000);
        }
        /**
         * Sets a manual nav frequency.
         * @param frequency The frequency to set.
         */
        setManualFrequency(frequency) {
            SimVar.SetSimVarValue(`K:NAV${this.radioIndex}_RADIO_SET_HZ`, 'Hz', frequency * 1000000);
            WTDataStore.set(`WT_CJ4_LAST_NAV_FREQ:${this.radioIndex}`, frequency);
            this.mode = exports.NavRadioMode.Manual;
            this.lastAutoTuned = 0;
            this.frequency = frequency;
        }
        /**
         * Sets an automatically set nav frequency.
         * @param frequency The frequency to set.
         */
        setAutomaticFrequency(frequency) {
            SimVar.SetSimVarValue(`K:NAV${this.radioIndex}_RADIO_SET_HZ`, 'Hz', frequency * 1000000);
            WTDataStore.set(`WT_CJ4_LAST_NAV_FREQ:${this.radioIndex}`, frequency);
        }
    }

    /**
     * The NAV CONTROL FMC page.
     */
    class CJ4_FMC_NavControlPage extends CJ4_FMC_Page {
        /**
         * Creates an instance of the CJ4_FMC_NavControlPage.
         * @param fmc The FMC to use with this instance.
         * @param radioIndex The index of the radio for the page.
         */
        constructor(fmc, radioIndex) {
            super(fmc);
            /** The current page number. */
            this.currentPageNumber = 1;
            this.radioSystem = fmc._navRadioSystem;
            this.radioIndex = radioIndex;
            this.templateRenderer = fmc._templateRenderer;
        }
        /**
         * Whether or not the page has an automatic refresh.
         */
        hasRefresh() {
            return true;
        }
        /**
         * Updates the page.
         */
        update() {
            this.isDirty = true;
        }
        /**
         * Renders the nav control page.
         */
        render() {
            const rows = [];
            const radioState = this.radioSystem.radioStates[this.radioIndex];
            const autoManSwitch = this.templateRenderer.renderSwitch(['AUTO', 'MAN'], radioState.mode === exports.NavRadioMode.Auto ? 0 : 1, 'blue');
            rows.push(['', `${this.currentPageNumber}/7[blue]`, `NAV${this.radioIndex} CONTROL[blue]`]);
            rows.push([` NAV${this.radioIndex}`, 'NAV TUNING ']);
            rows.push([`${radioState.frequency.toFixed(2)}[green]`, autoManSwitch]);
            rows.push([` DME${this.radioIndex}`]);
            rows.push(['HOLD[disabled s-text]', 'TEST[disabled s-text]']);
            rows.push([' MKR SENS']);
            rows.push(['LO/[disabled]HI[disabled s-text]']);
            rows.push(['------[blue] NAV PRESETS[white] -----[blue]']);
            const presetStart = ((this.currentPageNumber * 3) - 3) + 1;
            rows.push([`${this.displayPreset(presetStart - 1)}`, `${presetStart}`]);
            rows.push(['']);
            rows.push([`${this.displayPreset(presetStart)}`, `${presetStart + 1}`]);
            rows.push(['']);
            if (this.currentPageNumber !== 7) {
                rows.push([`${this.displayPreset(presetStart + 1)}`, `${presetStart + 2}`]);
            }
            this.templateRenderer.setTemplateRaw(rows);
        }
        /**
         * Gets the display value for a given nav radio preset.
         * @param preset The preset index to display.
         * @returns The preset frequency as a string.
         */
        displayPreset(preset) {
            var _a;
            const presetFrequency = this.radioSystem.presets[preset];
            return (_a = presetFrequency === null || presetFrequency === void 0 ? void 0 : presetFrequency.toFixed(2)) !== null && _a !== void 0 ? _a : '';
        }
        /**
         * Binds input events for the nav control page.
         */
        bindEvents() {
            this._fmc.onLeftInput[0] = () => {
                const radioState = this.radioSystem.radioStates[this.radioIndex];
                if (this._fmc.inOut === undefined || this._fmc.inOut === '') {
                    CJ4_FMC_NavRadioPage.ShowPage1(this._fmc);
                }
                else {
                    this.handleFreqPressed(() => radioState.frequency, value => radioState.setManualFrequency(value));
                    this.render();
                    this.bindEvents();
                }
            };
            this._fmc.onRightInput[0] = () => {
                const radioState = this.radioSystem.radioStates[this.radioIndex];
                radioState.mode = radioState.mode === exports.NavRadioMode.Auto ? exports.NavRadioMode.Manual : exports.NavRadioMode.Auto;
                this.render();
                this.bindEvents();
            };
            this.bindPresets(this.currentPageNumber === 7 ? 2 : 3, 3, (this.currentPageNumber * 3) - 3);
            this._fmc.onNextPage = () => {
                this.currentPageNumber = Math.min(this.currentPageNumber + 1, 7);
                this.render();
                this.bindEvents();
            };
            this._fmc.onPrevPage = () => {
                this.currentPageNumber = Math.max(this.currentPageNumber - 1, 1);
                this.render();
                this.bindEvents();
            };
        }
        /**
         * Binds the buttons for the preset LSKs.
         * @param totalPresets The total number of presets on the page.
         * @param startLSK The starting LSK for the preset bindings.
         * @param startPreset The starting index for the presets.
         */
        bindPresets(totalPresets, startLSK, startPreset) {
            for (let i = 0; i < totalPresets; i++) {
                this._fmc.onLeftInput[startLSK + i] = () => {
                    this.handleFreqPressed(() => this.radioSystem.presets[startPreset + i], value => this.radioSystem.setPreset(startPreset + i, value));
                    this.render();
                    this.bindEvents();
                };
            }
        }
        /**
         * Handles when a frequency button is pressed on the page.
         * @param getter A function that gets the frequency value to copy to the scratchpad.
         * @param setter A function that sets the frequency value into the radio state from the parsed input.
         */
        handleFreqPressed(getter, setter) {
            if (this._fmc.inOut !== undefined && this._fmc.inOut !== '') {
                const numValue = this.radioSystem.parseFrequencyInput(this._fmc.inOut);
                if (isFinite(numValue) && numValue >= 108 && numValue <= 117.95 && RadioNav.isHz50Compliant(numValue)) {
                    setter(numValue);
                    this._fmc.inOut = '';
                }
                else {
                    this._fmc.showErrorMessage(this._fmc.defaultInputErrorMessage);
                }
            }
            else {
                this._fmc.inOut = getter().toFixed(2);
            }
        }
    }

    /** A class for managing and showing navigation between FMC pages */
    class CJ4_FMC_NavigationService {
        constructor(_fmc) {
            this._fmc = _fmc;
        }
        /** Constructs and shows a page given the type as argument */
        showPage(page, ...args) {
            this._fmc.clearDisplay();
            this._currentPage = new page(this._fmc, ...args);
            this._currentPage.updateCheck();
            if (this._currentPage.hasRefresh()) {
                this.registerRefresh();
            }
        }
        /** Registers the refresh loop  */
        registerRefresh() {
            // register refresh and bind to update which will only render on changes
            this._fmc.registerPeriodicPageRefresh(() => {
                this._currentPage.updateCheck();
                this.registerRefresh();
                return true;
            }, this._currentPage.refreshInterval, false);
        }
    }

    /**
     * The receiver for messages shown in the FMC
     */
    class CJ4_FMC_MessageReceiver {
        constructor() {
            this._activeMsgs = new Map();
        }
        process(id, text, level, weight, target) {
            if (!this._activeMsgs.has(id)) {
                this._activeMsgs.set(id, new Message(text, level, weight, target));
            }
        }
        clear(id) {
            this._activeMsgs.delete(id);
        }
        /** Returns a boolean indicating if there are active messages */
        hasMsg() {
            return this._activeMsgs.size > 0;
        }
        /** Returns the string content of the highest priority message */
        getMsgText() {
            if (!this.hasMsg()) {
                SimVar.SetSimVarValue("L:WT_CJ4_DISPLAY_MSG", "number", -1);
                return "";
            }
            // find highest priority message
            let msgToShow;
            this._activeMsgs.forEach((v, k) => {
                if (msgToShow === undefined) {
                    msgToShow = v;
                }
                else {
                    if ((v.level > msgToShow.level) || (v.level === msgToShow.level && v.weight > msgToShow.weight)) {
                        msgToShow = v;
                    }
                }
            });
            SimVar.SetSimVarValue("L:WT_CJ4_DISPLAY_MSG", "number", msgToShow.level);
            return msgToShow.content + "[" + (msgToShow.level == exports.MESSAGE_LEVEL.Yellow ? "yellow" : "white") + "]";
        }
        /** Returns all active messages */
        getActiveMsgs() {
            return Array.from(this._activeMsgs.values());
        }
    }

    class CJ4_PFD_Message extends Message {
        get blinkCheckHandler() {
            return this._blinkCheckHandler;
        }
        set blinkCheckHandler(v) {
            this._blinkCheckHandler = v;
        }
        /** Returns a boolean indicating if the message should blink */
        shouldBlink() {
            return this._blinkCheckHandler();
        }
        get isBlinking() {
            return this._isBlinking;
        }
        set isBlinking(v) {
            this._isBlinking = v;
        }
    }

    class CJ4_PFD_MessageReceiver {
        constructor() {
            this._activeMsgs = new Map();
            window.localStorage.setItem(CJ4_PFD_MessageReceiver.PFD_MSGS_KEY, "");
        }
        process(id, text, level, weight, target, blinkHandler = () => false) {
            const pfdMsg = new CJ4_PFD_Message(text, level, weight, target);
            pfdMsg.blinkCheckHandler = blinkHandler;
            if (!this._activeMsgs.has(id)) {
                this._activeMsgs.set(id, pfdMsg);
            }
        }
        clear(id) {
            this._activeMsgs.delete(id);
        }
        /** Update function called by the FMS to update and send messages to the pfd */
        update() {
            if (this.hasMsg()) {
                this._activeMsgs.forEach((v) => {
                    v.isBlinking = v.blinkCheckHandler();
                });
                const msgArray = Array.from(this._activeMsgs.values());
                const msgPacket = {
                    top: JSON.stringify(this.pickHighPriorityMsg(msgArray, exports.MESSAGE_TARGET.PFD_TOP), ["_content", "_level", "_isBlinking"]),
                    bot: JSON.stringify(this.pickHighPriorityMsg(msgArray, exports.MESSAGE_TARGET.PFD_BOT), ["_content", "_level", "_isBlinking"]),
                    map: JSON.stringify(this.pickHighPriorityMsg(msgArray, exports.MESSAGE_TARGET.MAP_MID), ["_content", "_level"])
                };
                const msgJson = JSON.stringify(msgPacket); //, );
                window.localStorage.setItem(CJ4_PFD_MessageReceiver.PFD_MSGS_KEY, msgJson);
            }
            else {
                window.localStorage.setItem(CJ4_PFD_MessageReceiver.PFD_MSGS_KEY, "");
            }
        }
        /**
         * Filters messages by target and returns the one with the highes priority
         * @param msgs Array of messages
         * @param target The display target
         */
        pickHighPriorityMsg(msgs, target) {
            const filteredArr = msgs.filter((v) => {
                return v.target === target;
            });
            // find highest priority message
            let returnMsg;
            filteredArr.forEach(v => {
                if (returnMsg === undefined) {
                    returnMsg = v;
                }
                else {
                    if ((v.level > returnMsg.level) || (v.level === returnMsg.level && v.weight > returnMsg.weight)) {
                        returnMsg = v;
                    }
                }
            });
            return returnMsg;
        }
        /** Returns a boolean indicating if there are active messages */
        hasMsg() {
            return this._activeMsgs.size > 0;
        }
    }
    CJ4_PFD_MessageReceiver.PFD_MSGS_KEY = "WT_CJ4_PFD_MESSAGES";

    class CJ4_PFD_MsgInfo extends HTMLElement {
        constructor() {
            super();
            // update rate control
            this.UPDATE_RATE = 500;
            this._elapsedTime = 0;
            this._fmcMsgTimestamp = -1;
            this._lastFmcMsgLevel = -1;
        }
        set botLeftText(v) {
            if (v !== this._botLeftText) {
                this._botLeftElement.innerHTML = v + "&nbsp;";
                this._botLeftText = v;
            }
        }
        set botRightText(v) {
            if (v !== this._botRightText) {
                this._botRightElement.innerHTML = v;
                this._botRightText = v;
            }
        }
        set topText(v) {
            if (v !== this._topText) {
                this._topElement.innerHTML = v;
                this._topText = v;
            }
        }
        connectedCallback() {
            this._topElement = this.querySelector('#PFDMessageTop');
            this._botLeftElement = this.querySelector('#PFDMessageBotLeft');
            this._botRightElement = this.querySelector('#PFDMessageBotRight');
        }
        /** Update function called by the display */
        update(_dTime) {
            this._elapsedTime += _dTime;
            if (this._elapsedTime >= this.UPDATE_RATE) {
                const msgsJson = window.localStorage.getItem(CJ4_PFD_MessageReceiver.PFD_MSGS_KEY);
                if (msgsJson !== "") {
                    // read msg packet
                    const msgs = JSON.parse(msgsJson);
                    if (msgs === null) {
                        return;
                    }
                    // get bottom msg
                    if (msgs.bot) {
                        const msg = JSON.parse(msgs.bot); // For some reason can't access properties when parsing back to CJ4_PFD_Message :(
                        this.botRightText = this.getMsgString(msg);
                    }
                    else if (this._botRightText !== "") {
                        this.botRightText = "";
                    }
                    // get top msg
                    if (msgs.top) {
                        const msg = JSON.parse(msgs.top);
                        this.topText = this.getMsgString(msg);
                    }
                    else if (this._topText !== "") {
                        this.topText = "";
                    }
                }
                else {
                    this.topText = "";
                    this.botRightText = "";
                }
                // Doing the MSG manually here as it is pretty "static"
                const fmcMsgLevel = SimVar.GetSimVarValue("L:WT_CJ4_DISPLAY_MSG", "number");
                if (fmcMsgLevel !== this._lastFmcMsgLevel) {
                    this._fmcMsgTimestamp = Date.now();
                    this._lastFmcMsgLevel = fmcMsgLevel;
                }
                if (fmcMsgLevel > -1) {
                    const fakeMsg = {
                        _level: fmcMsgLevel,
                        _content: "MSG",
                        _isBlinking: (fmcMsgLevel == exports.MESSAGE_LEVEL.Yellow && Date.now() - this._fmcMsgTimestamp < 5000)
                    };
                    this.botLeftText = this.getMsgString(fakeMsg);
                }
                else if (fmcMsgLevel === -1) {
                    this.botLeftText = "";
                }
                this._elapsedTime = 0;
            }
        }
        /**
         * Returns a formatted string for message display
         * @param msg The message object
         */
        getMsgString(msg) {
            return `<span class="${(msg._level === exports.MESSAGE_LEVEL.Yellow ? "yellow" : "white")} ${(msg._isBlinking) ? "blinking" : ""}">${msg._content}</span>`;
        }
    }
    customElements.define("cj4-pfd-msg-info", CJ4_PFD_MsgInfo);

    /**
     * An annunciation display slot on the PFD FGS display.
     */
    class CJ4_FGSDisplaySlot {
        /**
         * Creates an instance of a CJ4_FGSDisplaySlot.
         * @param element The underlying HTML element.
         * @param shouldFlash Whether or not the element should flash on change.
         */
        constructor(element, shouldFlash = false) {
            this.element = element;
            this.shouldFlash = shouldFlash;
            /** The current FGS slot display value. */
            this.currentDisplayValue = '';
            /** Whether or not the FGS mode is currently failed. */
            this.currentlyIsFailed = undefined;
            if (element === undefined || element === null) {
                throw new Error('Element cannot be undefined or null.');
            }
            this.valueSpan = this.element.querySelector('.fmaValue');
        }
        /**
         * Sets the FGS slot display value.
         * @param value The value to display.
         */
        setDisplayValue(value) {
            if (value !== this.currentDisplayValue) {
                this.currentDisplayValue = value;
                clearTimeout(this.blinkTimeout);
                if (value !== undefined || value !== '') {
                    this.valueSpan.textContent = value;
                    if (this.shouldFlash) {
                        this.element.classList.add('blinking');
                        this.blinkTimeout = setTimeout(() => this.element.classList.remove('blinking'), 4000);
                    }
                }
                else {
                    this.valueSpan.textContent = '';
                    this.element.classList.remove('blinking');
                }
            }
        }
        /**
         * Sets the FGS slot failure strikethrough.
         * @param isFailed
         */
        setFailed(isFailed) {
            if (this.currentlyIsFailed !== isFailed) {
                this.currentlyIsFailed = isFailed;
                if (isFailed) {
                    this.valueSpan.classList.add('fail');
                }
                else {
                    this.valueSpan.classList.remove('fail');
                }
            }
        }
    }

    /*
      This code is "public domain". You can copy, modify, re-release and re-license,
      or incorporate into any other project without restriction of any kind.
      Tiny SHA256 by Geraint Luff - https://github.com/geraintluff/
    */
    class OAuthPkce {
        // eslint-disable-next-line no-var
        static sha256(r) { function t(r, t) { return r >>> t | r << 32 - t; } for (var h, n, o = Math.pow, e = o(2, 32), f = "", a = [], l = 8 * r.length, g = h = h || [], c = k = k || [], i = c.length, s = {}, u = 2; i < 64; u++)
            if (!s[u]) {
                for (h = 0; h < 313; h += u)
                    s[h] = u;
                g[i] = o(u, .5) * e | 0, c[i++] = o(u, 1 / 3) * e | 0;
            } for (r += ""; r.length % 64 - 56;)
            r += "\0"; for (h = 0; h < r.length; h++) {
            if ((n = r.charCodeAt(h)) >> 8)
                return;
            a[h >> 2] |= n << (3 - h) % 4 * 8;
        } for (a[a.length] = l / e | 0, a[a.length] = l, n = 0; n < a.length;) {
            var v = a.slice(n, n += 16), k = g;
            for (g = g.slice(0, 8), h = 0; h < 64; h++) {
                var d = v[h - 15], p = v[h - 2], w = g[0], A = g[4], C = g[7] + (t(A, 6) ^ t(A, 11) ^ t(A, 25)) + (A & g[5] ^ ~A & g[6]) + c[h] + (v[h] = h < 16 ? v[h] : v[h - 16] + (t(d, 7) ^ t(d, 18) ^ d >>> 3) + v[h - 7] + (t(p, 17) ^ t(p, 19) ^ p >>> 10) | 0);
                (g = [C + ((t(w, 2) ^ t(w, 13) ^ t(w, 22)) + (w & g[1] ^ w & g[2] ^ g[1] & g[2])) | 0].concat(g))[4] = g[4] + C | 0;
            }
            for (h = 0; h < 8; h++)
                g[h] = g[h] + k[h] | 0;
        } for (h = 0; h < 8; h++)
            for (n = 3; n + 1; n--) {
                var M = g[h] >> 8 * n & 255;
                f += (M < 16 ? 0 : "") + M.toString(16);
            } return f; }
        static getRandomBytes(length) {
            const bytes = new Uint8Array(length);
            window.crypto.getRandomValues(bytes);
            return bytes;
        }
        static arrayBufferToBase64(buffer) {
            const bytes = new Uint8Array(buffer);
            const binary = bytes.reduce((previousValue, currentValue) => {
                return previousValue + String.fromCharCode(currentValue);
            }, "");
            return btoa(binary);
        }
        static base64URLEncode(str) {
            return OAuthPkce.arrayBufferToBase64(str)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        }
        static hexStringToBytes(str) {
            return Array.from(str.match(/.{1,2}/g), (byte) => {
                return parseInt(byte, 16);
            });
        }
        static getChallenge(len) {
            const verifier = OAuthPkce.base64URLEncode(OAuthPkce.getRandomBytes(len));
            const challenge = OAuthPkce.base64URLEncode(OAuthPkce.hexStringToBytes(OAuthPkce.sha256(verifier)));
            return { "code_verifier": verifier, "code_challenge": challenge };
        }
    }

    const DEFAULT_REQUEST_OPTIONS = {
        ignoreCache: true,
        headers: {
            Accept: 'application/json, text/javascript, text/plain',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        // default max duration for a request
        timeout: 10000,
    };
    function queryParams(params = {}) {
        if (params === null) {
            return "";
        }
        return Object.keys(params)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
            .join('&');
    }
    function urlencodeFormData(fd) {
        const params = new URLSearchParams();
        fd.forEach((v, k) => {
            params.append(k, v);
        });
        return params.toString();
    }
    function withQuery(url, params = {}) {
        const queryString = queryParams(params);
        return queryString ? url + (url.indexOf('?') === -1 ? '?' : '&') + queryString : url;
    }
    function parseXHRResult(xhr) {
        return {
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            headers: xhr.getAllResponseHeaders(),
            data: xhr.responseText,
            json: () => JSON.parse(xhr.responseText),
        };
    }
    function errorResponse(xhr, message = null) {
        return {
            ok: false,
            status: xhr.status,
            statusText: xhr.statusText,
            headers: xhr.getAllResponseHeaders(),
            data: message || xhr.statusText,
            json: () => JSON.parse(message || xhr.statusText),
        };
    }
    function request(method, url, queryParams = {}, body = null, options = DEFAULT_REQUEST_OPTIONS) {
        return __awaiter(this, void 0, void 0, function* () {
            const ignoreCache = options.ignoreCache || DEFAULT_REQUEST_OPTIONS.ignoreCache;
            const headers = options.headers || DEFAULT_REQUEST_OPTIONS.headers;
            const timeout = options.timeout || DEFAULT_REQUEST_OPTIONS.timeout;
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                const href = withQuery(url, queryParams);
                xhr.open(method, url, true);
                if (headers) {
                    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
                }
                // xhr.timeout = timeout;
                xhr.onload = evt => {
                    resolve(parseXHRResult(xhr));
                };
                xhr.onerror = evt => {
                    resolve(errorResponse(xhr, 'Failed to make request.'));
                };
                xhr.ontimeout = evt => {
                    resolve(errorResponse(xhr, 'Request took longer than expected.'));
                };
                if (method === 'post' && body) {
                    if (body instanceof Map) {
                        xhr.send(urlencodeFormData(body));
                    }
                    else {
                        xhr.send(JSON.stringify(body));
                    }
                }
                else {
                    xhr.send();
                }
            });
        });
    }

    class NavigraphApi {
        constructor() {
            this.RFRSH_TOKEN_KEY = "WT_NG_REFRESH_TOKEN";
            this.ACC_TOKEN_KEY = "WT_NG_ACC_TOKEN";
            this._refreshToken = "";
            this._chartListCache = new Map();
            this._chartCacheTimestamp = 0;
            this._accessTokenTimestamp = 0;
            this.placeholdertext1 = "ㆶᩙⷎ䗶䬠耂老";
            this.placeholdertext2 = "㮺୘浆䀀耀";
            this.placeholdertext3 = "ㆶᩙⷎ䗷ᬫ෉䫨耂老";
            this.placeholdertext4 = "⎜啐䫩瑔ᨚ⦕ӊㅎㄧ嶌☋ᙤ㨓㶜炬楖㔤䀀耀";
        }
        /** Gets a boolean indicating if the navigraph account is linked */
        get isAccountLinked() {
            this._refreshToken = WTDataStore.get(this.RFRSH_TOKEN_KEY, "");
            return this._refreshToken !== "";
        }
        /** Sets the refresh token */
        set refreshToken(val) {
            this._refreshToken = val;
            WTDataStore.set(this.RFRSH_TOKEN_KEY, val);
        }
        get refreshToken() {
            return WTDataStore.get(this.RFRSH_TOKEN_KEY, "");
        }
        /** Returns a boolean indicating if a access token is known */
        get hasAccessToken() {
            return this.accessToken !== null;
        }
        /** Sets the access token */
        set accessToken(val) {
            localStorage.setItem(this.ACC_TOKEN_KEY, val);
            this._accessTokenTimestamp = Date.now();
        }
        /** Gets the access token */
        get accessToken() {
            return localStorage.getItem(this.ACC_TOKEN_KEY);
        }
        /**
         * Checks if the access token is still good or starts the link account process
         */
        validateToken() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isAccountLinked) {
                    if (!this.hasAccessToken ||
                        (this.hasAccessToken && (Date.now() - this._accessTokenTimestamp) > 900000)) {
                        yield this.refreshAccessToken();
                    }
                }
                else {
                    yield this.linkAccount();
                }
            });
        }
        /**
         * Refreshes the access token using the refresh token
         */
        refreshAccessToken() {
            return __awaiter(this, void 0, void 0, function* () {
                const refreshForm = new Map([
                    ["grant_type", "refresh_token"],
                    ["refresh_token", this.refreshToken],
                ]);
                const refreshResp = yield this.sendRequest("https://identity.api.navigraph.com/connect/token", "post", refreshForm);
                if (refreshResp.ok) {
                    this.refreshToken = refreshResp.json().refresh_token;
                    this.accessToken = refreshResp.json().access_token;
                }
                return;
            });
        }
        /**
         * Gets a list of charts for the given ICAO
         * @param icao The ICAO of the airport to get the charts from
         */
        getChartsList(icao) {
            return __awaiter(this, void 0, void 0, function* () {
                this.invalidateChartCache();
                let chartsObj;
                if (icao === "" || icao === "----") {
                    return chartsObj;
                }
                if (!this._chartListCache.has(icao)) {
                    yield this.validateToken();
                    const signedUrlResp = yield this.sendRequest(`https://charts.api.navigraph.com/2/airports/${icao}/signedurls/charts.json`, "get", null, true);
                    if (signedUrlResp.ok) {
                        const signedUrl = signedUrlResp.data;
                        const chartsListResp = yield this.sendRequest(signedUrl, "get");
                        if (chartsListResp.ok) {
                            chartsObj = chartsListResp.json();
                            this._chartListCache.set(icao, chartsObj);
                        }
                    }
                    return chartsObj;
                }
                else {
                    return this._chartListCache.get(icao);
                }
            });
        }
        invalidateChartCache() {
            if (this._chartCacheTimestamp === 0 || ((Date.now() - this._chartCacheTimestamp) > 300000)) {
                this._chartCacheTimestamp = Date.now();
                this._chartListCache.clear();
            }
        }
        /**
         * Executes the navigraph account linking process
         */
        linkAccount() {
            return __awaiter(this, void 0, void 0, function* () {
                this.refreshToken = "";
                this.accessToken = "";
                const pkce = OAuthPkce.getChallenge(32);
                const authForm = new Map([
                    ["code_challenge", pkce.code_challenge],
                    ["code_challenge_method", "S256"]
                ]);
                // send auth request
                const authResp = yield this.sendRequest("https://identity.api.navigraph.com/connect/deviceauthorization", "post", authForm);
                if (authResp.ok) {
                    // send user to page
                    OpenBrowser(authResp.json().verification_uri_complete);
                    // poll for token
                    const pollForm = new Map([
                        ["grant_type", "urn:ietf:params:oauth:grant-type:device_code"],
                        ["device_code", authResp.json().device_code],
                        ["scope", "openid charts offline_access"],
                        ["code_verifier", pkce.code_verifier]
                    ]);
                    while (!this.isAccountLinked) {
                        yield this.delay(4000);
                        const pollResp = yield this.sendRequest("https://identity.api.navigraph.com/connect/token", "post", pollForm);
                        if (pollResp.ok) {
                            this.refreshToken = pollResp.json().refresh_token;
                            this.accessToken = pollResp.json().access_token;
                        }
                    }
                    return true;
                }
                else {
                    throw ("Auth failed");
                }
            });
        }
        /** Gets the signed png url of the requested chart */
        getChartPngUrl(chart, dayChart = true) {
            return __awaiter(this, void 0, void 0, function* () {
                if (chart !== undefined) {
                    yield this.validateToken();
                    const url = `https://charts.api.navigraph.com/2/airports/${chart.icao_airport_identifier}/signedurls/${dayChart ? chart.file_day : chart.file_night}`;
                    const urlResp = yield this.sendRequest(url, "get", null, true);
                    return urlResp.data;
                }
                return "";
            });
        }
        /**
         * Used to encapsulate requests to navigraph
         * @param path The url the request points to
         * @param method "GET" or "POST"
         * @param form A map of data to send in the request body
         * @param auth A boolean indicating if the auth token should be used for this request
         */
        sendRequest(path, method, form = null, auth = false) {
            return __awaiter(this, void 0, void 0, function* () {
                const formData = new Map();
                formData.set(LZUTF8.decompress(this.placeholdertext1, { inputEncoding: "StorageBinaryString" }), LZUTF8.decompress(this.placeholdertext2, { inputEncoding: "StorageBinaryString" }));
                formData.set(LZUTF8.decompress(this.placeholdertext3, { inputEncoding: "StorageBinaryString" }), LZUTF8.decompress(this.placeholdertext4, { inputEncoding: "StorageBinaryString" }));
                if (form !== null) {
                    form.forEach((v, k) => {
                        formData.set(k, v);
                    });
                }
                const options = {
                    ignoreCache: false,
                    headers: {
                        Accept: 'application/json, text/javascript, text/plain',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    // default max duration for a request
                    timeout: 10000,
                };
                if (auth) {
                    options.headers["Authorization"] = "Bearer " + this.accessToken;
                }
                const response = yield request(method, path, null, formData, options);
                return response;
            });
        }
        /**
         * Artificial delay
         * @param ms Time to delay
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // TODO: split the actual viewer stuff from this class into a more generic viewer component for later reuse
    class CJ4_MFD_ChartView extends HTMLElement {
        constructor() {
            super(...arguments);
            this._renderCd = 50;
            this._renderTmr = 50;
            this._srcImage = new Image;
            this._planeImage = new Image;
            this._chart = undefined;
            this._zoom = 1;
            this._yOffset = 0;
            this._xOffset = 0;
            this._isDirty = true;
            this.STEP_RATE = 40;
            /** A struct containing different dimension values of the view and chart */
            this._dimensions = {
                chartid: "",
                bboxBorder: 54,
                bboxW: 0,
                bboxH: 0,
                imgRatio: 0,
                chartW: 0,
                chartH: 0,
                scaleW: 0,
                scaleH: 0,
                planW: 0,
                planH: 0,
                pxPerLong: 0,
                pxPerLat: 0,
                boxW: 0,
                boxH: 0,
                boxPosX: 0,
                boxPosY: 0,
            };
        }
        /** Gets a boolean indicating if the view is visible */
        get isVisible() {
            return this.style.visibility === "visible";
        }
        /** Gets a boolean indicating if the chart is in portrait format */
        get isPortrait() {
            return this._srcImage.height > this._srcImage.width;
        }
        /** Sets the x offset of the chart view */
        set xOffset(value) {
            this._xOffset = Math.min(0, Math.max(-(this._dimensions.chartW * this._zoom - this._canvas.width), value));
        }
        /** Gets the x offset of the chart view */
        get xOffset() {
            return this._xOffset;
        }
        /** Sets the y offset of the chart view */
        set yOffset(value) {
            this._yOffset = Math.min(0, Math.max(-(this._dimensions.chartH * this._zoom - this._canvas.height) - 20, value));
        }
        /** Gets the y offset of the chart view */
        get yOffset() {
            return this._yOffset;
        }
        connectedCallback() {
            this._ngApi = new NavigraphApi();
            this._chartindexnumber = this.querySelector("#chartinfo_indexnumber");
            this._chartprocidentifier = this.querySelector("#chartinfo_procidentifier");
            this._chartinfonogeoref = this.querySelector("#chartinfo_nogeoref");
            this._canvas = this.querySelector("#chartcanvas");
            this._srcImage.src = "#";
            this._srcImage.onload = this.onSrcImageLoaded.bind(this);
            this._planeImage.src = "coui://html_UI/Pages/VCockpit/Instruments/Airliners/CJ4/WTLibs/Images/icon_plane.png?cb=323334";
        }
        /** Event thrown when chart image is loaded */
        onSrcImageLoaded() {
            this._xOffset = 0;
            this._yOffset = 0;
            this._zoom = 1;
            this.scaleImgToFit();
            this._isChartLoading = false;
            this._isDirty = true;
        }
        /**
         * Loads a chart into the view
         * @param url The url for the chart to load
         * @param chart The chart object
         */
        loadChart(chart = undefined) {
            return __awaiter(this, void 0, void 0, function* () {
                if (chart !== undefined) {
                    this._chart = chart;
                    // get and load png
                    this._isChartLoading = true;
                    this._showDayChart = SimVar.GetSimVarValue("LIGHT POTENTIOMETER:3", "number") === 1;
                    this._srcImage.src = yield this._ngApi.getChartPngUrl(this._chart, this._showDayChart);
                    this._chartindexnumber.textContent = `${chart.icao_airport_identifier} ${chart.index_number}`;
                    this._chartprocidentifier.textContent = chart.procedure_identifier;
                    this._chartinfonogeoref.style.display = (this._chart.georef) ? "none" : "";
                }
            });
        }
        update(dTime) {
            if (this.isVisible && !this._isChartLoading) {
                this._renderTmr -= dTime;
                if (this._renderTmr > 0 && this._isDirty === false) {
                    return;
                }
                this._renderTmr = this._renderCd;
                this._isDirty = false;
                // check for day/night change
                const isDay = SimVar.GetSimVarValue("LIGHT POTENTIOMETER:3", "number") === 1;
                if (isDay !== this._showDayChart) {
                    this.loadChart(this._chart);
                }
                const ctx = this._canvas.getContext("2d");
                ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
                ctx.setTransform(this._zoom, 0, 0, this._zoom, this._xOffset, this._yOffset);
                if (this._srcImage.src !== "" && this._srcImage.src.indexOf("#") === -1) {
                    this.drawImage(ctx);
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    // if (this._zoom === 1) {
                    //   this.drawRect(ctx);
                    // }
                }
                else {
                    ctx.fillStyle = "#cccac8";
                    ctx.textAlign = "center";
                    ctx.font = "26px Collins ProLine";
                    ctx.fillText("NO CHART AVAILABLE", this._canvas.width / 2, this._canvas.height / 2);
                }
            }
        }
        /** Draws the green box for panning and zooming */
        drawRect(ctx) {
            ctx.strokeStyle = "green";
            ctx.lineWidth = 4;
            const scrollGapX = this._dimensions.chartW - this._canvas.width;
            const scrollGapY = this._dimensions.chartH - this._canvas.height;
            const scrollPercX = scrollGapX === 0 ? 0 : Math.min(1, Math.abs(((scrollGapX - (scrollGapX - this._xOffset)) / scrollGapX)));
            const scrollPercY = scrollGapY === 0 ? 0 : Math.min(1, Math.abs(((scrollGapY - (scrollGapY - this._yOffset)) / scrollGapY)));
            this._dimensions.boxW = this._canvas.width * 0.6;
            this._dimensions.boxH = this._canvas.height * 0.6;
            const rectScrollGapX = this._canvas.width - this._dimensions.boxW - 4;
            const rectScrollGapY = this._canvas.height - this._dimensions.boxH - 24;
            this._dimensions.boxPosX = rectScrollGapX * (scrollPercX) + 2;
            this._dimensions.boxPosY = rectScrollGapY * (scrollPercY) + 2;
            ctx.strokeRect(this._dimensions.boxPosX, this._dimensions.boxPosY, this._dimensions.boxW, this._dimensions.boxH);
        }
        /** Fits the chart to the canvas size and sets dimension values */
        scaleImgToFit() {
            if (this._srcImage.width > 0) {
                // get bbox measures
                this._dimensions.bboxW = this._srcImage.width - (this._dimensions.bboxBorder * 2);
                this._dimensions.bboxH = this._srcImage.height - (this._dimensions.bboxBorder * 2);
                // img fitting
                const ratio = this._srcImage.width / this._srcImage.height;
                this._dimensions.chartW = this._canvas.width;
                this._dimensions.chartH = this._dimensions.chartW / ratio;
                if (!this.isPortrait) {
                    this._dimensions.chartH = this._canvas.height * 1.2;
                    this._dimensions.chartW = this._dimensions.chartW * ratio * 1.2;
                }
                this._dimensions.scaleW = this._dimensions.chartW / (this._srcImage.width - (this._dimensions.bboxBorder * 2));
                this._dimensions.scaleH = this._dimensions.chartH / (this._srcImage.height - (this._dimensions.bboxBorder * 2));
                // georef measures
                if (this._chart.georef === true) {
                    this._dimensions.planW = this._chart.planview.bbox_local[2] - this._chart.planview.bbox_local[0];
                    this._dimensions.planH = this._chart.planview.bbox_local[1] - this._chart.planview.bbox_local[3];
                    this._dimensions.pxPerLong = this._dimensions.planW / (this._chart.planview.bbox_geo[2] - this._chart.planview.bbox_geo[0]);
                    this._dimensions.pxPerLat = this._dimensions.planH / (this._chart.planview.bbox_geo[3] - this._chart.planview.bbox_geo[1]);
                }
            }
        }
        /** Draws the chart */
        drawImage(ctx) {
            ctx.drawImage(this._srcImage, this._dimensions.bboxBorder, this._dimensions.bboxBorder, this._dimensions.bboxW, this._dimensions.bboxH, 0, 0, this._dimensions.chartW, this._dimensions.chartH);
            if (this._chart.georef === true) {
                // planepos
                const lat = SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude");
                const long = SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude");
                if (this.isInsideGeoCoords(lat, long, this._chart.planview.bbox_geo)) {
                    let planeX = (long - this._chart.planview.bbox_geo[0]) * this._dimensions.pxPerLong;
                    let planeY = Math.abs(lat - this._chart.planview.bbox_geo[3]) * this._dimensions.pxPerLat;
                    // no idea why we need to offset more
                    planeX += (this._chart.planview.bbox_local[0]) - this._dimensions.bboxBorder;
                    planeY += (this._chart.planview.bbox_local[3]) - this._dimensions.bboxBorder;
                    // check if plane is under an inset
                    for (let i = 0; i < this._chart.insets.length; i++) {
                        const inset = this._chart.insets[i].bbox_local;
                        if (this.isInsidePxCoords(planeX, planeY, inset)) {
                            return;
                        }
                    }
                    const transX = Math.abs(planeX) * this._dimensions.scaleW;
                    const transY = Math.abs(planeY) * this._dimensions.scaleH;
                    const simTrack = (SimVar.GetSimVarValue("SIM ON GROUND", "bool")) ? SimVar.GetSimVarValue("PLANE HEADING DEGREES TRUE", "degree") : SimVar.GetSimVarValue("GPS GROUND TRUE TRACK", "degree");
                    const rot = Math.round(simTrack) * (Math.PI / 180);
                    ctx.translate(transX, transY);
                    ctx.rotate(rot);
                    const planeScale = this._zoom === 1 ? 1 : 1.5;
                    ctx.drawImage(this._planeImage, -20 / planeScale, -23.5 / planeScale, 40 / planeScale, 47 / planeScale);
                    ctx.translate(-transX, -transY);
                    ctx.rotate(-rot);
                }
            }
        }
        isInsideGeoCoords(lat, long, bb) {
            return (bb[0] <= long && long <= bb[2] && bb[1] <= lat && lat <= bb[3]);
        }
        isInsidePxCoords(x, y, bb) {
            return (bb[0] <= x && x <= bb[2] && bb[3] <= y && y <= bb[1]);
        }
        onEvent(event) {
            if (!this.isVisible) {
                return false;
            }
            this._isDirty = true;
            let handled = true;
            switch (event) {
                case "Lwr_Push_ZOOM_INC":
                case "Lwr_Push_ZOOM_DEC":
                    const chartCtrX = ((this._canvas.width / 2)) + Math.abs(this._xOffset);
                    const chartCtrY = ((this._canvas.height / 2)) + Math.abs(this._yOffset);
                    this._zoom = this._zoom === 1 ? (this.isPortrait ? 2.0 : 1.6) : 1;
                    if (this._zoom === 1) {
                        this.xOffset = -(chartCtrX / (this.isPortrait ? 2.0 : 1.6)) + (this._canvas.width / 2);
                        this.yOffset = -(chartCtrY / (this.isPortrait ? 2.0 : 1.6)) + (this._canvas.height / 2);
                    }
                    else {
                        this.xOffset = -(chartCtrX * this._zoom) + (this._canvas.width / 2);
                        this.yOffset = -(chartCtrY * this._zoom) + (this._canvas.height / 2);
                    }
                    break;
                case "Lwr_JOYSTICK_UP":
                    this.yOffset += this.STEP_RATE;
                    break;
                case "Lwr_JOYSTICK_DOWN":
                    this.yOffset -= this.STEP_RATE;
                    break;
                case "Lwr_JOYSTICK_LEFT":
                    this.xOffset += this.STEP_RATE;
                    break;
                case "Lwr_JOYSTICK_RIGHT":
                    this.xOffset -= this.STEP_RATE;
                    break;
                default:
                    this._isDirty = false;
                    handled = false;
                    break;
            }
            return handled;
        }
        show() {
            this.fitCanvasToContainer(this._canvas);
            this._isDirty = true;
            this.style.visibility = "visible";
        }
        hide() {
            this.style.visibility = "hidden";
        }
        fitCanvasToContainer(canvas) {
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }
    customElements.define("cj4-mfd-chartview", CJ4_MFD_ChartView);

    var CHART_TYPE;
    (function (CHART_TYPE) {
        CHART_TYPE[CHART_TYPE["AIRPORT"] = 0] = "AIRPORT";
        CHART_TYPE[CHART_TYPE["DEPARTURE"] = 1] = "DEPARTURE";
        CHART_TYPE[CHART_TYPE["ARRIVAL"] = 2] = "ARRIVAL";
        CHART_TYPE[CHART_TYPE["APPROACH"] = 3] = "APPROACH";
        CHART_TYPE[CHART_TYPE["AIRSPACE"] = 4] = "AIRSPACE";
        CHART_TYPE[CHART_TYPE["NOISE"] = 5] = "NOISE";
    })(CHART_TYPE || (CHART_TYPE = {}));
    class NavigraphChartFilter {
        static getAirspace(charts) {
            return this.findChartInArray(c => c.type.category === "AIRSPACE", charts);
        }
        static getAirport(charts) {
            return this.findChartInArray(c => c.type.section === "APT", charts);
        }
        static getDeparture(charts) {
            return this.findChartInArray(c => c.type.section === "DEP", charts);
        }
        static getArrival(charts) {
            return this.findChartInArray(c => c.type.section === "ARR", charts);
        }
        static getApproach(charts) {
            return this.findChartInArray(c => c.type.section === "APP", charts);
        }
        static getApproachPrecision(charts) {
            return this.findChartInArray(c => c.type.section === "APP" && c.type.precision === "Y", charts);
        }
        static getApproachNonPrecision(charts) {
            return this.findChartInArray(c => c.type.section === "APP" && c.type.precision === "N", charts);
        }
        /**
       * Finds a chart in the array using the predicate.
       * @param predicate A predicate used to find a chart
       * @param charts The array of charts to search in
       */
        static findChartInArray(predicate, charts) {
            const foundCharts = charts.charts.filter(predicate);
            return foundCharts;
        }
    }

    class ChartIndex {
        constructor() {
            this.Origin = { Airport: undefined, Departure: undefined, Arrival: undefined, Approach: undefined };
            this.Destination = { Arrival: undefined, Approach: undefined, Airport: undefined, Departure: undefined };
        }
    }
    class CJ4_MFD_ChartsIndexModel {
        constructor(ngApi) {
            this._fpChecksum = -1;
            this._api = ngApi;
            this._fpm = FlightPlanManager.DEBUG_INSTANCE;
            this._chartsIndex = new ChartIndex();
        }
        get chartsIndex() {
            return this._chartsIndex;
        }
        get origin() {
            return this._origin;
        }
        get destination() {
            return this._destination;
        }
        /**
       * Retrieves and updates the chart index
       */
        updateData(forceUpdate = false) {
            return __awaiter(this, void 0, void 0, function* () {
                // check if flight plan has changed
                let fpChanged = false;
                if (this._api.isAccountLinked && this._fpChecksum !== this._fpm.getFlightPlan(0).checksum) {
                    fpChanged = true;
                    this._fpChecksum = this._fpm.getFlightPlan(0).checksum;
                }
                // if ng account is linked and flight plan has changed
                if (this._api.isAccountLinked && (fpChanged || forceUpdate)) {
                    try {
                        this.resetChartsIndex();
                        this._origin = this._fpm.getOrigin() === undefined ? "----" : this._fpm.getOrigin().ident;
                        this._destination = this._fpm.getDestination() === undefined ? "----" : this._fpm.getDestination().ident;
                        // get charts for origin
                        if (this._origin !== "----") {
                            const origCharts = yield this._api.getChartsList(this._origin);
                            this._chartsIndex.Origin.Airport = this.findChartInArray(c => c.type.code === "AP", origCharts);
                            const departure = this._fpm.getDeparture();
                            if (departure !== undefined) {
                                this._chartsIndex.Origin.Departure = this.findChartInArray(c => (c.type.code === "GG" || c.type.code === "G") && c.procedure_code.findIndex((x) => x === `${departure.name}`) !== -1, origCharts);
                            }
                        }
                        // get charts for destination
                        if (this._destination !== "----") {
                            const destCharts = yield this._api.getChartsList(this._destination);
                            this._chartsIndex.Destination.Airport = this.findChartInArray(c => c.type.code === "AP", destCharts);
                            const arrival = this._fpm.getArrival();
                            if (arrival !== undefined) {
                                this._chartsIndex.Destination.Arrival = this.findChartInArray(c => c.type.section === "ARR" && c.procedure_code.findIndex((x) => x === `${arrival.name}`) !== -1, destCharts);
                            }
                            const approach = this._fpm.getApproach();
                            if (approach !== undefined) {
                                // dirty hack PRMs out
                                this._chartsIndex.Destination.Approach = this.findChartInArray(c => c.type.code === "01" && c.type.section === "APP" && c.procedure_code.findIndex((x) => x === `${this.formatApproachName(approach.name)}`) !== -1 && c.procedure_identifier.indexOf("PRM") === -1 && c.procedure_identifier.indexOf("SA") === -1, destCharts);
                                if (this._chartsIndex.Destination.Approach === undefined) {
                                    this._chartsIndex.Destination.Approach = this.findChartInArray(c => c.type.section === "APP" && c.procedure_code.findIndex((x) => x === `${this.formatApproachName(approach.name)}`) !== -1, destCharts);
                                }
                            }
                        }
                        return true;
                    }
                    catch (err) {
                        console.error("Something went wrong with charts");
                    }
                }
                return false;
            });
        }
        /** Gets a chart object by index */
        getChartAtIndex(index) {
            return this.getFlatChartIndex()[index];
        }
        setChartAtIndex(chart, _selectedIndex) {
            let iterator = 0;
            Object.values(this._chartsIndex).forEach(lvl => {
                Object.keys(lvl).forEach(k => {
                    if (iterator === _selectedIndex) {
                        lvl[k] = chart;
                    }
                    iterator++;
                });
            });
        }
        /** Flattens the chart index to an array */
        getFlatChartIndex() {
            const returnArr = [];
            Object.values(this._chartsIndex).forEach(lvl => {
                returnArr.push(...Object.values(lvl));
            });
            return returnArr;
        }
        /** Flattens the chart index keys to an array */
        getFlatChartKeys() {
            const returnArr = [];
            Object.values(this._chartsIndex).forEach(lvl => {
                returnArr.push(...Object.keys(lvl));
            });
            return returnArr;
        }
        /**
         * Resets the charts in the index
         */
        resetChartsIndex() {
            this._chartsIndex = new ChartIndex();
        }
        /**
         * Formats the approach name to be compatible with Navigraph.
         * @param name The msfs name of the approach
         */
        formatApproachName(name) {
            const segments = name.match(/[^ ]+/g);
            const rwy = Avionics.Utils.formatRunway(segments[1]).trim();
            // need to add dash if it is center runway with XYZ :/
            if (segments.length > 2 && rwy.indexOf("L") === -1 && rwy.indexOf("R") === -1) {
                segments[2] = `-${segments[2]}`;
            }
            return `${segments[0][0]}${rwy}${(segments.length > 2) ? segments[2] : ''}`;
        }
        /**
        * Finds a chart in the array using the predicate.
        * @param predicate A predicate used to find a chart
        * @param charts The array of charts to search in
        */
        findChartInArray(predicate, charts) {
            if (charts !== undefined && charts.charts !== undefined) {
                const foundCharts = charts.charts.filter(predicate);
                if (foundCharts.length > 0) {
                    // if (foundCharts.length > 1) {
                    //   return {
                    //     // mock up a chart with basic info we need
                    //     procedure_identifier: `${foundCharts.length} FMS Charts`,
                    //     icao_airport_identifier: foundCharts[0].icao_airport_identifier,
                    //     type: { category: foundCharts[0].type.category }
                    //   } as NG_Chart;
                    // } else {
                    foundCharts[0].source = "FMS";
                    return foundCharts[0];
                    // }
                }
            }
            return undefined;
        }
    }

    class CJ4_MFD_ChartsIndex {
        constructor(_container, ngApi, _chartSelectCallback, _multiChartCallback) {
            this._container = _container;
            this._chartSelectCallback = _chartSelectCallback;
            this._multiChartCallback = _multiChartCallback;
            this._selectedIndex = 0;
            this._model = new CJ4_MFD_ChartsIndexModel(ngApi);
            this.update();
        }
        /**
         * Retrieves and updates the chart index
         */
        update(force = false) {
            return __awaiter(this, void 0, void 0, function* () {
                const isDataChanged = yield this._model.updateData();
                if (isDataChanged || force) {
                    this.render();
                }
                this.renderselect();
            });
        }
        onEvent(event) {
            let handled = true;
            switch (event) {
                case "Lwr_MENU_ADV_DEC":
                    this.menuScroll(false);
                    break;
                case "Lwr_MENU_ADV_INC":
                    this.menuScroll(true);
                    break;
                case "Lwr_DATA_PUSH":
                    this.selectChart();
                    break;
                case "Lwr_DATA_PUSH_LONG":
                    this.callChartMenu();
                    break;
                default:
                    handled = false;
                    break;
            }
            // some stupid selection logic
            this.renderselect();
            return handled;
        }
        /** Set a chart at current selected index in the list of charts */
        setChart(chart) {
            this._model.setChartAtIndex(chart, this._selectedIndex);
            this.render();
        }
        /** Requests to open the chart selection menu */
        callChartMenu() {
            const chart = this._model.getChartAtIndex(this._selectedIndex);
            if (chart !== undefined) {
                this._multiChartCallback(chart.icao_airport_identifier, CHART_TYPE[chart.type.category]);
            }
        }
        /** Sends the currently selected chart back to the callback delegates. */
        selectChart() {
            return __awaiter(this, void 0, void 0, function* () {
                const chart = this._model.getChartAtIndex(this._selectedIndex);
                if (chart !== undefined) {
                    if (chart.id !== undefined) {
                        this._chartSelectCallback(chart);
                    }
                    else {
                        // multiple charts, go to selection
                        this._multiChartCallback(chart.icao_airport_identifier, CHART_TYPE[chart.type.category]);
                    }
                }
                else {
                    // dirtiest haxx
                    const type = CHART_TYPE[this._model.getFlatChartKeys()[this._selectedIndex].toUpperCase()];
                    const icao = (this._selectedIndex > 3) ? this._model.destination : this._model.origin;
                    this._multiChartCallback(icao, type);
                }
            });
        }
        /** Scroll to previous charts in the list and select it */
        selectPrevChart() {
            if (this._selectedIndex > 0) {
                const chartsIndex = this._model.getFlatChartIndex();
                for (let i = this._selectedIndex - 1; i >= 0; i--) {
                    if (chartsIndex[i] !== undefined && chartsIndex[i].id !== undefined) {
                        this._selectedIndex = i;
                        this.selectChart();
                        return;
                    }
                }
            }
        }
        /** Scroll to next chart in the list and select it */
        selectNextChart() {
            const chartsIndex = this._model.getFlatChartIndex();
            for (let i = this._selectedIndex + 1; i < chartsIndex.length; i++) {
                if (chartsIndex[i] !== undefined && chartsIndex[i].id !== undefined) {
                    this._selectedIndex = i;
                    this.selectChart();
                    return;
                }
            }
        }
        /** Sets the style on the selected row */
        renderselect() {
            const rows = this._container.querySelectorAll("tr");
            rows.forEach(r => {
                r.className = "";
            });
            if (this._selectedIndex < rows.length) {
                rows[this._selectedIndex].className = "selected";
            }
        }
        /** Handling to scroll through the menu */
        menuScroll(isForward) {
            this._selectedIndex = isForward ? this._selectedIndex + 1 : this._selectedIndex - 1;
            const itemCount = this._model.getFlatChartIndex().length;
            if (this._selectedIndex < 0) {
                this._selectedIndex = itemCount - 1;
            }
            else if (this._selectedIndex >= itemCount) {
                this._selectedIndex = 0;
            }
        }
        /** Renders the chart index */
        render() {
            this._container.innerHTML = '';
            this.renderFmsHead();
            // render origin
            const origSection = this.renderIndexSection(`ORIGIN - ${this._model.origin}`, this._model.chartsIndex.Origin);
            // render destination
            const destSection = this.renderIndexSection(`DESTINATION - ${this._model.destination}`, this._model.chartsIndex.Destination);
            this._container.appendChild(origSection);
            this._container.appendChild(destSection);
        }
        renderFmsHead() {
            // render fms head
            const fmsheading = document.createElement("h4");
            fmsheading.innerText = "FMS1";
            fmsheading.style.textAlign = "right";
            fmsheading.style.marginTop = "1%";
            fmsheading.style.marginRight = "2%";
            fmsheading.style.color = "magenta";
            const tophr = document.createElement("hr");
            tophr.style.width = "97%";
            tophr.style.marginRight = "2%";
            tophr.style.marginLeft = "1%";
            this._container.appendChild(fmsheading);
            this._container.appendChild(tophr);
        }
        /**
         * Renders a section of the chart index
         * @param caption The caption of the index section
         * @param data An object containing the charts.
         */
        renderIndexSection(caption, data) {
            const container = document.createElement("div");
            const heading = document.createElement("h4");
            heading.innerHTML = `<mark>${caption}</mark>`;
            heading.className = "tableGap";
            heading.style.verticalAlign = "middle";
            container.appendChild(heading);
            const table = document.createElement("table");
            table.style.width = "100%";
            const tbody = table.createTBody();
            Object.entries(data).forEach((v) => {
                const row = tbody.insertRow();
                const cell1 = row.insertCell();
                cell1.style.width = "110px";
                cell1.textContent = v[0];
                const cell2 = row.insertCell();
                const chart = v[1];
                cell2.innerHTML = (chart === undefined) ? '[ ]' : `[<span class="${(chart.id === undefined) ? '' : (chart.source === "FMS") ? 'magenta' : 'cyan'}">${chart.procedure_identifier}</span>]`;
            });
            container.appendChild(table);
            const hrdivider = document.createElement("hr");
            hrdivider.style.width = "97%";
            hrdivider.style.marginLeft = "1%";
            hrdivider.style.marginRight = "2%";
            container.appendChild(hrdivider);
            return container;
        }
    }

    class CJ4_MFD_ChartsMenuModel {
        constructor(icao, type, ngApi) {
            this._api = ngApi;
            this._icao = icao;
            this._type = type;
        }
        get icao() {
            return this._icao;
        }
        get type() {
            return this._type;
        }
        get charts() {
            return this._charts;
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                const ngCharts = yield this._api.getChartsList(this._icao);
                if (ngCharts !== undefined && ngCharts.charts !== undefined) {
                    switch (this._type) {
                        case CHART_TYPE.AIRPORT:
                            this._charts = NavigraphChartFilter.getAirport(ngCharts);
                            break;
                        case CHART_TYPE.DEPARTURE:
                            this._charts = NavigraphChartFilter.getDeparture(ngCharts);
                            break;
                        case CHART_TYPE.ARRIVAL:
                            this._charts = NavigraphChartFilter.getArrival(ngCharts);
                            break;
                        case CHART_TYPE.APPROACH:
                            this._charts = NavigraphChartFilter.getApproach(ngCharts);
                            break;
                        case CHART_TYPE.AIRSPACE:
                            this._charts = NavigraphChartFilter.getAirspace(ngCharts);
                            break;
                    }
                    if (this._charts !== undefined && this._charts.length > 1) {
                        // sort
                        this._charts = this._charts.sort((a, b) => {
                            const aMatch = a.index_number.match(/(\d*)-(\d*)([A-Z])?/);
                            const bMatch = b.index_number.match(/(\d*)-(\d*)([A-Z])?/);
                            if (aMatch[1] === bMatch[1]) {
                                return parseInt(aMatch[2]) - parseInt(bMatch[2]);
                            }
                            else {
                                return parseInt(aMatch[1]) - parseInt(bMatch[1]);
                            }
                        });
                    }
                }
            });
        }
    }

    class CJ4_MFD_ChartsMenu {
        constructor(icao, type, ngApi, _container, _selectCallback) {
            this._container = _container;
            this._selectCallback = _selectCallback;
            this.PAGE_SIZE = 20;
            this._selectedIndex = 0;
            this._lastChartCount = 0;
            this._currentPage = 0;
            this._totalPages = 1;
            this._model = new CJ4_MFD_ChartsMenuModel(icao, type, ngApi);
            this._chartInitPromise = this._model.init();
        }
        update() {
            return __awaiter(this, void 0, void 0, function* () {
                // wait for charts to be loaded into model
                yield this._chartInitPromise.catch(console.log);
                // immediate callback if no charts available
                if (this._model.charts === undefined || this._model.charts.length === 0) {
                    this.selectChart();
                }
                // only update if something in the list changed (unlikely)
                if (this._lastChartCount !== this._model.charts.length) {
                    this._lastChartCount = this._model.charts.length;
                    this._totalPages = Math.ceil(this._model.charts.length / this.PAGE_SIZE);
                    this.render();
                    this.renderselect();
                }
            });
        }
        onEvent(event) {
            let handled = true;
            switch (event) {
                case "Lwr_MENU_ADV_DEC":
                    this.menuScroll(false);
                    break;
                case "Lwr_MENU_ADV_INC":
                    this.menuScroll(true);
                    break;
                case "Lwr_DATA_PUSH":
                    this.selectChart();
                    break;
                default:
                    handled = false;
                    break;
            }
            // some stupid selection logic
            this.renderselect();
            return handled;
        }
        render() {
            this._container.innerHTML = '';
            // render header
            const lvl1Head = document.createElement("div");
            lvl1Head.className = "ChartHeader pale";
            lvl1Head.style.paddingLeft = "2%";
            lvl1Head.innerHTML = `--> ANY CHART - ${this._model.icao}`;
            this._container.appendChild(lvl1Head);
            const lvl2Head = document.createElement("div");
            lvl2Head.className = "ChartHeader";
            lvl2Head.style.paddingLeft = "4%";
            lvl2Head.innerHTML = `--> ${CHART_TYPE[this._model.type].toString()} <span style="float:right">${this._currentPage + 1}/${this._totalPages}</span>`;
            this._container.appendChild(lvl2Head);
            // render menu
            const chartsToRender = this._model.charts.slice(this._currentPage * this.PAGE_SIZE, (this._currentPage * this.PAGE_SIZE) + this.PAGE_SIZE);
            const table = document.createElement("table");
            table.style.width = "100%";
            const tbody = table.createTBody();
            // paging line
            if (this._currentPage > 0) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 2;
                cell.style.color = "cyan";
                cell.textContent = "<-- PREVIOUS CHARTS <--";
            }
            chartsToRender.forEach((c) => {
                const row = tbody.insertRow();
                const cell1 = row.insertCell();
                cell1.style.width = "110px";
                cell1.textContent = c.index_number;
                const cell2 = row.insertCell();
                cell2.innerHTML = c.procedure_identifier;
            });
            // paging line
            if (chartsToRender.length >= 20) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 2;
                cell.style.color = "cyan";
                cell.textContent = "--> MORE CHARTS -->";
            }
            this._container.appendChild(table);
        }
        /** Selects a charts and calls back to the view */
        selectChart() {
            // callback empty when no charts available
            if (this._model.charts === undefined || this._model.charts.length === 0) {
                this._selectCallback(undefined);
                return;
            }
            // check if we selected a paging line
            if (this._selectedIndex > this.PAGE_SIZE - 1 || (this._currentPage > 0 && this._selectedIndex === 0)) {
                if (this._selectedIndex === 0) {
                    this._currentPage--;
                }
                else {
                    this._currentPage++;
                }
                this._selectedIndex = 0;
                this.render();
            }
            else {
                // decrease index if not on page 1 to accomodate for "prev charts" line
                const idx = (this._currentPage === 0) ? this._selectedIndex : this._selectedIndex - 1;
                this._selectCallback(this._model.charts[idx + (this._currentPage * this.PAGE_SIZE)]);
            }
        }
        menuScroll(isForward) {
            this._selectedIndex = isForward ? this._selectedIndex + 1 : this._selectedIndex - 1;
            const itemCount = this._container.querySelectorAll("tr").length;
            if (this._selectedIndex < 0) {
                this._selectedIndex = itemCount - 1;
            }
            else if (this._selectedIndex >= itemCount) {
                this._selectedIndex = 0;
            }
        }
        /** Sets the style on the selected row */
        renderselect() {
            const rows = this._container.querySelectorAll("tr");
            rows.forEach(r => {
                r.className = "";
            });
            if (this._selectedIndex < rows.length) {
                rows[this._selectedIndex].className = "selected";
            }
        }
    }

    /** Class for managing the view portion of showing the charts pages on the MFD */
    class CJ4_MFD_ChartsPopup extends HTMLElement {
        constructor() {
            super(...arguments);
            this._mode = CHARTS_MENU_MODE.INDEX;
            this._views = new Map();
        }
        /**
         * Gets a boolean indicating if the view is visible
         */
        get isVisible() {
            return this.style.visibility === "visible";
        }
        connectedCallback(chartSelectCallback) {
            this._chartSelectCallback = chartSelectCallback;
            this._tableContainer = this.querySelector("#ChartsTable");
            this._overlayHeader = this.querySelector("#ChartOverlayHeader");
            this._ngApi = new NavigraphApi();
            // set index view
            this._views.set(CHARTS_MENU_MODE.INDEX, new CJ4_MFD_ChartsIndex(this._tableContainer, this._ngApi, this._chartSelectCallback, this.openChartMenuCallback.bind(this)));
        }
        /** Is getting called when the chart menu is to be opened */
        openChartMenuCallback(icao, type) {
            this._views.set(CHARTS_MENU_MODE.LIST, new CJ4_MFD_ChartsMenu(icao, type, this._ngApi, this._tableContainer, this.multiChartSelectCallback.bind(this)));
            this._mode = CHARTS_MENU_MODE.LIST;
            this._overlayHeader.classList.add("pale");
        }
        /** Is getting called when a chart was selected from the chart selection menu */
        multiChartSelectCallback(chart) {
            if (chart !== undefined) {
                // put it into index model somehow
                chart.source = "USR";
                this._views.get(CHARTS_MENU_MODE.INDEX).setChart(chart);
                this._views.get(CHARTS_MENU_MODE.INDEX).selectChart();
                this.hide();
            }
            this._mode = CHARTS_MENU_MODE.INDEX;
            // set the popup header coloring
            this._overlayHeader.classList.remove("pale");
            this._views.delete(CHARTS_MENU_MODE.LIST);
        }
        update() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this._views.get(this._mode).update();
            });
        }
        onEvent(event) {
            let handled = false;
            if (this.isVisible) {
                handled = this._views.get(this._mode).onEvent(event);
                if (!handled) {
                    switch (event) {
                        case "Lwr_Push_ESC":
                            if (this._mode === CHARTS_MENU_MODE.INDEX) {
                                this.hide();
                            }
                            else {
                                this._mode = CHARTS_MENU_MODE.INDEX;
                                this._views.delete(CHARTS_MENU_MODE.ANYCHART);
                                this._views.delete(CHARTS_MENU_MODE.LIST);
                                this._overlayHeader.classList.remove("pale");
                                this._views.get(this._mode).update(true);
                            }
                            handled = true;
                            break;
                    }
                }
            }
            return handled;
        }
        /** Scroll to previous charts in the list and select it */
        selectPrevChart() {
            this._views.get(CHARTS_MENU_MODE.INDEX).selectPrevChart();
        }
        /** Scroll to next chart in the list and select it */
        selectNextChart() {
            this._views.get(CHARTS_MENU_MODE.INDEX).selectNextChart();
        }
        /** Show the view */
        show() {
            this._views.get(CHARTS_MENU_MODE.INDEX).update(true);
            this.style.visibility = "visible";
        }
        /** Hide the view */
        hide() {
            this.style.visibility = "hidden";
        }
    }
    var CHARTS_MENU_MODE;
    (function (CHARTS_MENU_MODE) {
        CHARTS_MENU_MODE[CHARTS_MENU_MODE["INDEX"] = 0] = "INDEX";
        CHARTS_MENU_MODE[CHARTS_MENU_MODE["ANYCHART"] = 1] = "ANYCHART";
        CHARTS_MENU_MODE[CHARTS_MENU_MODE["LIST"] = 2] = "LIST";
    })(CHARTS_MENU_MODE || (CHARTS_MENU_MODE = {}));
    customElements.define("cj4-mfd-chartspopup", CJ4_MFD_ChartsPopup);

    class CJ4_FMC_PilotWaypointParser {
        static parseInput(value, referenceIndex, fmc) {
            return __awaiter(this, void 0, void 0, function* () {
                const matchFullLatLong = value.match(CJ4_FMC_PilotWaypointParser.fullLatLong);
                const matchShorhandLatLongEnd = value.match(CJ4_FMC_PilotWaypointParser.shorhandLatLongEnd);
                const matchShorthandLatLongMid = value.match(CJ4_FMC_PilotWaypointParser.shorthandLatLongMid);
                const matchPlaceBearingDistance = value.match(CJ4_FMC_PilotWaypointParser.placeBearingDistance);
                const matchAlongTrackOffset = value.match(CJ4_FMC_PilotWaypointParser.alongTrackOffset);
                let newWaypoint = undefined;
                if (matchFullLatLong) {
                    newWaypoint = {
                        wpt: CJ4_FMC_PilotWaypointParser.parseFullLatLong(matchFullLatLong, fmc),
                        offset: 0
                    };
                }
                else if (matchShorhandLatLongEnd) {
                    newWaypoint = {
                        wpt: CJ4_FMC_PilotWaypointParser.parseShorthandLatLongEnd(matchShorhandLatLongEnd, fmc),
                        offset: 0
                    };
                }
                else if (matchShorthandLatLongMid) {
                    newWaypoint = {
                        wpt: CJ4_FMC_PilotWaypointParser.parseShorthandLatLongMid(matchShorthandLatLongMid, fmc),
                        offset: 0
                    };
                }
                else if (matchPlaceBearingDistance) {
                    const placeBearingWaypoint = yield CJ4_FMC_PilotWaypointParser.parsePlaceBearingDistance(matchPlaceBearingDistance, fmc);
                    if (placeBearingWaypoint) {
                        newWaypoint = {
                            wpt: placeBearingWaypoint,
                            offset: 0
                        };
                    }
                }
                else if (matchAlongTrackOffset) {
                    // 1 = Reference Ident
                    // 2 = Distance from Reference
                    // 3 = Ident
                    referenceIndex = fmc.flightPlanManager.getAllWaypoints().findIndex(x => x.ident === matchAlongTrackOffset[1]);
                    if (referenceIndex > -1) {
                        const ident = CJ4_FMC_PilotWaypointParser.procMatch(matchAlongTrackOffset[3], CJ4_FMC_PilotWaypointParser.getIndexedName(fmc.flightPlanManager.getWaypoint(referenceIndex).ident, fmc));
                        const distance = parseFloat(matchAlongTrackOffset[2]);
                        newWaypoint = {
                            wpt: WaypointBuilder.fromPlaceAlongFlightPlan(ident, referenceIndex, distance, fmc, fmc.flightPlanManager),
                            offset: distance
                        };
                    }
                }
                return newWaypoint;
            });
        }
        static parseInputLatLong(value, fmc) {
            const matchFullLatLong = value.match(CJ4_FMC_PilotWaypointParser.fullLatLong);
            const matchShorhandLatLongEnd = value.match(CJ4_FMC_PilotWaypointParser.shorhandLatLongEnd);
            const matchShorthandLatLongMid = value.match(CJ4_FMC_PilotWaypointParser.shorthandLatLongMid);
            let newWaypoint = undefined;
            if (matchFullLatLong) {
                newWaypoint = {
                    wpt: CJ4_FMC_PilotWaypointParser.parseFullLatLong(matchFullLatLong, fmc),
                    offset: false
                };
            }
            else if (matchShorhandLatLongEnd) {
                newWaypoint = {
                    wpt: CJ4_FMC_PilotWaypointParser.parseShorthandLatLongEnd(matchShorhandLatLongEnd, fmc),
                    offset: false
                };
            }
            else if (matchShorthandLatLongMid) {
                newWaypoint = {
                    wpt: CJ4_FMC_PilotWaypointParser.parseShorthandLatLongMid(matchShorthandLatLongMid, fmc),
                    offset: false
                };
            }
            return newWaypoint;
        }
        static parseInputPlaceBearingDistance(value, fmc) {
            return __awaiter(this, void 0, void 0, function* () {
                const matchPlaceBearingDistance = value.match(CJ4_FMC_PilotWaypointParser.placeBearingDistance);
                let newWaypoint = undefined;
                if (matchPlaceBearingDistance) {
                    const placeBearingWaypoint = yield CJ4_FMC_PilotWaypointParser.parsePlaceBearingDistance(matchPlaceBearingDistance, fmc);
                    if (placeBearingWaypoint) {
                        newWaypoint = {
                            wpt: placeBearingWaypoint,
                            offset: false
                        };
                    }
                }
                return newWaypoint;
            });
        }
        static buildPilotWaypointFromExisting(ident, latitude, longitude, fmc) {
            const coordinates = new LatLongAlt(latitude, longitude, 0);
            const newWaypoint = WaypointBuilder.fromCoordinates(ident, coordinates, fmc);
            return newWaypoint;
        }
        static parseFullLatLong(matchFullLatLong, fmc) {
            console.log("match full lat long");
            // 1 = N/S
            // 2 = LAT DEG
            // 3 = LAT MINS
            // 4 = E/W
            // 5 = LONG DEG
            // 6 = LONG MINS
            // 7 = IDENT
            if (matchFullLatLong[3].trim() === "") {
                matchFullLatLong[3] = "0";
            }
            if (matchFullLatLong[6].trim() === "") {
                matchFullLatLong[6] = "0";
            }
            const latitude = matchFullLatLong[1] == "S" ? 0 - parseInt(matchFullLatLong[2]) - (parseFloat(matchFullLatLong[3]) / 60)
                : parseInt(matchFullLatLong[2]) + (parseFloat(matchFullLatLong[3]) / 60);
            const longitude = matchFullLatLong[4] == "W" ? 0 - parseInt(matchFullLatLong[5]) - (parseFloat(matchFullLatLong[6]) / 60)
                : parseInt(matchFullLatLong[5]) + (parseFloat(matchFullLatLong[6]) / 60);
            const coordinates = new LatLongAlt(latitude, longitude, 0);
            const ident = CJ4_FMC_PilotWaypointParser.procMatch(matchFullLatLong[7], matchFullLatLong[1] + matchFullLatLong[2].slice(0, 2) + matchFullLatLong[4] + matchFullLatLong[5] + matchFullLatLong[6].slice(0, 2));
            return WaypointBuilder.fromCoordinates(ident, coordinates, fmc);
        }
        static parseShorthandLatLongEnd(matchShorthandLatLongEnd, fmc) {
            // 1 = LAT DEG
            // 2 = LONG DEG
            // 3 = N/E/S/W (N = N:W; E = N:E; S = S:E; W = S:W)
            const direction = matchShorthandLatLongEnd[3];
            const latitude = direction == "S" || direction == "W" ? 0 - parseInt(matchShorthandLatLongEnd[1])
                : parseInt(matchShorthandLatLongEnd[1]);
            const longitude = direction == "N" || direction == "W" ? 0 - parseInt(matchShorthandLatLongEnd[2])
                : parseInt(matchShorthandLatLongEnd[2]);
            const coordinates = new LatLongAlt(latitude, longitude, 0);
            const ident = matchShorthandLatLongEnd[1] + matchShorthandLatLongEnd[2] + direction;
            return WaypointBuilder.fromCoordinates(ident, coordinates, fmc);
        }
        static parseShorthandLatLongMid(matchShorthandLatLongMid, fmc) {
            // 1 = LAT DEG
            // 2 = N/E/S/W (N = N:W; E = N:E; S = S:E; W = S:W)
            // 3 = LONG DEG
            const direction = matchShorthandLatLongMid[2];
            const latitude = direction == "S" || direction == "W" ? 0 - parseInt(matchShorthandLatLongMid[1])
                : parseInt(matchShorthandLatLongMid[1]);
            const longitude = direction == "N" || direction == "W" ? 0 - 100 - parseInt(matchShorthandLatLongMid[3])
                : 100 + parseInt(matchShorthandLatLongMid[3]);
            const coordinates = new LatLongAlt(latitude, longitude, 0);
            const ident = matchShorthandLatLongMid[1] + direction + matchShorthandLatLongMid[3];
            return WaypointBuilder.fromCoordinates(ident, coordinates, fmc);
        }
        static parsePlaceBearingDistance(matchPlaceBearingDistance, fmc) {
            return __awaiter(this, void 0, void 0, function* () {
                // 1 = Reference Ident
                // 2 = Bearing from Reference
                // 3 = Distance from Reference
                // 4 = Ident
                let referenceWaypoint = fmc.flightPlanManager.getAllWaypoints().find(x => x.ident === matchPlaceBearingDistance[1]);
                if (referenceWaypoint === undefined) {
                    const getWpt = (refWpt) => {
                        return new Promise(resolve => {
                            fmc.getOrSelectWaypointByIdent(refWpt, (w) => resolve(w));
                        });
                    };
                    referenceWaypoint = yield getWpt(matchPlaceBearingDistance[1]);
                }
                if (referenceWaypoint !== undefined) {
                    const referenceCoordinates = referenceWaypoint.infos.coordinates;
                    const bearing = parseInt(matchPlaceBearingDistance[2]);
                    const distance = parseFloat(matchPlaceBearingDistance[3]);
                    const ident = CJ4_FMC_PilotWaypointParser.procMatch(matchPlaceBearingDistance[4], CJ4_FMC_PilotWaypointParser.getIndexedName(referenceWaypoint.ident, fmc));
                    return WaypointBuilder.fromPlaceBearingDistance(ident, referenceCoordinates, bearing, distance, fmc);
                }
                else {
                    return undefined;
                }
            });
        }
        static procMatch(item, defaultVal) {
            return (item === undefined) ? defaultVal : item;
        }
        static getIndexedName(ident, fmc) {
            const waypoints = fmc.flightPlanManager.getAllWaypoints();
            const identPrefix = ident.substr(0, 3);
            let namingIndex;
            let currentIndex = 1;
            while (namingIndex === undefined) {
                const currentName = `${identPrefix}${String(currentIndex).padStart(2, '0')}`;
                const waypointIndex = waypoints.findIndex(x => x.ident === currentName);
                if (waypointIndex === -1) {
                    return currentName;
                }
                else {
                    currentIndex++;
                }
            }
        }
    }
    CJ4_FMC_PilotWaypointParser.fullLatLong = /([NS])([0-8][0-9])((?:[0-5][0-9])?(?:\.\d{1,2})?)([EW])((?:[0][0-9][0-9])|(?:[1][0-7][0-9]))((?:[0-5][0-9])?(?:\.\d{1,2})?)(?:\/(\w{0,5}))?/;
    CJ4_FMC_PilotWaypointParser.shorhandLatLongEnd = /([0-8][0-9])([0-9][0-9]|[1][0-8][0-9])([NSEW])/;
    CJ4_FMC_PilotWaypointParser.shorthandLatLongMid = /([0-8][0-9])([NSEW])([1][0-8][0-9]|[0-9][0-9])/;
    CJ4_FMC_PilotWaypointParser.placeBearingDistance = /(\w{3,5})([0-3][0-9][0-9])\/(\d{1,3}(?:\.\d{1})?)(?:\/(\w{0,5}))?/;
    CJ4_FMC_PilotWaypointParser.alongTrackOffset = /(\w{3,5})\/(?:(-*\d{0,3}\.*\d{0,1}))?(?:\/(\w{0,5}))?/;

    (function (CJ4_MapSymbol) {
        CJ4_MapSymbol[CJ4_MapSymbol["TRAFFIC"] = 0] = "TRAFFIC";
        CJ4_MapSymbol[CJ4_MapSymbol["CONSTRAINTS"] = 1] = "CONSTRAINTS";
        CJ4_MapSymbol[CJ4_MapSymbol["AIRSPACES"] = 2] = "AIRSPACES";
        CJ4_MapSymbol[CJ4_MapSymbol["AIRWAYS"] = 3] = "AIRWAYS";
        CJ4_MapSymbol[CJ4_MapSymbol["AIRPORTS"] = 4] = "AIRPORTS";
        CJ4_MapSymbol[CJ4_MapSymbol["INTERSECTS"] = 5] = "INTERSECTS";
        CJ4_MapSymbol[CJ4_MapSymbol["NAVAIDS"] = 6] = "NAVAIDS";
        CJ4_MapSymbol[CJ4_MapSymbol["NDBS"] = 7] = "NDBS";
        CJ4_MapSymbol[CJ4_MapSymbol["TERMWPTS"] = 8] = "TERMWPTS";
        CJ4_MapSymbol[CJ4_MapSymbol["MISSEDAPPR"] = 9] = "MISSEDAPPR";
    })(exports.CJ4_MapSymbol || (exports.CJ4_MapSymbol = {}));
    class CJ4_MapSymbols {
        static toggleSymbol(_symbol) {
            return new Promise(function (resolve) {
                let symbols = SimVar.GetSimVarValue("L:CJ4_MAP_SYMBOLS", "number");
                if (symbols == -1) {
                    resolve();
                } // if it fails, it fails
                symbols ^= (1 << _symbol);
                SimVar.SetSimVarValue("L:CJ4_MAP_SYMBOLS", "number", symbols).then(() => {
                    resolve();
                });
            });
        }
        static hasSymbol(_symbol) {
            const symbols = SimVar.GetSimVarValue("L:CJ4_MAP_SYMBOLS", "number");
            if (symbols == -1) {
                return 0;
            }
            if (symbols & (1 << _symbol)) {
                return 1;
            }
            return 0;
        }
    }

    // simvar cache experiment
    const svCache = new Map();
    let svCacheTs = Date.now();
    class SimVarObject {
        setValue(value, timestamp) {
            this._value = value;
            this._timestamp = timestamp;
        }
        getValue(timestamp) {
            if (this._timestamp === timestamp) {
                return this._value;
            }
            return undefined;
        }
    }
    const oldGetSimVar = SimVar.GetSimVarValue;
    SimVar.GetSimVarValue = (name, unit, dataSource = "") => {
        const key = name + unit;
        let svObj = svCache.get(key);
        if (svObj === undefined) {
            svObj = new SimVarObject();
            svCache.set(key, svObj);
        }
        const svVal = svObj.getValue(svCacheTs);
        if (svVal !== undefined) {
            return svVal;
        }
        else {
            const newVal = oldGetSimVar(name, unit, dataSource);
            svObj.setValue(newVal, svCacheTs);
            return newVal;
        }
    };
    const oldSetSimvar = SimVar.SetSimVarValue;
    SimVar.SetSimVarValue = (name, unit, value, dataSource) => {
        if (!name.startsWith("K:") && !name.startsWith("A:") && !name.startsWith("C:")) {
            const key = name + unit;
            let svObj = svCache.get(key);
            if (svObj === undefined) {
                svObj = new SimVarObject();
                svCache.set(key, new SimVarObject());
            }
            svObj.setValue(value, svCacheTs);
        }
        return oldSetSimvar(name, unit, value, dataSource);
    };
    const clearSv = () => {
        // svCache.clear();
        svCacheTs = Date.now();
        requestAnimationFrame(clearSv);
    };
    clearSv();

    exports.CJ4NavRadioState = CJ4NavRadioState;
    exports.CJ4_FGSDisplaySlot = CJ4_FGSDisplaySlot;
    exports.CJ4_FMC_MessageReceiver = CJ4_FMC_MessageReceiver;
    exports.CJ4_FMC_MsgPage = CJ4_FMC_MsgPage;
    exports.CJ4_FMC_NavControlPage = CJ4_FMC_NavControlPage;
    exports.CJ4_FMC_NavigationService = CJ4_FMC_NavigationService;
    exports.CJ4_FMC_PilotWaypointParser = CJ4_FMC_PilotWaypointParser;
    exports.CJ4_MFD_ChartView = CJ4_MFD_ChartView;
    exports.CJ4_MFD_ChartsPopup = CJ4_MFD_ChartsPopup;
    exports.CJ4_MapSymbols = CJ4_MapSymbols;
    exports.CJ4_MessageDefinitions = CJ4_MessageDefinitions;
    exports.CJ4_NavRadioSystem = CJ4_NavRadioSystem;
    exports.CJ4_PFD_Message = CJ4_PFD_Message;
    exports.CJ4_PFD_MessageReceiver = CJ4_PFD_MessageReceiver;
    exports.CJ4_PFD_MsgInfo = CJ4_PFD_MsgInfo;
    exports.CJ4_SpeedObserver = CJ4_SpeedObserver;
    exports.DirectTo = DirectTo;
    exports.FlightPlanAsoboSync = FlightPlanAsoboSync;
    exports.FlightPlanManager = FlightPlanManager;
    exports.FlightPlanSegment = FlightPlanSegment;
    exports.GPS = GPS;
    exports.GeoMath = GeoMath;
    exports.HoldDetails = HoldDetails;
    exports.ManagedFlightPlan = ManagedFlightPlan;
    exports.Message = Message;
    exports.MessageConditionChecks = MessageConditionChecks;
    exports.MessageDefinition = MessageDefinition;
    exports.MessageService = MessageService;
    exports.NavigraphApi = NavigraphApi;
    exports.ProcedureDetails = ProcedureDetails;
    exports.WaypointBuilder = WaypointBuilder;
    exports.WorldMagneticModel = WorldMagneticModel;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
