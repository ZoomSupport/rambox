
const upgrade = {
	icon: 'resources/tools/upgrade.png',

	title: 'Upgrade',

	id: 'upgradeTab',
	closable: false,
	reorderable: false,

	tabConfig: {
		cls: 'upgrade-icon',
		handler: 'notButton',

		margin: 0
	},
}

const notifications = {
	icon: 'resources/tools/notifications.png',

	title: 'Notifications',
	
	id: 'notificationsTab',
	closable: false,
	reorderable: false,

	tabConfig: {
		id: 'notTab',
		cls: 'b-icon',
		handler: 'notButton'
	},
}


const settings = {
	icon: (localStorage.getItem('appealingSettings') == 'true') ? 'resources/tools/settings_2.png' : 'resources/tools/settings.png'
	
	,id: 'settingsTab'

	,title: 'Settings'

	,itemId: 'setTab'
	,cls: 'settings-panel'
	,closable: false
	,reorderable: false 
	,layout: 'hbox'
	
	,hidden: false 

	,tabConfig: {
		cls: 'b-icon',
	}

	,items: [
		{
			 xtype: 'grid'
			// ,title: '<h1 class="sel-main-title">Settings</h1> <h3 class="sel-sub-title">Preferences for your services</h3>'
			,title: '<h1 class="sel-main-title">Settings</h1>'
			,store: 'Services'
			,margin: '0'
			,flex: 1

			,header: { padding: "30 30" }

			,tools: [
				
				{
					xtype: 'container',
					layout: {
						type: 'vbox'
					},

					cls: "social-container",

					items: [
						{
							type: "component",
							html: '<h3 class="sel-sub-title" style="margin-left: 30px; margin-top: 0">Share app:</h3>',
						},

						{
							xtype: 'container',
							layout: {
								type: 'hbox'
							},

							cls: "social-icon-container",

							items: [
								{
									type: "component",
									html: '<a target="_blank" href="https://zeoalliance.com/"><img class="social-icon" src="resources/tools/facebook.png"></a>',
								},
								{
									type: "component",
									html: '<a target="_blank" href="https://zeoalliance.com/"><img class="social-icon" src="resources/tools/twitter.png"></a>',
								},
								{
									type: "component",
									html: '<a target="_blank" href="https://zeoalliance.com/"><img class="social-icon" src="resources/tools/google.png"></a>',
								},
							]
						}
					]
				}
			
			]
			,columns: [
				{
					 xtype: 'templatecolumn'

					,header: 'YOUR SERVICES'

					,flex: 1
					,height: 50
					,variableRowHeight: true
					,tpl: [
						'<img class="settings-row-icon" src="{[ values.type !== \"custom\" ? \"resources/icons/\"+values.logo : (values.logo == \"\" ? \"resources/icons/custom.png\" : values.logo) ]}" data-qtip="{type:capitalize}" width="42" />',
						'<span class="settings-row-title">{name}</span>'
					]

					,cls: "column-icon"

					,menuDisabled: true
					,sortable: false
					,hidable: false
					,draggable: false
					,resizable: false
				}
				
				,{
					xtype: 'checkcolumn',
					header: 'NOTIFICATIONS',
					width: 150,
					dataIndex: 'notifications',

					menuDisabled: true,
					sortable: false
					,hidable: false
					,draggable: false
					,resizable: false
				},
				{
					xtype: 'checkcolumn',
					header: 'MUTED',
					width: 100,
					dataIndex: 'muted',

					menuDisabled: true,
					sortable: false
					,hidable: false
					,draggable: false
					,resizable: false

				}
				,{
					 xtype: 'actioncolumn'
					,header: 'REMOVE'
					,width: 110
					,align: 'center'

					,menuDisabled: true
					,sortable: false
					,hidable: false
					,draggable: false
					,resizable: false

					,items: [
						{
							icon: 'resources/tools/delete.png',
							iconCls: 'settings-delete-icon'
							,handler: 'removeService'
						}
					]
				}
		
			]
			,viewConfig: {
				 emptyText: locale['app.main[15]']
				,forceFit: true
				,stripeRows: false 
			
			}
			,listeners: {
				 edit: 'onRenameService'
				,rowdblclick: 'showServiceTab'
			}
		}
	]
}


var plusTimeout = null;
var stgsTimeout = null;
// var stgTime = 1000*60*3;
var stgTime = 1000*5;

