"use strict";

var controller;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);

    controller = new Controller();

    // FR 1.2 ---> display widgets
    controller.displayWidgetData();

    // FR 1.1 ---> validate and handle all input
    controller.handleInput();

    controller.getClientData();

    controller.initializeMap();
}


function Controller() {
    const BASE_URL = 'http://137.108.92.9/openstack/api/';
    const API_PASSWORD = '52xi5Qbf';

    let currentlyDisplayedWidget = 1;
    let oucu = 'yvd2';
    let clientId = 1;
    let orderAmount = 0;
    let agreedPrice = 0;
    let orderList = [];

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

    //  FR1.1 ---> VALIDATE INPUT
    this.handleInput = () => {
        const validateOUCU = (oucu) => {
            if (oucu.charAt(0).match(/[a-z]/i) && /^\d+$/.test(oucu.charAt(oucu.length - 1))) {
                return true;
            };

            return false;
        }

        document.addEventListener('input', (e) => {
            const message = document.getElementById('validateMessage');

            if (e.target.id === 'salesperson') {
                if (validateOUCU(e.target.value)) {
                    message.textContent = 'OUCU is valid';
                    oucu = e.target.value;
                } else {
                    message.textContent = 'OUCU is invalid';
                }
            }

            if (e.target.id === 'clientId') {
                clientId = e.target.value;
            }

            if (e.target.id === 'orderAmount') {
                console.log(e.target.value);
                orderAmount = e.target.value;
            }

            if (e.target.id === 'agreedPrice') {
                agreedPrice = e.target.value;
            }
        })
    }

    //  FR1.2 ----> DISPLAY WIDGETS
    const displayWidget = (widgetData) => {
        const description = document.getElementById('widgetDescription');
        description.textContent = widgetData[0].description;

        const img = document.getElementById('widgetImage');
        img.src = widgetData[0].url;

        const price = document.getElementById('agreedPrice');
        price.value = widgetData[0].pence_price;
        agreedPrice = widgetData[0].pence_price;
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

    this.getClientData = async () => {
        const clientData = await fetchData('clients', clientId);
        console.log(clientData);
    }


    // FR 1.3 ---> ADDING WIDGET TO ORDER ITEMS
    this.createOrder = () => {
        fetch(`${BASE_URL}orders?OUCU=tm352&password=6WGc5Q76`, {
            method: 'POST',
            body: JSON.stringify({
                OUCU: oucu,
                password: API_PASSWORD,
                client_id: clientId,
                latitude: 20,
                longitude: -15
            })
        })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.log(err))
    }

    this.getOrderItemsData = async () => {
        const res = await fetch(`${BASE_URL}order_items?OUCU=${oucu}&password=${API_PASSWORD}`);
        const json = await res.json();

        if (json.data) {
            json.data.forEach((order) => {
                const listEl = document.getElementById('orderList');
                const el = document.createElement('li');
                const totalPrice = order.number * order.pence_price;
                el.textContent = `${order.number} widget(s) with id ${order.widget_id} x ${order.pence_price} agreed price = ${totalPrice + 20 / 100 * totalPrice} inc VAT`
                
                listEl.appendChild(el);
            })
        }
    }

    //FR 1.3 --> ADD WIDGET TO ORDER ITEMS LIST
    this.addToOrder = () => {
        const listEl = document.getElementById('orderList');
        const el = document.createElement('li');
        const totalPrice = orderAmount * agreedPrice;
        el.textContent = `${orderAmount} widget(s) with id ${currentlyDisplayedWidget} x ${agreedPrice} agreed price = ${totalPrice + 20 / 100 * totalPrice} inc VAT`
        
        orderList = [...orderList, {
            widgetId: currentlyDisplayedWidget,
            amount: orderAmount,
            price: agreedPrice,
            total: totalPrice + 20 / 100 * totalPrice
        }]
        listEl.appendChild(el);

        calculateTotalAmount();
    }

    // FR 1.4 --> calculate total + VAT
    const calculateTotalAmount = () => {
        let total = 0;

        orderList.forEach((order) => {
            total = total + order.total;
        });

        console.log(total);

        const totalEl = document.getElementById('totalAmount');
        totalEl.textContent = total;
    }

    // FR 1.3 ---> start order
    this.placeNewOrder = () => {
        controller.createOrder();
        controller.getOrderItemsData();
    }

    // FR 2 - map functionality
    this.initializeMap = () => {
        var platform = new H.service.Platform({
            // TODO: Change to your own API key or map will NOT work!
            apikey: "eAfwuTu8zUxhOAg4ju1aXjt15cUDf5N9_kaDyg9OAQY",
        });
        // Obtain the default map types from the platform object:
        var defaultLayers = platform.createDefaultLayers();
        // Instantiate (and display) a map object:
        var map = new H.Map(
            document.getElementById("mapContainer"),
            defaultLayers.vector.normal.map,
            {
                zoom: 14,
                center: { lat: 52.5, lng: 13.4 },
            }
        );

        // Create the default UI:
        var ui = H.ui.UI.createDefault(map, defaultLayers);
        var mapSettings = ui.getControl("mapsettings");
        var zoom = ui.getControl("zoom");
        var scalebar = ui.getControl("scalebar");
        mapSettings.setAlignment("top-left");
        zoom.setAlignment("top-left");
        scalebar.setAlignment("top-left");
        // Enable the event system on the map instance:
        var mapEvents = new H.mapevents.MapEvents(map);
        // Instantiate the default behavior, providing the mapEvents object:
        new H.mapevents.Behavior(mapEvents);
        
        //update map function
        const updateMap = () => {
            var icon = new H.map.DomIcon("<div>Client is here</div>");
            var marker;
            var bubble;
    
            const onSuccess = (position) => {
                console.log("Obtained position", position);
                var point = {
                    lng: position.coords.longitude,
                    lat: position.coords.latitude,
                };
                if (marker) {
                    // Remove marker if it already exists
                    map.removeObject(marker);
                }
                if (bubble) {
                    // Remove bubble if it already exists
                    ui.removeBubble(bubble);
                }
                    map.setCenter(point);
                marker = new H.map.DomMarker(point, { icon: icon });
            }
            const onError = (error) => {
                console.error("Error calling getCurrentPosition", error);
            }
            navigator.geolocation.getCurrentPosition(onSuccess, onError, {
                enableHighAccuracy: true,
            });
        }

        document.getElementById('add-to-order').addEventListener("click", function (evt) {
            // Update map with client location
            updateMap();
        });
    }
}