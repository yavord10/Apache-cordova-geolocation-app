"use strict";

var controller;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
    // Create the TaxiShare object for use by the HTML view
    controller = new Controller();
    
    controller.displayWidgetData();

    controller.validateInput();
}


function Controller() {
    const BASE_URL = 'http://137.108.92.9/openstack/api/';
    const API_PASSWORD = '52xi5Qbf';

    let currentlyDisplayedWidget = 1;
    let oucu = 'yvd2';

    const fetchData = async (dataType, id='') => {
        const res = await fetch(`${BASE_URL}${dataType}/${id}?OUCU=${oucu}&password=${API_PASSWORD}`);
        const json = await res.json();

        if (json.status !== 'success') {
            if (!!id) {
                const res = await fetch(`${BASE_URL}${dataType}/1?OUCU=${oucu}&password=${API_PASSWORD}`);
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

    //VALIDATE INPUT ---> FR1.1
    this.validateInput = () => {
        const validateOUCU = (oucu) => {
            console.log(oucu, oucu.charAt(0), oucu.charAt(oucu.length -1));
            if (oucu.charAt(0).match(/[a-z]/i) && /^\d+$/.test(oucu.charAt(oucu.length - 1))) {
                return true;
            };

            return false;
        }

        document.addEventListener('input', (e) => {
            const message = document.getElementById('validateMessage');

            console.log(e.target.id)
            if (e.target.id === 'salesperson') {
                if (validateOUCU(e.target.value)) {
                    message.textContent = 'OUCU is valid';
                    oucu = e.target.value;
                } else {
                    message.textContent = 'OUCU is invalid';
                }
            }
        })
    }


    //WIDGETS ---> FR1.2
    const displayWidget = (widgetData) => {
        console.log(widgetData);

        const description = document.getElementById('widgetDescription');
        description.textContent = widgetData[0].description;

        const img = document.getElementById('widgetImage');
        img.src = widgetData[0].url;
    };

    this.displayWidgetData = async () => {
        const widgetData = await fetchData('widgets', currentlyDisplayedWidget);

        if (widgetData) {
            displayWidget(widgetData, currentlyDisplayedWidget);
        }
    };

    this.displayNextWidget = async () => {
        const widgetData = await fetchData('widgets', currentlyDisplayedWidget + 1);
        displayWidget(widgetData);

        currentlyDisplayedWidget = currentlyDisplayedWidget + 1;
    };

    this.displayPrevWidget = async () => {
        const widgetData = await fetchData('widgets', currentlyDisplayedWidget - 1);
        displayWidget(widgetData);

        currentlyDisplayedWidget = currentlyDisplayedWidget - 1;
    };
}