(() => {
  "use strict";

  /*
   * FAIRWORK LOCAL — MAP FEATURES
   *
   * Nearby map:
   * - Approximate service-area markers
   * - Customer location with permission
   *
   * Booking map:
   * - Worker can explicitly share GPS
   * - Same-browser demo updates
   *
   * IMPORTANT:
   * This version does not yet sync locations across devices.
   * Use Supabase with appropriate row-level security for that.
   */

  const $ = (id) => document.getElementById(id);

  const nearbyMapElement = $("nearbyWorkersMap");
  const trackingMapElement = $("bookingTrackingMap");

  // Avoid errors if this script is accidentally loaded twice.
  if (!nearbyMapElement || !trackingMapElement) return;

  if (typeof L === "undefined") {
    console.error("Leaflet was not loaded. Check the Leaflet script tag.");
    $("nearbyMapMessage").textContent =
      "The map library could not load. Check your internet connection.";
    return;
  }

  const DEMO_LOCATION_KEY = "fairwork_demo_worker_location_v1";

  /*
   * These coordinates are approximate area-centre markers.
   * They are NOT the workers' actual addresses or live positions.
   * Change these sample areas to match the areas your workers serve.
   */
  const demoWorkers = [
    {
      name: "Ravi Kumar",
      service: "Electrician",
      area: "Kalyan West",
      price: 550,
      lat: 19.2437,
      lng: 73.1305,
      demo: true
    },
    {
      name: "Imran Shaikh",
      service: "Plumber",
      area: "Kalyan East",
      price: 450,
      lat: 19.2401,
      lng: 73.1455,
      demo: true
    },
    {
      name: "Meena Patil",
      service: "Cleaner",
      area: "Kalyan West",
      price: 350,
      lat: 19.2437,
      lng: 73.1305,
      demo: true
    },
    {
      name: "Suresh Yadav",
      service: "Carpenter",
      area: "Dombivli",
      price: 700,
      lat: 19.2183,
      lng: 73.0867,
      demo: true
    },
    {
      name: "Asha More",
      service: "Painter",
      area: "Thane",
      price: 600,
      lat: 19.2183,
      lng: 72.9781,
      demo: true
    }
  ];

  // -----------------------------------------
  // 1. MAP INITIALIZATION
  // -----------------------------------------

  const nearbyMap = L.map("nearbyWorkersMap").setView(
    [19.2437, 73.1305],
    12
  );

  const trackingMap = L.map("bookingTrackingMap").setView(
    [19.2437, 73.1305],
    12
  );

  const tileOptions = {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">' +
      "OpenStreetMap</a> contributors"
  };

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    tileOptions
  ).addTo(nearbyMap);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    tileOptions
  ).addTo(trackingMap);

  const workerMarkers = L.featureGroup().addTo(nearbyMap);
  let customerMarker = null;
  let liveWorkerMarker = null;
  let destinationMarker = null;
  let routeLine = null;
  let locationWatchId = null;

  // -----------------------------------------
  // 2. NEARBY WORKER DISCOVERY
  // -----------------------------------------

  function renderWorkerCards() {
    const results = $("mapWorkerResults");
    if (!results) return;

    results.replaceChildren();

    demoWorkers.forEach((worker) => {
      const card = document.createElement("article");
      card.className = "map-worker-card";

      const title = document.createElement("h3");
      title.textContent = worker.name;

      const service = document.createElement("p");
      service.textContent = worker.service;

      const area = document.createElement("p");
      area.textContent = worker.area + " · Approximate service area";

      const price = document.createElement("p");
      price.textContent = "Indicative price: ₹" + worker.price;

      const focusButton = document.createElement("button");
      focusButton.type = "button";
      focusButton.className = "map-action-btn";
      focusButton.textContent = "View on map";

      focusButton.addEventListener("click", () => {
        nearbyMap.setView([worker.lat, worker.lng], 15);

        const matchingMarker = workerMarkers.getLayers().find((marker) => {
          return marker.options.workerName === worker.name;
        });

        if (matchingMarker) matchingMarker.openPopup();
      });

      card.append(title, service, area, price, focusButton);
      results.appendChild(card);
    });
  }

  demoWorkers.forEach((worker) => {
    const marker = L.marker([worker.lat, worker.lng], {
      workerName: worker.name
    }).addTo(workerMarkers);

    marker.bindPopup(
      "<strong>" + escapeHtml(worker.name) + "</strong>" +
      "<br>" + escapeHtml(worker.service) +
      "<br>" + escapeHtml(worker.area) +
      "<br>Approximate service area" +
      "<br>Indicative price: ₹" + worker.price
    );
  });

  renderWorkerCards();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  // Ask for location only after the customer clicks the button.
  $("locateCustomerBtn")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      $("nearbyMapMessage").textContent =
        "Your browser does not support location sharing.";
      return;
    }

    $("nearbyMapMessage").textContent =
      "Waiting for your location permission…";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (customerMarker) nearbyMap.removeLayer(customerMarker);

        customerMarker = L.marker([lat, lng]).addTo(nearbyMap);
        customerMarker.bindPopup("Your current location").openPopup();

        nearbyMap.setView([lat, lng], 14);

        $("nearbyMapMessage").textContent =
          "Your location is shown on this map. Worker pins are approximate service areas.";
      },
      (error) => {
        const messages = {
          1: "Location permission was denied. You can still explore the map.",
          2: "Your location could not be determined. Please try again.",
          3: "Location request timed out. Please try again."
        };

        $("nearbyMapMessage").textContent =
          messages[error.code] ||
          "Could not access your location. You can still explore the map.";
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  });

  // -----------------------------------------
  // 3. BOOKING MAP — WORKER LOCATION SHARING
  // -----------------------------------------

  function setTrackingStatus(status, message) {
    if ($("trackingStatus")) $("trackingStatus").textContent = status;
    if ($("trackingMessage")) $("trackingMessage").textContent = message;
  }

  function drawWorkerLocation(lat, lng, accuracy) {
    const location = [lat, lng];

    if (!liveWorkerMarker) {
      liveWorkerMarker = L.marker(location).addTo(trackingMap);
      liveWorkerMarker.bindPopup("Worker's shared location");
    } else {
      liveWorkerMarker.setLatLng(location);
    }

    trackingMap.setView(location, 15);

    if (routeLine) {
      trackingMap.removeLayer(routeLine);
      routeLine = null;
    }

    // This is an accuracy circle, not a route or travel-time estimate.
    if (window.fairWorkAccuracyCircle) {
      trackingMap.removeLayer(window.fairWorkAccuracyCircle);
    }

    window.fairWorkAccuracyCircle = L.circle(location, {
      radius: Math.max(accuracy || 0, 10),
      color: "#347747",
      fillOpacity: 0.08
    }).addTo(trackingMap);
  }

  function saveDemoLocation(position) {
    const payload = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      updatedAt: new Date().toISOString(),
      sharing: true
    };

    // Demo only: localStorage does not synchronize separate devices.
    localStorage.setItem(DEMO_LOCATION_KEY, JSON.stringify(payload));

    drawWorkerLocation(payload.lat, payload.lng, payload.accuracy);

    setTrackingStatus(
      "Sharing in this browser",
      "Last update: " + new Date(payload.updatedAt).toLocaleTimeString() +
      ". This demo location is not visible to customers on other devices."
    );
  }

  function startLocationSharing() {
    if (!navigator.geolocation) {
      setTrackingStatus(
        "Unavailable",
        "Your browser does not support GPS location sharing."
      );
      return;
    }

    if (locationWatchId !== null) return;

    setTrackingStatus(
      "Requesting permission",
      "Allow location access in your browser to start sharing."
    );

    locationWatchId = navigator.geolocation.watchPosition(
      saveDemoLocation,
      (error) => {
        const messages = {
          1: "Location permission was denied. Enable it in browser settings if you want to share.",
          2: "Your location could not be determined.",
          3: "Location request timed out. Please try again."
        };

        setTrackingStatus(
          "Not sharing",
          messages[error.code] || "Location sharing failed."
        );

        stopLocationSharing(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );

    $("startWorkerLocationBtn").disabled = true;
    $("stopWorkerLocationBtn").disabled = false;
  }

  function stopLocationSharing(updateStatus = true) {
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
      locationWatchId = null;
    }

    $("startWorkerLocationBtn").disabled = false;
    $("stopWorkerLocationBtn").disabled = true;

    localStorage.removeItem(DEMO_LOCATION_KEY);

    if (updateStatus) {
      setTrackingStatus(
        "Not sharing",
        "Location sharing has stopped in this browser."
      );
    }
  }

  $("startWorkerLocationBtn")?.addEventListener(
    "click",
    startLocationSharing
  );

  $("stopWorkerLocationBtn")?.addEventListener(
    "click",
    () => stopLocationSharing(true)
  );

  // Display a location if another tab of this same browser is sharing it.
  function loadDemoLocation() {
    const raw = localStorage.getItem(DEMO_LOCATION_KEY);

    if (!raw) {
      if (liveWorkerMarker) {
        trackingMap.removeLayer(liveWorkerMarker);
        liveWorkerMarker = null;
      }

      if (window.fairWorkAccuracyCircle) {
        trackingMap.removeLayer(window.fairWorkAccuracyCircle);
        window.fairWorkAccuracyCircle = null;
      }

      setTrackingStatus(
        "Not sharing",
        "No worker location is currently being shared in this browser."
      );
      return;
    }

    try {
      const data = JSON.parse(raw);

      if (!data.sharing || !Number.isFinite(data.lat) ||
          !Number.isFinite(data.lng)) {
        return;
      }

      drawWorkerLocation(data.lat, data.lng, data.accuracy);

      setTrackingStatus(
        "Demo location available",
        "Updated " + new Date(data.updatedAt).toLocaleTimeString() +
        ". Only tabs in this same browser can see this demo update."
      );
    } catch (error) {
      console.warn("Invalid demo location data.", error);
    }
  }

  window.addEventListener("storage", (event) => {
    if (event.key === DEMO_LOCATION_KEY) loadDemoLocation();
  });

  loadDemoLocation();

  // Leaflet maps sometimes need a resize refresh after sections are shown.
  window.addEventListener("resize", () => {
    nearbyMap.invalidateSize();
    trackingMap.invalidateSize();
  });

})();