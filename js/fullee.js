/**
 * fullee.js（フーリー）
 */
var $anime = $('#anime')
var touchPoint = {}
var movePoint = {}
var directionY = false
var mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';

/**
 * タッチした位置を取得
 * @param {*} e 
 */
function getTouchPosition (e) {
    return {
        'x': Math.floor(e.originalEvent ? e.originalEvent.touches[0].pageX : e.touches[0].screenX),
        'y': Math.floor(e.originalEvent ? e.originalEvent.touches[0].pageY : e.touches[0].screenY)
    }
}

var data = {
    $scene: {},
    currentIndex: 0,
    activeClass: 'active',
    isTransition: false,
    animate: {
        type: 'default',
        beforeOptions: null,
        beforeCallback: function () {},
        afterOptions: null,
        afterCallback: function () {},
    }
}

var methods = {
    /**
     * 初期化
     */
    init: function () {
        this.$scene = document.getElementsByClassName('scene')
        if (this.getCurrentIndex() == -1) {
            this.currentIndex = 0
        }
        this.initEvent()
    },

    /**
     * 現在表示中のシーンのindexを返す
     */
    getCurrentIndex: function () {
        var _this = this
        var index = -1
        Array.prototype.some.call(this.$scene, function (e, i) {
            if (e.classList.contains(_this.activeClass)) {
                index = i
                return true
            }
        })
        return index
    },

    /**
     * 移動先の存在を確認し、存在しないシーンを選択しないように丸める
     */
    getNextScene: function (index) {
        if (index < 0) {
            return 0
        } else if (index >= this.$scene.length) {
            return this.$scene.length-1
        } else {
            return index
        }
    },

    /**
     * 表示するシーンを変更
     */
    setScene: function (nextIndex) {
        var _this = this
        if (this.isTransition) {
            return false
        }

        this.isTransition = true
        
        // アニメーションが終わったらcurrentを変更
        this.beforeAnime(function () {
            _this.currentIndex = nextIndex
        })
    },

    /**
     * 画面遷移の発火処理
     * @param {*} index 
     */
    goToScene: function (index) {
        var current = this.currentIndex
        var next = this.getNextScene(index)
        if (current != next) {
            this.setAnimeType(current, next)
            this.setScene(next)
        }
    },

    /**
     * 次の画面へ
     */
    goToNextScene: function () {
        this.goToScene(this.currentIndex+1)
    },

    /**
     * 前の画面へ
     */
    goToPrevScene: function () {
        this.goToScene(this.currentIndex-1)
    },

    // ------------------------------------------------------------

    /**
     * イベントの設定
     */
    initEvent: function () {
        var _this = this
        document.addEventListener('keydown', function (e) { _this.keyHandle(e) })
        document.body.addEventListener('touchstart', function (e) { _this.touchStartHandle(e) }, { passive: false })
        document.body.addEventListener('touchmove', function (e) { _this.touchMoveHandle(e) }, { passive: false })
        document.body.addEventListener('touchend', function (e) { _this.touchEndHandle(e) }, { passive: false })
        document.addEventListener(mousewheelevent, function (e) { _this.wheelHandle(e) }, { passive: false })
    },

    /**
     * キーバインドの処理
     */
    keyHandle: function (e) {
        if (e.keyCode == 38) {
            console.log('keydown: up')
            this.goToPrevScene()
        } else if (e.keyCode == 40) {
            console.log('keydown: down')
            this.goToNextScene()
        }
    },

    /**
     * タッチスタートの処理
     */
    touchStartHandle: function (e) {
        var pos = getTouchPosition(e)
        touchPoint.y = pos.y
    },

    /**
     * タッチムーブの処理
     */
    touchMoveHandle: function (e) {
        var pos = getTouchPosition(e)
        movePoint.y = pos.y - touchPoint.y
        directionY = movePoint.y < 0
    },

    /**
     * タッチエンドの処理
     */
    touchEndHandle: function (e) {
        var offset = 50
        if (movePoint.y > offset || movePoint.y < -offset) {
            if (directionY) {
                console.log('swipe: down')
                this.goToNextScene()
            } else {
                console.log('swipe: up')
                this.goToPrevScene()
            }
        }
    },

    /**
     * ホイールの処理
     */
    wheelHandle: function (e) {
        e.preventDefault();
        var delta = e.deltaY ? -(e.deltaY) : e.wheelDelta ? e.wheelDelta : -(e.detail);
        var offset = 50
        if (delta < -offset) {
            console.log('wheel: down')
            this.goToNextScene()
        } else if (delta > offset) {
            console.log('wheel: up')
            this.goToPrevScene()
        }
    },

    // ------------------------------------------------------------

    /**
     * アニメーションのセット
     */
    setAnimeType: function (currentIndex, nextIndex) {
        if (currentIndex == 0) {
            // KVからの遷移
            this.animate.type = 'default'
        } else if (currentIndex == 1) {
            this.animate.type = 'wave'
        } else if (currentIndex == 2) {
            this.animate.type = 'slideRight'
        } else {
            this.animate.type = 'slideLeft'
        }
    },

    /**
     * アニメーションの設定を反映
     */
    setAnime: function () {
        $anime.append($(fulleeAnime[this.animate.type].template))
        this.animate.beforeOptions = fulleeAnime[this.animate.type].before
        this.animate.beforeCallback = fulleeAnime[this.animate.type].beforeCallback
        this.animate.afterOptions = fulleeAnime[this.animate.type].after
        this.animate.afterCallback = fulleeAnime[this.animate.type].afterCallback
    },

    /**
     * アニメーションの前半
     */
    beforeAnime: function (callback) {
        var _this = this
        return new Promise(function (resolve) {
            console.log('beforeAnime')

            // アニメーションをセット
            _this.setAnime()
            if (typeof _this.animate.beforeCallback == 'function') _this.animate.beforeCallback()
            _this.animate.beforeOptions.complete = function () {
                if (typeof callback === 'function') {
                    callback()
                }
                resolve()
            }

            anime(_this.animate.beforeOptions)
        })
    },

    /**
     * アニメーションの後半
     */
    afterAnime: function (callback) {
        var _this = this
        return new Promise(function (resolve) {
            console.log('afterAnime')

            // アニメーションをセット
            _this.animate.afterOptions.complete = function () {
                if (typeof callback === 'function') {
                    callback()
                }
                resolve()
            }

            anime(_this.animate.afterOptions)
        })
    },
}

