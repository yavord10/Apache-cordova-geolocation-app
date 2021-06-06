"use strict";

var controller;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
    // Create the TaxiShare object for use by the HTML view
    controller = new Controller();
    
    controller.displayWidgetData();
}


function Controller() {
    const BASE_URL = 'http://137.108.92.9/openstack/api/';
    const API_PASSWORD = '52xi5Qbf';

    let currentlyDisplayedWidget = 1;

    const fetchWidgetData = async (id='', oucu='yvd2') => {
        const res = await fetch(`${BASE_URL}widgets/${id}?OUCU=${oucu}&password=${API_PASSWORD}`);
        const json = await res.json();

        if (json.status !== 'success') {
            if (!!id) {
                const res = await fetch(`${BASE_URL}widgets/1?OUCU=${oucu}&password=${API_PASSWORD}`);
                const json = await res.json();

                if (json.status !== 'success') {
                    console.log('Error fetching widget data');
                    return [];
                }

                currentlyDisplayedWidget = 1;
                return json.data;
            }

            console.log('Error fetching widget data');
            return [];
        }

        console.log(json.data);
        return json.data;
    };

    const displayWidget = (widgetData) => {
        console.log(widgetData);

        const description = document.getElementById('widgetDescription');
        description.textContent = widgetData[0].description;

        const img = document.getElementById('widgetImage');
        img.src = widgetData[0].url;
    };

    this.displayWidgetData = async () => {
        const widgetData = await fetchWidgetData(currentlyDisplayedWidget);

        if (widgetData) {
            displayWidget(widgetData, currentlyDisplayedWidget);
        }
    }

    this.displayNextWidget = async () => {
        const widgetData = await fetchWidgetData(currentlyDisplayedWidget + 1);
        displayWidget(widgetData);

        currentlyDisplayedWidget = currentlyDisplayedWidget + 1;
    }

    this.displayPrevWidget = async () => {
        const widgetData = await fetchWidgetData(currentlyDisplayedWidget - 1);
        displayWidget(widgetData);

        currentlyDisplayedWidget = currentlyDisplayedWidget - 1;
    }
}