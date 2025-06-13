let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35.6895, lng: 139.6917 },
    zoom: 12,
  });

  console.log("map読み込み")

  setupAddressSearch();
  setupMapDoubleClick();
}

function setupAddressSearch() {
  const input = document.getElementById("address-input");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const address = input.value;
      geocodeAddress(address);
    }
  });
}

function geocodeAddress(address) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;
      promptAndPlaceMarker(location, address);
    } else {
      alert("住所が見つかりません: " + status);
    }
  });
}

function setupMapLongPress() {
  let pressTimer;
  map.addListener("mousedown", (e) => {
    pressTimer = setTimeout(() => {
      const location = e.latLng;
      const address = `指定位置（${location.lat().toFixed(5)}, ${location.lng().toFixed(5)}）`;
      promptAndPlaceMarker(location, address);
    }, 1000);  // 1秒間の長押しを検出
  });

  map.addListener("mouseup", () => {
    clearTimeout(pressTimer);  // 長押しが解除された場合
  });
}

function promptAndPlaceMarker(location, address) {
  const memo = prompt("この地点のメモを入力してください（空でもOK）:") || "";
  placeMarker(location, address, memo);
}

function placeMarker(location, address, memo = "") {
  const marker = new google.maps.Marker({
    position: location,
    map,
    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    title: address,
  });

  const index = markers.length;
  const infoWindow = new google.maps.InfoWindow({
    content: generateInfoContent(index, address, memo),
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });

  markers.push({ marker, infoWindow, memo });
  map.setCenter(location);
}

function generateInfoContent(index, address, memo) {
  return `
    <div>
      <p><strong>${address}</strong></p>
      <textarea id="memo-${index}" rows="3" style="width: 100%;">${memo}</textarea>
      <br />
      <button onclick="saveMemo(${index})">メモを保存</button>
      <button onclick="deleteMarker(${index})">削除</button>
    </div>
  `;
}

function saveMemo(index) {
  const item = markers[index];
  const textarea = document.getElementById(`memo-${index}`);
  if (item && textarea) {
    item.memo = textarea.value;
    item.infoWindow.setContent(generateInfoContent(index, item.marker.getTitle(), item.memo));
  }
}

function deleteMarker(index) {
  const item = markers[index];
  if (item) {
    item.marker.setMap(null);
    item.infoWindow.close();
  }
}

