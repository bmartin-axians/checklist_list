sap.ui
		.define(
				[ "sap/ui/core/mvc/Controller", "sap/m/MessageToast" ],
				function(Controller, MessageToast) {
					"use strict";

					return Controller
							.extend(
									"com.hella.ppm.CheckListItems.controller.Main",
									{
										onInit : function() {
											// Get settings
											var oSettings = this
													.getOwnerComponent()
													.getModel("settings");
											var oParams = this
													.getOwnerComponent()
													.getComponentData().startupParameters;
											oSettings.setProperty("/Service",
													oParams.serviceurl[0]);
											oSettings.setProperty(
													"/Projectguid",
													oParams.projectguid[0]);
											var oCheckbox = this.getView()
													.byId("idFilterBox");
											if (oParams.domainFilter[0] !== undefined) {
												oCheckbox
														.setText(oParams.domainFilter[0]);
												oCheckbox.setVisible(true);
												oCheckbox.setSelected(true);

											} else {
												oCheckbox.setVisible(false);
												oCheckbox.setSelected(false);
											}

											// Create data model
											this._createDataModel(oSettings
													.getProperty("/Service"));

											// Bind table
											this
													._bindTable(oSettings
															.getProperty("/Projectguid"));
										},

										_createDataModel : function(sService) {
											var sUrl = "/sap/opu/odata/sap/"
													+ sService;
											var oModel = new sap.ui.model.odata.v2.ODataModel(
													sUrl);
											oModel.setUseBatch(false);
											oModel
													.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
											sap.ui.getCore().setModel(oModel);
											this.getView().setModel(oModel);
										},

										_bindTable : function(sGuid) {
											this
													.getView()
													.byId("idCheckListItems")
													.bindItems(
															{
																path : "/ListSet",
																filters : [ new sap.ui.model.Filter(
																		"ProjectGuid",
																		"EQ",
																		sGuid) ],
																factory : this.itemFactory
															});
										},

										itemFactory : function(sId, oContext) {
											var oItem = sap.ui
													.xmlfragment(
															"com.hella.ppm.CheckListItems.view.fragments.Item",
															this);
											oItem.setBindingContext(oContext);
											return oItem;
										},

										onBack : function() {
											window.history.go(-1);
										},

										_getDialog : function() {
											if (!this._oDialog) {
												this._oDialog = sap.ui
														.xmlfragment(
																"com.hella.ppm.CheckListItems.view.fragments.Filter",
																this);
												this.getView().addDependent(
														this._oDialog);
												this
														._buildFilterItems(this._oDialog
																.getFilterItems());
											}
											return this._oDialog;
										},

										onSortButtonPressed : function(oEvent) {
											this._getDialog().open("sort");
										},

										onFilterButtonPressed : function(oEvent) {
											this._getDialog().open("filter");
										},

										_buildFilterItems : function(oLists) {
											var oItems = this.getView().byId(
													"idCheckListItems")
													.getItems();
											var oKeys = [];

											// Clear all
											for (var i = 0; i < oLists.length; i++) {
												oLists[i].removeAllItems();
											}

											var oColumns = this.getView().byId(
													"idCheckListItems")
													.getColumns();

											for (var i = 0; i < oColumns.length; i++) {
												oKeys[i] = [];
											}

											for (var i = 0; i < oItems.length; i++) {
												var oCells = oItems[i]
														.getCells();
												for (var j = 0; j < oCells.length; j++) {
													if (oCells[j] instanceof sap.m.Text) {
														var sText = oCells[j].getText();

													} else {
														sText = oItems[i]
																.getBindingContext()
																.getProperty(
																		"SevText");

													}
													if (oKeys[j].indexOf(sText) === -1
															&& sText !== "") {
														oKeys[j].push(sText);
													}
												}
											}

											for (var i = 0; i < oLists.length; i++) {
												for (var j = 0; j < oKeys[i].length; j++) {
													oLists[i]
															.addItem(new sap.m.ViewSettingsItem(
																	{
																		text : oKeys[i][j]
																	}));
												}
											}
										},

										onConfirm : function(oEvent) {
											var oSorter;
											if (oEvent.getParameter("sortItem")
													.getKey() === "None") {
												// Reset sorter
												oSorter = null;

											} else {
												// Add sorter
												oSorter = new sap.ui.model.Sorter(
														{
															path : oEvent
																	.getParameter(
																			"sortItem")
																	.getKey(),
															group : "true",
															descending : oEvent
																	.getParameter("sortDescending")
														});

											}
											this.getView().byId(
													"idCheckListItems")
													.getBinding("items").sort(
															oSorter);

											var oBinding = this.getView().byId(
													"idCheckListItems")
													.getBinding("items");
											// Filter
											var aFilter = [];

											for (var i = 0; i < oEvent.getParameter("filterItems").length; i++) {
												
												var sText = oEvent.getParameters().filterItems[i].getText();
												if(oEvent.getParameters().filterItems[i].getParent().getKey() === "DueDate") {
													var date = oEvent.getParameters().filterItems[i].getText().split(".");
														
													sText = new Date(date[2], date[1]-1, date[0]);
													sText.setHours(2);
												} 
												
												aFilter.push(new sap.ui.model.Filter(
														oEvent
																.getParameters().filterItems[i]
																.getParent()
																.getKey(),
														'EQ',
														sText));
											}
														
											oBinding.filter(aFilter);
										},
										
										onSelectItem: function(oEvent) {
											var oBindingContext = oEvent.getSource().getSelectedItem().getBindingContext();
											var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
											var oSettings = this.getOwnerComponent().getModel("settings");
											
											var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
												target : {
													semanticObject : "YWORK_PACKAGE",
													action : "display"
												},
												params : {
													Route : "TargetMaster",
													pGuid : oSettings.getProperty("/Projectguid"),
													lGuid : oBindingContext.getProperty("Itemguid")
												}
											})) || ""; 
											oCrossAppNavigator.toExternal({
												target : {
													shellHash : hash
												}
											}); 
										}

									});
				});