var fullee = new Vue({
    el: "#fullee",
    data: data,
    methods: methods,
    beforeCreate: function () {
        console.log('beforeCreate; 「インスタンスが生成され、データが初期化される前」に動く処理')
    },

    /**
     * DOMにマウントされる前なのでDOMの操作はできない
     * WebAPIと通信したりするのはこのタイミング
     */
    created: function () {
        console.log('created: 「インスタンスが生成され、データが初期化された後」に動く処理')
    },
    beforeMount: function () {
        console.log('beforeMount: 「インスタンスがDOM要素にマウントされる前」に動く処理')
    },

    /**
     * DOMにマウントされた後なのでDOMにアクセスできるのでイベントリスナーの登録はここでやる
     */
    mounted: function () {
        console.log('mounted: 「インスタンスがDOM要素にマウントされた後」に動く処理')
        this.init()
    },
    beforeUpdate: function () {
        console.log('beforeUpdate: 「データが変更され、DOMに適用される前」に動く処理')
    },
    updated: function () {
        console.log('updated: 「データが変更され、DOMに適用された後」に動く処理')
        var _this = this
        this.afterAnime(function () {
            _this.isTransition = false
            $anime.html('')
            if (typeof _this.animate.afterCallback == 'function') _this.animate.afterCallback()
        })
    },

    /**
     * イベントリスナーの破棄、タイマーの解除などの後始末はここでやる
     */
    beforeDestroy: function () {
        console.log('beforeDestroy: 「Vueインスタンスが破棄される前」に動く処理')
    },
    destroyed: function () {
        console.log('destroyed: 「Vueインスタンスが破棄された後」に動く処理')
    },
})