Ext.define('Rambox.store.Services', {
	 extend: 'Ext.data.Store'
	,alias: 'store.services'

	,requires: [
		'Ext.data.proxy.LocalStorage'
	]

	,model: 'Rambox.model.Service'

	,autoLoad: true
	,autoSync: true

	,groupField: 'align'
	,sorters: [
		{
			 property: 'position'
			,direction: 'ASC'
		}
	]

	,listeners: {
		load: function( store, records, successful ) {
			Ext.cq1('app-main').suspendEvent('add');


			var servicesLeft = [];
			var servicesRight = [];
			store.each(function(service) {
				// Fix some services with bad IDs
				// TODO: Remove in next release
				switch ( service.get('type') ) {
					case 'office365':
						service.set('type', 'outlook365');
						break;
					case ' irccloud':
						service.set('type', 'irccloud');
						break;
					default:
						break;
				}

				// If the service is disabled, we dont add it to tab bar
				if ( !service.get('enabled') ) return;

				var cfg = {
					 xtype: 'webview'
					,id: 'tab_'+service.get('id')
					,title: service.get('name')
					,icon: service.get('type') !== 'custom' ? 'resources/icons/'+service.get('logo') : ( service.get('logo') === '' ? 'resources/icons/custom.png' : service.get('logo'))
					,src: service.get('url')
					,type: service.get('type')
					,muted: service.get('muted')
					,includeInGlobalUnreadCounter: service.get('includeInGlobalUnreadCounter')
					,displayTabUnreadCounter: service.get('displayTabUnreadCounter')
					,enabled: service.get('enabled')
					,record: service
					,tabConfig: {
						service: service,
					}
				};

				service.get('align') === 'left' ? servicesLeft.push(cfg) : servicesRight.push(cfg);
			});

			if ( !Ext.isEmpty(servicesLeft) ) Ext.cq1('app-main').insert(0, servicesLeft);
			if ( !Ext.isEmpty(servicesRight) ) Ext.cq1('app-main').add(servicesRight);

			if (store.data.length > 1) {

				Ext.cq1('app-main').add(notifications)
				Ext.cq1('app-main').add(settings)

				if (
					!(localStorage.getItem('activated') == 'true') && 
					localStorage.getItem('premiumToggle')
				) Ext.cq1('app-main').add(upgrade)

			}

			const welcomeTab = Ext.cq1('app-main').getComponent('welcomeTab');

			if (store.data.length === 0) {
				Ext.cq1('app-main').setActiveTab(welcomeTab)
			}

			store.suspendEvent('load');
			Ext.cq1('app-main').resumeEvent('add');
		},

		add: function (store, records, i) {

			console.log("Adding service")
			const sLen = store.data.length
			const sName = store.data.items[sLen-1].data.type

			// Google Analytics Tracking
			ga_storage._trackEvent('Application', 'Add Service #'+sLen, sName) 
			FB.AppEvents.logEvent('Add Service '+sLen);

			if (store.data.length > 1) {
				// if (Ext.cq1('app-main').getComponent('upgradeTab') === undefined)
				// 	Ext.cq1('app-main').add(upgrade)

					
				if (typeof Ext.cq1('app-main').getComponent('notificationsTab') == 'undefined')
					Ext.cq1('app-main').add(notifications)

				if (typeof Ext.cq1('app-main').getComponent('setTab') == 'undefined') {

					Ext.cq1('app-main').add(settings)

					// stgsTimeout = setTimeout(function () {
						
					// }, stgTime)

					localStorage.setItem('stgsTimeout', true)
					localStorage.setItem('plusTimeout', false)
					ipc.send('timerReset')
				}
				
				
				// RESET
				// ipc.send('resetNotificationTimer')
			}

			if (store.data.length == 1) {

				// RESET
				if (!localStorage.getItem('ntfFirst')) {

					ipc.send('resetNotificationTimer')
					localStorage.setItem('ntfFirst', true)
				}

				// ga_storage._trackEvent('Application', 'Get Started', 'Add service on Welcome screen')

				// Update within tab
				if (!localStorage.getItem('plusTimeout')) {
					localStorage.setItem('plusTimeout', true)
					ipc.send('timerReset')
				}
				// plusTimeout = setTimeout(function () {

				// 	const tab = Ext.cq1('app-main').getComponent('plusTab') 
				// 	tab.setIcon('resources/tools/add_2.png')

				// 	localStorage.setItem('appealingPlus', true)

				// }, stgTime)
			} else if (store.data.length == 2) {

				// RESET
				if (!localStorage.getItem('ntfSecond')) {

					ipc.send('resetNotificationTimer')
					localStorage.setItem('ntfSecond', true)

					localStorage.setItem('startTime', Date.now().toString())
				}

				// localStorage.setItem('appealingPlus', false)
				// ga_storage._trackEvent('Application', 'Get Started', 'Add second service on Welcome screen')

				// const tab = Ext.cq1('app-main').getComponent('plusTab') 
				// tab.setIcon('resources/tools/add.png')
			}

		},

		update: function (store, op, modName, det) {

			// console.log('Service Store Update')
			// console.log(modName, det)

			store.suspendEvent('update');
			if (modName === "edit") {
				det.forEach(function (i) {
					console.log(i)
					switch (i) {
						case "notifications":

							var oStat = (op.data.notifications) ? "On" : "Off" 
							console.log(op.data.name, 'Notifications ' + oStat)

							ga_storage._trackEvent('Application', 'Notifications ' + oStat , op.data.name)

						break;

						case "muted":
						
							var oStat = (op.data.muted) ? "On" : "Off" 
							console.log(op.data.name, 'Muted ' + oStat)

							ga_storage._trackEvent('Application', 'Muted ' + oStat, op.data.name)
						break;
					}
				})
			}
			store.resumeEvent('update');

		},

		remove: function (store, records, i) {

			store.suspendEvent('remove');

			records.forEach(function (i) {
				console.log('Remove Service', i.data.name)
				ga_storage._trackEvent('Application', 'Remove Service', i.data.name)
			})
			
			store.resumeEvent('remove');
		}
	}
});
