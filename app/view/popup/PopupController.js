// const upgrade = {
// 	icon: 'resources/tools/upgrade.png',

// 	id: 'upgradeTab',
// 	closable: false,
// 	reorderable: false,

// 	tabConfig: {
// 		cls: 'b-icon',
// 		handler: 'notButton',
// 	},
// }


Ext.define('Rambox.view.popup.PopupController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.popup-popup',

    requestTimeout: null,
    timeoutTime: 5000,
    externalURL: 'https://zeoalliance.com',

    doUpgrade: function (btn) {
        ga_storage._trackEvent('Application', 'Upgrade to PRO Click')

        // ipc.send("openExternalLink", this.externalURL)

        // Enable Spinner view
        this.getView().getComponent('buy-popup').setHidden(true)
        this.getView().getComponent('buy-spinner').setHidden(false)

        this.requestTimeout = setInterval(this.requestLoop, this.timeoutTime)
    },

    cancelActivation: function () {

        this.getView().getComponent('buy-popup').setHidden(false)
        this.getView().getComponent('buy-spinner').setHidden(true)

        clearInterval(this.requestTimeout)
    },

    displayCodeEntryView: function () {

    },

    requestLoop: function () {
        console.log("LOOPING REQUEST")

        Rambox.util.License.checkLicense(this.requestSucess, this.requestError)
    },

    requestSucess: function (r) {
        console.log("[EVENT] License Server Request Success")
        if (r.statusCode == 0 && r.hasLicense) {
            this.upgradeSuccess()
        }
    },

    requestError: function (r) {
        console.error("[ERROR] License Server Request Error")
    },

    upgradeSuccess: function() {
        var win = this.getView();

        // Save activation
        // localStorage.setItem('activated', true)
        ga_storage._trackEvent('Application', 'Upgrade to PRO Successful')

        // Remove activation tab
        const upTab = Ext.cq1('app-main').getComponent('upgradeTab') 
        Ext.cq1('app-main').remove(upTab)

        win.close();

        if (win.record)
            Ext.create('Rambox.view.add.Add', { record: win.record });
    },

    onClose: function(btn) {

        if (
            Ext.cq1('app-main').getComponent('upgradeTab') === undefined && 
            !(localStorage.getItem('activated') == 'true')
        ) {
            Ext.cq1('app-main').add(upgrade)
            localStorage.setItem('premiumToggle', true)
        }

        clearInterval(this.requestTimeout)
    },

    backClick: function () {
        console.log('BACK CLICKED')
    },

    renderBackButton: function (c) {
        var me = this;

        c.getEl().on({
            click: function() {
                console.log('LINK CLICK')
                me.cancelActivation()
            }
        })
    }

    ,afterRenderWebview: function (c) {
        var me = this
        var webview = c.getEl().el.dom

        // Intersect new window event
        webview.addEventListener('new-window', function (e) {
            let url = e.url
            let param = url.split('#')[1]

            switch (param) {
                case 'buy':
                    console.log(this)
                    me.doUpgrade()
                break;

                case 'manual':
                    console.log('ACTIVATE MANUALLY ')
                break;
            }
        })
    }
})