const fs = require('fs');//getAdminLogin
const parse = require('csv-parse/lib/sync')
const jwt = require('jsonwebtoken');
const request = require('request');
const path = require('path');
const { DateTime } = require('mssql');

function sendOtp(mobile, rndomOtp) {
    let msg = "ML Infomap OTP is " + rndomOtp + " and valid for only 3 minutes";
    request("https://api.textlocal.in/send/?username=akash@mlinfomap.com&hash=ML@msg123&numbers=" + mobile + "&sender=MLIN&message=" + msg, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        //console.log(body.url);
        //console.log(body.explanation);
        log.info("SIP2_GIS_SERVICE.  [" + body.url + "]");
        log.info("SIP2_GIS_SERVICE.  [" + body.explanation + "]");
    });
}
function count222(string) {
    var count = {};
    string.toString().split(',').forEach(function (s) {
        count[s] ? count[s]++ : count[s] = 1;
    });
    return count;
}

module.exports = {
    getApi: (req, res) => {
        res.json({ messages: "Welcome to gisApi." });
    },
    loginAdmin: async (req, res) => {
        let email = req.body.mobile;
        let password = req.body.password;
        const JWT_SECRET = 'jwt_secret_key';
        const JWT_VALIDITY = '7 days';
        //	let email = req.query.email;
        //	let password = req.query.password;
        try {
            let query = "SELECT [id] ,[role] ,[name] ,[username] ,[password] ,[email] ,[status] FROM [CCIL_CONCOR].[dbo].[LOGIN] where email='" + email + "' AND password ='" + password + "'";
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(400).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result.recordsets[0].length > 0) {
                        const resultw = result.recordsets[0];
                        let accessToken = jwt.sign({ data: 1 }, 'secret', { expiresIn: '1h' });
                        return res.status(200).json({ status: 'OK', accessToken, user: resultw, message: 'Your are successfully login.' });
                    }
                    else {
                        return res.status(200).json({ status: 'NOK', message: 'Username and Password Incorrect.' });
                    }

                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            console.log(e);
            return res.status(401).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }

    },
    sendOtp: async (req, res) => {
        let mobile = req.query.mobile;
        try {
            let query = "select Mobile from EMPLOYEE_MASTER where Mobile = '" + mobile + "'"
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    let rndomOtp = Math.floor(1000 + Math.random() * 9000);
                    if (result.recordsets[0].length > 0) {
                        let query1 = "exec uspInsertUpdateOTPDetails @mobile='" + mobile + "',@otp='" + rndomOtp + "'";
                        db.connect(config, function (err) {
                            if (err) console.log(err);
                            let requestDB1 = new db.Request();
                            requestDB1.query(query1, (err, result) => {
                                if (err) {
                                    log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                                    return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                                }
                                sendOtp(mobile, rndomOtp);
                                log.info("SIP2_GIS_SERVICE _2. [" + mobile + "],[" + rndomOtp + "],");
                                return res.status(200).json({ status: 'OK', message: 'Your OTP has been successfully sent on your mobile number.' });
                            });
                        });
                    }
                    else {
                        return res.status(200).json({ status: 'NOK', message: 'Your mobile number is not registered. Please contact support team' });
                    }
                });
            });
        }
        catch (e) {
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }

    },
    ConfrimOtp: async (req, res) => {
        let mobile = req.query.mobile;
        let otp = req.query.otp;
        try {
            let query = "exec uspConfirmOTP @mobile='" + mobile + "',@otp='" + otp + "'";
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result.recordsets[0].length > 0) {
                        let query2 = "INSERT INTO LOGIN_HISTORY ([Mobile],[LoginTime]) VALUES ('" + mobile + "', GETDATE())";
                        db.connect(config, function (err) {
                            if (err) console.log(err);
                            let requestDB2 = new db.Request();
                            requestDB2.query(query2, (err, resultdata) => {
                                if (err) {
                                    log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                                    return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                                }
                            });
                        });
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'Your are successfully login.' });
                    }
                    else {
                        return res.status(200).json({ status: 'NOK', message: 'Sorry Your OTP has been expired.' });
                    }

                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }

    },
    UpdateKeyUser: async (req, res) => {
        //   log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        let message = '';
        let mobile = req.query.mobile;
        let TokenID = req.query.TokenID;
        try {
            log.info("SIP2_GIS_SERVICE.[" + mobile + "][" + TokenID + "] [Live Location]");
            let query = "UPDATE EMPLOYEE_MASTER SET TokenID= '" + TokenID + "' WHERE Mobile='" + mobile + "'";
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. ['your key is added.]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'Your are successfully login.' });
                    }
                    else {
                        return res.status(200).json({ status: 'NOK', data: result.recordsets[0], message: 'Your are successfully login.' });
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your key is not added.]");
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }

    },
    Geolocation: async (req, res) => {
        // log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        let message = '';
        let mobile = req.query.mobile;
        let latitude = req.query.latitude;
        let longitude = req.query.longitude;
        let speed = req.query.speed;
        if (speed != undefined) {
            speed = 0;
        }

        try {
            log.info("SIP2_GIS_SERVICE.[" + mobile + "] [" + latitude + "] [" + longitude + "], [Live Location]");
            let query = "exec usp_InsertGeolocation @latitude='" + latitude + "', @longitude='" + longitude + "',@mobile='" + mobile + "',@speed='" + speed + "'";
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE.[" + mobile + "] [" + latitude + "] [" + longitude + "], [Live Location]");
                        return res.status(200).json({ status: 'OK', message: 'Location has been added' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }


    },
    GeoEmployee: async (req, res) => {
        //log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        let message = '';
        // let mobile = req.query.mobile;
        // let latitude = req.query.latitude;
        // let longitude = req.query.longitude;
        try {
            //log.info("SIP2_GIS_SERVICE.[" + mobile + "] [" + latitude + "] [" + longitude + "], [Live Location]");
            let query = `SELECT [Id]
            ,[Employee_Code]
            ,[Timings]
            ,[Employee_Name]
            ,[Area]
            ,[Work_Location]
            ,[Grade_Code]
            ,[Department]
            ,[Designation]
            ,[Mobile]
            ,[Email_ID]
            ,[Otp]
            ,FORMAT([expired],'MM/dd/yyyy hh:mm:s tt') as [expired]
            ,FORMAT([created],'MM/dd/yyyy hh:mm:s tt') as [created]
        FROM [CCIL_CONCOR].[dbo].[EMPLOYEE_MASTER]
        where Work_Location in ('AREA I - DELHI','AREA II - DELHI','AREA III - DELHI','AREA IV - DELHI','CORPORATE OFFICE','DADRI','TUGHLAKABAD')`
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    GeoOfficeRreport: async (req, res) => {
        //log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        // let mobile = req.query.mobile;
        // let latitude = req.query.latitude;
        // let longitude = req.query.longitude;
        try {
            //log.info("SIP2_GIS_SERVICE.[" + mobile + "] [" + latitude + "] [" + longitude + "], [Live Location]");
            let query = `SELECT  ROW_NUMBER() Over (Order By Employee_Name,Employee_Code) as id,*
            FROM usp_GetAllUserListRegionWise('` + region + `','` + emp_Code + `')
            WHERE GeofenceUser > 0 ORDER BY Employee_Name`;
            
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },

    EmplLoginReport: async (req, res) => {
        // log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        let message = '';
        // let mobile = req.query.mobile;
        // let latitude = req.query.latitude;
        // let longitude = req.query.longitude;
        try {
            //log.info("SIP2_GIS_SERVICE.[" + mobile + "] [" + latitude + "] [" + longitude + "], [Live Location]");

            let query = `SELECT Mobile,LoginTime as Office_Check_IN,ISNULL(FORMAT(LOGOUTTIME,'dd-MM-yyyy hh:mm:ss') ,'ForceClosed')[Office_Check_Out]
            ,ViolationCount as No_OF_Violation,ViolationDuration
            FROM (
            SELECT TOP (1000) A.[Mobile]
                  ,FORMAT([LoginTime],'dd-MM-yyyy hh:mm:ss')[LoginTime]
                  , [LogoutTime],SUM(ISNULL(B.ID,0)) ViolationCount, ISNULL(SUM(DATEDIFF(SECOND,STARTTIME,ENDTIME)),0)ViolationDuration
              FROM [CCIL_CONCOR].[dbo].[LOGIN_HISTORY] A left JOIN
              GeofenceViolationReport B ON A.Mobile=B.Mobile AND A.LoginTime<=StartTime AND LogoutTime >=EndTime
              GROUP BY  A.[Mobile]
                  ,[LoginTime]
                  ,[LogoutTime]
                  )T`;
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    EmpliveGeofence: async (req, res) => {
        //log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        let message = '';
        try {
            let query = `SELECT * FROM
            (
                SELECT B.Employee_Name,B.Designation,B.Work_Location, A.[Mobile]
                , A.ID,A.latitude,A.longitude,FORMAT(A.CREATEDATE,'MM/dd/yyyy hh:mm:s tt') as CREATEDATE,
                ROW_NUMBER() OVER (
                PARTITION BY A.MOBILE
                ORDER BY A.CREATEDATE DESC)RN
                FROM [CCIL_CONCOR].[dbo].[Geolocation] A INNER JOIN EMPLOYEE_MASTER B ON cast( A.Mobile as bigint) = B.Mobile
            )T WHERE RN=1 AND DATEDIFF(HOUR,CREATEDATE,GETDATE())<2`

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    EmpLogOut: async (req, res) => {
        // log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        let mobile = req.query.mobile;
        let message = '';
        try {
            //let query = "UPDATE Employee SET created = DATEADD(MINUTE, 15,GETDATE()) WHERE Mobile = '" + mobile + "'"
            let query = "UPDATE LOGIN_HISTORY SET LOGOUTTIME = GETDATE() WHERE ID IN ( SELECT MAX(ID)ID FROM [LOGIN_HISTORY] WHERE MOBILE='" + mobile + "' )";
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    geofenceReplayTracking: async (req, res) => {
        //log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        let startdate = req.query.startDate;
        let endDate = req.query.endDate;
        let mobile = req.query.mobile;
        let message = '';
        try {
            let query = `Select Geo.Mobile, latitude, longitude,FORMAT(createdate,'dd-MM-yyyy hh:mm:ss tt' )createdate,createdate as t1,timediff,IsDeviation 
            createdate,Emp.Employee_Name, Emp.Department,Emp.Designation, Emp.Work_Location
            from Geolocation as Geo
            join EMPLOYEE_MASTER as Emp on Geo.Mobile = Emp.Mobile
            where (cast(createdate as date) BETWEEN  CAST('`+ startdate + `' AS DATE)  and  CAST('` + endDate + `' AS DATE) ) and Geo.Mobile= ` + mobile + `
            order by t1 `


            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result.recordsets[0].length > 0) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'NOK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },

    getEmployeefromDB: async (req, res) => {
        //log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        // let startdate = req.query.startDate;
        // let endDate = req.query.endDate;
        // let mobile = req.query.mobile;
        let message = '';
        try {
            let query = `exec getEmployee`;

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getGeofenceViolationReport: async (req, res) => {
        // log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        // let startdate = req.query.startDate;
        let mobile = req.query.mobile;
        let singleList = req.query.singleList;
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        // let endDate = req.query.endDate;
        log.info("SIP2_GIS_SERVICE. [" + singleList + "],[" + startDate + "],[" + endDate + "]");
        try {
            let query = '';
            if (singleList === 'IsNotDate') {
                query = `select Mobile,ViolationCount, dbo.MinutesToDuration(timeDiff) as ViolationDuration 
                from (
                    select Mobile,COUNT(*) as ViolationCount,
                    SUM(ViolDurInMin) as timeDiff 
                    from [CCIL_CONCOR].[dbo].[VIOLATION_DETAILED_REPORT]
                    where Mobile = ${mobile} AND [Date] = CAST(GETDATE() as date) 
                    group by Mobile 
                )t`;
            }
            else if (startDate === endDate) {
                query = `select Mobile,ViolationCount, dbo.MinutesToDuration(timeDiff) as ViolationDuration 
                from 
                ( 
                    select Mobile,COUNT(*) as ViolationCount, SUM(ViolDurInMin) as timeDiff 
                    from [CCIL_CONCOR].[dbo].VIOLATION_DETAILED_REPORT 
                    where Mobile = ${mobile} AND  [Date] = CAST('" + startDate + "' as date)
                group by Mobile
                )t`;
            }
            else {
                log.info("SIP2_GIS_SERVICE. [" + startDate + "],[" + endDate + "] [Something went wrong. Please try again after sometime]");
                query = `select Mobile, COUNT(*) as ViolationCount, 
                dbo.MinutesToDuration(SUM(ViolDurInMin)) as ViolationDuration 
                from [CCIL_CONCOR].[dbo].VIOLATION_DETAILED_REPORT 
                where Mobile = '" + mobile + "' AND [Date] BETWEEN Cast('" + startDate + "' as date)
                AND CAST('" + endDate + "' AS date)
                group by Mobile`;
            }

            let query2 = '';
            log.info("SIP2_GIS_SERVICE. [" + query + "], uuuu");
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometimei1]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime1" });
                    }
                    log.info("SIP2_GIS_SERVICE. [" + result + "], ddddd");
                    if (result.recordsets[0].length > 0) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        if (singleList === 'IsNotDate') {
                            query2 = "select ROW_NUMBER() Over (Order By [Date]) as ID, [Date],CONCAT('Out of geofence ', StartDate, ' to ', EndTime, ' :: ', ViolationDuration, ' Min') as ViolationDuration from ( select ID,convert(varchar(6),StartTime, 106) as [Date], Mobile, right(CONVERT(varchar(30), StartTime, 100),7) AS StartDate, right(CONVERT(varchar(30), EndTime, 100),7) as EndTime, DATEDIFF(MINUTE,StartTime,EndTime) as ViolationDuration from [CCIL_CONCOR].[dbo].[GeofenceViolationReport] where Mobile = '" + mobile + "' AND CAST(StartTime AS date) = CAST(GETDATE() as date))t";
                        }
                        else if (startDate === endDate) {
                            query2 = "select ROW_NUMBER() Over (Order By [Date]) as ID, [Date],CONCAT('Out of geofence ', StartDate, ' to ', EndTime, ' :: ', ViolationDuration, ' Min') as ViolationDuration from ( select ID,convert(varchar(6),StartTime, 106) as [Date], Mobile, right(CONVERT(varchar(30), StartTime, 100),7) AS StartDate, right(CONVERT(varchar(30), EndTime, 100),7) as EndTime, DATEDIFF(MINUTE,StartTime,EndTime) as ViolationDuration from [CCIL_CONCOR].[dbo].[GeofenceViolationReport] where Mobile = '" + mobile + "' AND CAST(StartTime AS date) = CAST('" + startDate + "' as date))t";
                        }
                        else {
                            query2 = "select  ROW_NUMBER() Over (Order By t.Mobile) as ID, t.Mobile,t.[Date], CONCAT('Violation Count :: ',COUNT(*), ', Violation Duration ::', dbo.MinutesToDuration(sum(ViolationDuration))) as ViolationDuration from ( select ID,convert(varchar(6),StartTime, 106) as [Date], Mobile, right(CONVERT(varchar(30), StartTime, 100),7) AS StartDate, right(CONVERT(varchar(30), EndTime, 100),7) as EndTime, DATEDIFF(MINUTE,StartTime,EndTime) as ViolationDuration from [CCIL_CONCOR].[dbo].[GeofenceViolationReport] where Mobile = '" + mobile + "' AND ((Cast(StartTime as date) >= '" + startDate + "') And Cast(EndTime as date) <= '" + endDate + "') )t group by t.Mobile,t.[Date]";
                        }
                        log.info("SIP2_GIS_SERVICE. [" + query2 + "], [0000000Sme]");
                        db.connect(config, function (err) {
                            if (err) console.log(err);
                            let requestDB2 = new db.Request();
                            requestDB2.query(query2, (err, resultdata) => {
                                if (err) {
                                    log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                                    return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                                }
                                return res.status(200).json({ status: 'OK', dataCount: result.recordsets[0], data: resultdata.recordsets[0], message: 'Your are successfully login.' });
                            });
                        });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    geoNotifi: async (req, res) => {
        // log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
        let mobile = req.query.mobile;
        let getUpdateName = req.query.getUpdateName;
        try {
            let query = "";
            if (getUpdateName === 'Update') {
                query = "update [GeofenceViolationReport] set isNotifiedRead = 0 where Mobile='" + mobile + "'";
            }
            else {
                query = "select count(isNotifiedRead) as count from [CCIL_CONCOR].[dbo].[GeofenceViolationReport] where Mobile='" + mobile + "' AND isNotifiedRead = 1";
            }

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        if (getUpdateName === 'Update') {
                            return res.status(200).json({ status: 'OK', message: 'Read Notifi' });
                        } else {
                            return res.status(200).json({ status: 'OK', data: result.recordsets[0][0].count, message: 'List Show' });
                        }
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'NOK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    devationReportApi: (req, res) => {
        log.info("SIP2_GIS_SERVICE. Starrting devationReportApi");
        let message = '';
        let mobile = req.query.mobile;
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        let officeName = req.query.officeName;
        let region = req.query.region;
        let emp_Code = req.query.empid;

        if (mobile == '') mobile = '1'
        if (officeName == '') officeName = 'All'
        try {

            let query;
            if (startDate == 'null') {
                query = "EXEC uspDeviationReport @mobile=" + mobile + ", @StartDate=" + startDate + ",@EndDate=" + endDate + ", @Region='" + region + "', @officeName='" + officeName + "', @EmpCode='" + emp_Code + "'";

            } else
                query = "EXEC uspDeviationReport @mobile=" + mobile + ", @StartDate='" + startDate + "', @EndDate='" + endDate + "', @Region='" + region + "' ,@officeName='" + officeName + "', @EmpCode='" + emp_Code + "'";
            log.info(query);
            db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    else if (result) {
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'Api Running successful..' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            log.info("SIP2_GIS_SERVICE. ['entering catch block]" + e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }

    },
    // EmplViolationReport: async (req, res) => {

    //     // log.info("SIP2_GIS_SERVICE. Start Zone Pt Api in GIS");
    //     let message = '';
    //     let mobile = req.query.mobile;
    //     let officeName = req.query.officeName;
    //     let startDate = req.query.startDate;
    //     let endDate = req.query.endDate;

    //     try {
    //         //log.info("SIP2_GIS_SERVICE.[" + mobile + "] [" + latitude + "] [" + longitude + "], [Live Location]");
    //         let query = `SELECT 
    //         Employee_Code,Employee_Name,OfficeName 
    //         ,FORMAT([LoginTime],'dd-MM-yyyy hh:mm:ss tt')[LoginTime]
    //         ,ISNULL(FORMAT(LOGOUTTIME,'dd-MM-yyyy hh:mm:ss tt') ,'ForceClosed')[LogoutTime]
    //         FROM [CCIL_CONCOR].[dbo].[LOGIN_HISTORY] A
    //         left JOIN EMPLOYEE_MASTER E ON A.Mobile=E.Mobile 
    //         WHERE OfficeName='`+officeName+`' and LoginTime between cast('`+startDate+`' as date) and cast( '`+endDate+`' as date)
    //         and  A.Mobile='`+mobile+`'`
    //         await db.connect(config, function (err) {
    //             if (err) console.log(err);
    //             let requestDB = new db.Request();
    //             requestDB.query(query, (err, result) => {
    //                 if (err) {
    //                     log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
    //                     return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
    //                 }
    //                 if (result) {
    //                     log.info("SIP2_GIS_SERVICE. [List Show]");
    //                     return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
    //                 }
    //                 else {
    //                     log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
    //                     return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
    //                 }
    //             });
    //         });
    //     }
    //     catch (e) {
    //         console.log("entering catch block");
    //         log.info("SIP2_GIS_SERVICE. ['entering catch block]");
    //         console.log(e);
    //         return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
    //     }
    // },

    EmpCheckInCheckOutReport: (req, res) => {
        log.info("SIP2_GIS_SERVICE. Starrting devationReportApi");
        let message = '';
        let mobile = req.query.mobile;
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        let officeName = req.query.officeName;
        let region = req.query.region;
        let emp_Code = req.query.empid;

        try {
            let query;
            if (startDate == 'null') {
                query = "EXEC uspCheckInCheckOutReport @mobile=" + mobile + ", @StartDate=" + startDate + ",@EndDate=" + endDate + ", @officeName='" + officeName + "', @Region='" + region + "', @EmpCode='" + emp_Code + "'";

            } else
                query = "EXEC uspCheckInCheckOutReport @mobile=" + mobile + ", @StartDate='" + startDate + "',@EndDate='" + endDate + "', @officeName='" + officeName + "', @Region='" + region + "', @EmpCode='" + emp_Code + "'";


            db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    else if (result) {
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'Api Running successful..' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            log.info("SIP2_GIS_SERVICE. ['entering catch block]" + e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }

    },
    //IDLE- non IDLE
    getOnlineOffline: async (req, res) => {
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {
            let query = `SELECT T.idle, T.TOTAL - (T.idle + T.NotAccessible) as working  FROM
            (

				SELECT (SELECT (COUNT(DISTINCT Mobile))
                FROM [udfGetListOfIdleEmploye]('1',NULL,NULL,'All','`+ region + `','` + emp_Code + `')) as idle,
				SUM(MobileAccessible) MobileAccessible, 
				SUM(NotAccessible) NotAccessible, COUNT(DISTINCT Mobile) TOTAL
				FROM dbo.fn_GetListOfMobileAccessibleOrNot('`+ region + `','` + emp_Code + `')
            )T`
            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    //violation - nonViolation
    getOutsideInside: async (req, res) => {
        // let startdate = req.query.startDate;
        // let endDate = req.query.endDate;
        // let mobile = req.query.mobile;
        let message = '';
        //let region = req.query.region;
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {

            let query = `SELECT Outside,Inside=Inside-Outside FROM 
            (
                SELECT 
                (
                    select COUNT(DISTINCT Mobile) 
                    from udf_getEmployeeByRole('` + region + `','` + emp_Code + `')
                ) Inside,
                (
                    select COUNT(DISTINCT Mobile) as NoofViolation
                       from dbo.uspGetViolationDatewise(1,null,null,'All','` + region + `','` + emp_Code + `')
                       where day_name not in ('Saturday','Sunday')
                       
                )Outside
            )T`

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getDashboardTable: async (req, res) => {
        // let startdate = req.query.startDate;
        // let endDate = req.query.endDate;
        // let mobile = req.query.mobile;
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {
            let query = `select ROW_NUMBER() over(order by T.Employee_Name,[Date]) as id,T.* from
            (
                select *,LEFT(ViolationDate,6) as ViolationDate2,LEFT(ViolationEndDate,6) as ViolationDate3
                from dbo.[uspGetViolationDatewise](1,null,null,'All','` + region + `','` + emp_Code + `')
                where day_name not in ('Saturday','Sunday')
                union
                select *,LEFT(ViolationDate,6) as ViolationDate2,LEFT(ViolationEndDate,6) as ViolationDate3
                from dbo.[uspGetViolationOfLastFiveWorkingDays](1,null,null,'All','` + region + `','` + emp_Code + `')
                where day_name not in ('Saturday','Sunday')
            )T`;

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getDashboardData: async (req, res) => {
        let startdate = req.query.startDate;
        let endDate = req.query.endDate;
        let mobile = req.query.mobile;
        let emp_Code = req.query.empid;
        let message = '';
        try {
            let query = `Select Geo.Mobile, latitude, longitude,createdate,timediff,IsDeviation 
            createdate,Emp.Employee_Name, Emp.Department,Emp.Designation, Emp.Work_Location
            from Geolocation as Geo
            join EMPLOYEE_MASTER as Emp on Geo.Mobile = Emp.Mobile
            where (createdate BETWEEN  CAST('`+ startdate + `' AS DATE)  and  CAST('` + endDate + `' AS DATE) ) and Geo.Mobile= ` + mobile + `
            order by Geo.createdate DESC`


            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getMobileAccessable: async (req, res) => {
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {
            let query = `SELECT SUM(MobileAccessible) MobileAccessible, 
            SUM(NotAccessible) NotAccessible, COUNT(DISTINCT Mobile) TOTAL
            FROM dbo.fn_GetListOfMobileAccessibleOrNot('` + region + `','` + emp_Code + `') `;


            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getPolarChartData: async (req, res) => {
        // let startdate = req.query.startDate;
        // let endDate = req.query.endDate;
        // let mobile = req.query.mobile;
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {
            let query = `select name_2 as OfficeName, LEFT(ViolationDate,6) AS [DateName],
            COUNT(DISTINCT Mobile) as NoofViolation
            from dbo.uspGetViolationDatewise(1,null,null,'All','` + region + `','` + emp_Code + `')
            where day_name not in ('Saturday','Sunday')
            group by name_2,ViolationDate`


            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getBarchartData: async (req, res) => {
        // let startdate = req.query.startDate;
        // let endDate = req.query.endDate;
        // let mobile = req.query.mobile;
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {
            let query = `SELECT T3.[DateName],T3.[DayName],T3.OfficeName, SUM(ISNULL(ViolationCount,0)) AS TotalViol FROM
            (
                SELECT T1.[DateName],T1.[DayName],T2.OfficeName
                FROM(
                        SELECT FORMAT(DATEADD(DAY,-7, GETDATE()),'dd-MMM') AS [DateName], DATENAME(WEEKDAY, DATEADD(DAY,-7, GETDATE())) AS [DayName],1 SN
                        UNION
                        SELECT FORMAT( DATEADD(DAY,-6, GETDATE()),'dd-MMM') AS [DateName], DATENAME(WEEKDAY, DATEADD(DAY,-6, GETDATE())) AS [DayName],2 SN
                        UNION
                        SELECT FORMAT( DATEADD(DAY,-5, GETDATE()),'dd-MMM') AS [DateName], DATENAME(WEEKDAY, DATEADD(DAY,-5, GETDATE())) AS [DayName],3 SN
                        UNION
                        SELECT FORMAT( DATEADD(DAY,-4, GETDATE()),'dd-MMM') AS [DateName], DATENAME(WEEKDAY, DATEADD(DAY,-4, GETDATE())) AS [DayName],4 SN
                        UNION
                        SELECT FORMAT( DATEADD(DAY,-3, GETDATE()),'dd-MMM') AS [DateName], DATENAME(WEEKDAY, DATEADD(DAY,-3, GETDATE())) AS [DayName],5 SN
                        UNION
                        SELECT FORMAT( DATEADD(DAY,-2, GETDATE()),'dd-MMM') AS [DateName], DATENAME(WEEKDAY, DATEADD(DAY,-2, GETDATE())) AS [DayName],6 SN
                        UNION
                        SELECT FORMAT( DATEADD(DAY,-1, GETDATE()),'dd-MMM') AS [DateName], DATENAME(WEEKDAY, DATEADD(DAY,-1, GETDATE())) AS [DayName],7 SN
                )T1 CROSS JOIN
                (
                    SELECT DISTINCT name_2 as OfficeName FROM OFFICE_POLYGON
                )T2
            )T3
            LEFT JOIN
            (
                select name_2 as OfficeName,day_name as [DayName], 1 AS ViolationCount,
                LEFT(ViolationDate,6) as [DateName]
                from dbo.[uspGetViolationOfLastFiveWorkingDays](1,null,null,'All','` + region + `','` + emp_Code + `')
                where day_name not in ('Saturday','Sunday')
            )T4 ON T3.[DateName] = T4.[DateName] AND T3.OfficeName = T4.OfficeName
            where T3.[DayName] not in ('Saturday','Sunday')
            GROUP BY T3.[DateName],T3.[DayName],T3.OfficeName		
            ORDER BY T3.[DateName],T3.OfficeName`


            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getPolarDemotesting: async (req, res) => {
        let startdate = req.query.startDate;
        let lng = req.query.lng;
        let long = req.query.long;
        log.info("Background Data log. Date [" + startdate + "], Lng-  [" + lng + "], Long-  [" + long + "]");
        return res.status(200).json({ status: 'OK', message: 'Result Is true.' });
    },
    getIdleReportSummary: async (req, res) => {
        let mobile = req.query.mobile;
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        let officeName = req.query.officeName;
        let message = '';
        try {
            if (startDate == 'null') {
                query = "EXEC uspGetIdleReport @mobile=" + mobile + ", @StartDate=" + startDate + ",@EndDate=" + endDate + ", @officeName='" + officeName + "'";

            } else
                query = "EXEC uspGetIdleReport @mobile=" + mobile + ", @StartDate='" + startDate + "',@EndDate='" + endDate + "', @officeName='" + officeName + "'";

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getMobileAccessableReport: async (req, res) => {
        // let startdate = req.query.startDate;
        // let endDate = req.query.endDate;
        // let mobile = req.query.mobile;
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {
            let query = `
            SELECT  ROW_NUMBER() Over (Order By Mobile) as id,
				* FROM dbo.fn_GetListOfMobileAccessibleOrNot('` + region + `','` + emp_Code + `')
				WHERE NotAccessible = 1`;

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getGeofenceUserData: async (req, res) => {
        // let startdate = req.query.startDate;
        // let endDate = req.query.endDate;
        // let mobile = req.query.mobile;
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;

        try {
            let query = `SELECT SUM(CASE WHEN GeofenceUser = 0 THEN 1 ELSE 0 END) AS NotGeofenceUser,
            SUM(CASE WHEN GeofenceUser > 0 THEN 1 ELSE 0 END) AS GeofenceUser
            FROM usp_GetAllUserListRegionWise('` + region + `','` + emp_Code + `')`;

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getNotGeofenceUserData: async (req, res) => {
        // let startdate = req.query.startDate;
        // let endDate = req.query.endDate;
        // let mobile = req.query.mobile;
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {
            let query = `SELECT  ROW_NUMBER() Over (Order By Employee_Name,Employee_Code) as id,*
            FROM usp_GetAllUserListRegionWise('` + region + `','` + emp_Code + `')
            WHERE GeofenceUser = 0
            ORDER BY Employee_Name`;

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getWarnedNotWarnedUserCount: async (req, res) => {
        let message = '';
        let region = req.query.region;
        //let emp_Code = req.query.empid;
        let emp_Code = req.query.empid;
        try {
            let query = `SELECT SUM(case when violation_count IS NOT NULL then 1 else 0 end) as WARNED,
            SUM(case when violation_count IS NULL then 1 else 0 end) as NOT_WARNED
            FROM udf_getEmployeeByRole('` + region + `','` + emp_Code + `') EM
            LEFT JOIN [udfGetListOfWarnedEmployee]('` + region + `','` + emp_Code + `') WI
            ON EM.Mobile = WI.Mobile`;

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getTerminal: async (req, res) => {
        let message = '';
        let emp_Code = 'admin';
        //let emp_Code = req.query.empid;
        try {
            let query = `SELECT 'Select Terminal/ Office' label, '77.1898,28.5409,4' value,0 SN
            union
            SELECT A.name_2 label,CONCAT(geom.STCentroid().STX,',',geom.STCentroid().STY,',',B.Zoomlevel) value 
            ,ROW_NUMBER()OVER(ORDER BY A.NAME_2)
            FROM OFFICE_POLYGON A 
			INNER JOIN 
			(
				SELECT DISTINCT name_2 
				FROM udf_getEmployeeByRole('All','` + emp_Code + `')
			) EM ON A.name_2 = EM.name_2
			JOIN TERMINAL_ZOOM B 
			ON A.name_2=B.TERMINAL
            ORDER BY SN`;

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getNotWarnedReport: async (req, res) => {
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {
            let query = "EXEC [uspGetDetailOfNotWarnedEmployee] @Region='" + region + "', @EmpCode='" + emp_Code + "'";

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getWarnedReport: async (req, res) => {
        let message = '';
        let region = req.query.region;
        let emp_Code = req.query.empid;
        try {
            let query = "EXEC [uspGetDetailOfWarnedEmployee] @Region='" + region + "', @EmpCode='" + emp_Code + "'";

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getRoleBasedLogin: async (req, res) => {
        let message = '';
        let UserName = req.query.username;
        let Password = req.query.password;
        try {
            let query = "SELECT EmpCode FROM udf_GetEmployeeCodeByRole('admin') where Username='" + UserName + "'and Password = '" + Password + "'";

            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0][0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },
    getDataForUserManagement: async (req, res) => {
        let message = '';
        let Action = req.query.action
        let query;
        let ID = req.query.id;

        if (Action === 'add') {
            query = `INSERT INTO [dbo].[User_managementdata]
           (
           [Mobile]
           ,[Timings]
           ,[Employee_Code]
           ,[Employee_Name]
           ,[Work_Location]
           ,[Designation]
           ,[Email_ID]
            )
     VALUES
           (
           '`+ sd + `'
           ,'`+ sd + `'
           , '`+ sd + `'
           ,'`+ sd + `'
           ,'`+ sd + `'
           ,'`+ sd + `'
           ,'`+ sd + `'
		   ) where id ='`+ ID + `'`;
        }
        else if (Action === 'Update') {
            query = `UPDATE [dbo].[User_managementdata]
               SET
               [Mobile] = 'sdsd'
              ,[Timings] = 'dasasd'
              ,[Employee_Code] = 'dsaasda'
              ,[Employee_Name] = 'sdaada'
              ,[Work_Location] = 'sadadasd'
              ,[Designation] = 'dasdsa'
              ,[Email_ID] = 'adsdasd'    
         WHERE id='`+ ID + `'`
        }
        else {
            query = `SELECT ROW_NUMBER() over(ORDER BY Employee_Name) as id,
            [Mobile]
           ,[Timings]
           ,[Employee_Code]
           ,[Employee_Name]
           ,[Work_Location]
           ,[Designation]
           ,[Email_ID]    
       FROM [CCIL_CONCOR].[dbo].[User_managementdata]`;
        }
        try {
            // let query = `select * from employee_master_data em
            // inner join udf_GetEmployeeCodeByRole('`+emp_Code+`') rol
            // on em.Employee_Code = rol.EmpCode`;


            await db.connect(config, function (err) {
                if (err) console.log(err);
                let requestDB = new db.Request();
                requestDB.query(query, (err, result) => {
                    if (err) {
                        log.info("SIP2_GIS_SERVICE. [" + query + err + "], [Something went wrong. Please try again after sometime]");
                        return res.status(500).json({ status: 'NOK', data: err, message: "Your value is wrong. Please try again after sometime" });
                    }
                    if (result) {
                        log.info("SIP2_GIS_SERVICE. [List Show]");
                        return res.status(200).json({ status: 'OK', data: result.recordsets[0], message: 'List Show' });
                    }
                    else {
                        log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
                        return res.status(200).json({ status: 'OK', message: 'Sorry Your location is not added.' });
                    }
                });
            });
        }
        catch (e) {
            console.log("entering catch block");
            log.info("SIP2_GIS_SERVICE. ['entering catch block]");
            console.log(e);
            return res.status(200).json({ status: 'NOK', message: 'Something went wrong. Please try again later', data: e });
        }
    },

};

