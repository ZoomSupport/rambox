Ext.define('Rambox.util.License', {
     singleton: true

    ,requires: [
        "Rambox.util.MD5"
    ]

    ,server: "http://stage-account.getadwarebuster.com/"

    ,secret: "TEST"
    ,softBundle: "com.zoomsupport.octo"
    ,softVersion: "0.1.0"

    ,checkLicense: function (suc, err) {

            ipc.send('getSysInfo') // Request system info from electron

            // Process system info
            ipc.on('sysInfo', function (e, info) {
                console.log(e, info)

                const secret = "TEST"
                const softBundle = "com.zoomsupport.octo"
                const softVersion = "0.1.0"

                const params = {
                    macAddress: info.macAddress,

                    serial: info.serial,
                    modelId: info.modelId,
                    osVersion: info.osVersion,

                    softBundle: softBundle, //this.softBundle,
                    softVersion: softVersion, //this.softVersion,

                    signature: Rambox.util.MD5.encypt(
                        info.macAddress + info.modelId + info.osVersion + softBundle + softVersion + secret
                    )
                }

                console.log(params)

                Ext.Ajax.request({
                    url: "http://stage-account.getadwarebuster.com/api/v1/license/info",
                    // url: this.server,
                    method: "POST",

                    params: params,

                    success: function (res) {
                        console.log(res)
                        suc();
                    },

                    err: function (e) {
                        console.log(res)
                        err(e);
                    }

                })

            })
    }
})