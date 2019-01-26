const ROOM_API_URI = "http://127.0.0.1:3000"

var app = new Vue({
    el: '#app',
    data: {
        scanner: null,
        activeCameraId: null,
        cameras: [],
        scans: [],
        roomId: 0,
        newUserId: "",
    },
    mounted: function () {
        var self = this;
        // Query param
        var r_id = self.getQueryParam("room_id")
        if (r_id) {
            self.roomId = r_id
        }

        // Scanner Initialize
        self.scanner = new Instascan.Scanner({ video: document.getElementById('preview'), scanPeriod: 5 });
        self.scanner.addListener('scan', function (content, image) {
            self.newUserId = content
            self.scans.unshift({ date: +(Date.now()), content: content });
        });
        Instascan.Camera.getCameras().then(function (cameras) {
            self.cameras = cameras;
            if (cameras.length > 0) {
                self.activeCameraId = cameras[0].id;
                self.scanner.start(cameras[0]);
            } else {
                console.error('No cameras found.');
            }
        }).catch(function (e) {
            console.error(e);
        });
    },
    methods: {
        formatName: function (name) {
            return name || '(unknown)';
        },
        selectCamera: function (camera) {
            this.activeCameraId = camera.id;
            this.scanner.start(camera);
        },
        getQueryParam: function(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },
    },
    watch: {
        "newUserId": function(newValue, oldValue) {
            console.log(newValue)
            axios.get(ROOM_API_URI + "/room/" + this.roomId + "/auth/" + this.newUserId)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    }
});


