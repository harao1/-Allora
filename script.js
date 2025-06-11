let map;
let markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 35.6895, lng: 139.6917 },
        zoom: 12
    });

    showCurrentLocation();

    map.addListener("dblclick", function (e) {
        const latLng = e.latLng;
        const address = `指定位置（${latLng.lat().toFixed(5)}, ${latLng.lng().toFixed(5)}）`;
        placeMarker(latLng, address);
    });
    
    const input = document.getElementById("address-input");

    // エンターで住所検索
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const address = input.value;
            const geocoder = new google.maps.Geocoder();

            geocoder.geocode({ address: address }, function (results, status) {
                if (status === "OK") {
                    const location = results[0].geometry.location;
                    placeMarker(location, address);
                } else {
                    alert("住所が見つかりませんでした: " + status);
                }
            });
        }
    });
    addCurrentLocationButton(map);
}

function addCurrentLocationButton(map) {
    const controlDiv = document.createElement("div");
    controlDiv.style.margin = "10px";

    // ボタンの中身（スタイルはあとで CSS で整える）
    controlDiv.innerHTML = `
        <div class="custom-current-btn" title="現在地を表示">
            📍
        </div>
    `;

    // ボタンがクリックされたときの処理
    controlDiv.addEventListener("click", showCurrentLocation);

    // 地図の右下に追加
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}

// ピンを追加する
function placeMarker(location, address) {
    const marker = new google.maps.Marker({
        map: map,
        position: location,
        title: address,
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div>
                <p><strong>${address}</strong></p>
                <button onclick="markDelivered(${markers.length})">配達完了</button>
                <button onclick="markAbsent(${markers.length})">不在</button>
            </div>
        `
    });

    marker.addListener("click", function () {
        infoWindow.open(map, marker);
    });

    markers.push({ marker, infoWindow });
    map.setCenter(location);
}

// 配達完了 → ピン削除
function markDelivered(index) {
    const m = markers[index];
    if (m) {
        m.marker.setMap(null);
        m.infoWindow.close();
    }
}

// 不在 → ピンをグレーに変更
function markAbsent(index) {
    const m = markers[index];
    if (m) {
        m.marker.setIcon("http://maps.google.com/mapfiles/ms/icons/gray-dot.png");
        m.infoWindow.close();
    }
}
let currentLocationMarker = null; // 現在地ピン用の変数

function showCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const currentPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };

            // 既存の現在地ピンを削除
            if (currentLocationMarker) {
                currentLocationMarker.setMap(null);
            }

            // 新しい現在地ピンを作成
            currentLocationMarker = new google.maps.Marker({
                position: currentPos,
                map,
                title: "現在地",
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            });

            const infoWindow = new google.maps.InfoWindow({ content: "<strong>現在地</strong>" });
            currentLocationMarker.addListener("click", () => infoWindow.open(map, currentLocationMarker));

            map.setCenter(currentPos);
            map.setZoom(15);
        }, () => {
            alert("位置情報の取得に失敗しました。ブラウザの設定を確認してください。");
        });
    } else {
        alert("このブラウザは位置情報をサポートしていません。");
    }
}
