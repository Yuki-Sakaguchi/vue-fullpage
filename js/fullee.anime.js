/**
 * fullee.js用のアニメーション定義
 */
var fulleeAnime = {
    default: {
        template: '<div class="circle"></div>',
        before: {
            targets: '.circle',
            scale: [0, 250],
            duration: 600,
            easing: 'easeInCubic',
        },
        after: {
            targets: '.circle',
            scale: [250, 0],
            duration: 600,
            easing: 'easeOutCubic',
        },
    },
    slideRight: {
        template: '<div class="slide"></div>',
        before: {
            targets: '.slide',
            translateX: ['-100%', '0%'],
            duration: 500,
            easing: 'easeInCubic',
        },
        after: {
            targets: '.slide',
            translateX: ['0%', '100%'],
            duration: 500,
            easing: 'easeInCubic',
        },
    },
    slideLeft: {
        template: '<div class="slide slide--pink"></div>',
        before: {
            targets: '.slide',
            translateX: ['100%', '0%'],
            duration: 500,
            easing: 'easeInCubic',
        },
        after: {
            targets: '.slide',
            translateX: ['0%', '-100%'],
            duration: 500,
            easing: 'easeInCubic',
        },
    },
    wave: {
        template: '<canvas id="sineCanvas" class="wave"></canvas>' + 
                  '<p class="pickup">' + 
                    '<span>P</span>' +
                    '<span>I</span>' +
                    '<span>C</span>' +
                    '<span>K</span>' +
                    '<span> </span>' +
                    '<span>U</span>' +
                    '<span>P</span>' +
                  '</p>'
        ,
        before: {
            targets: '.wave',
            translateY: ['100%', '0%'],
            duration: 1200,
            easing: 'easeInCubic',
        },
        after: {
            targets: '.wave',
            translateY: ['0%', '-100%'],
            duration: 1800,
            easing: 'easeInCubic',
        },
        beforeCallback: function () {
            console.log('wave before')
            var unit = 100,
                canvas, context,
                height, width, xAxis, yAxis,
                draw,
                seconds = 0,
                t = 0;
            
            /**
             * 初期化
             */
            function init () {
                canvas = document.getElementById("sineCanvas");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                context = canvas.getContext("2d");
                height = canvas.height;
                width = canvas.width;
                xAxis = 100;
                yAxis = 0;
                xAxis2 = canvas.width;
                yAxis2 = canvas.height;
                draw();
            }
            
            /**
             * 描画
             */
            function draw () {
                // キャンバスの描画をクリア
                context.clearRect(0, 0, width, height);
                
                // 波を描画
                drawWave("rgb(217, 199, 137)", 1, 3, 0); // '#10c2cd'
                
                // Update the time and draw again
                seconds += 0.009;
                t = seconds * Math.PI;

                setTimeout(draw, 35);
            }
            
            /**
            * 波を描画
            * drawWave(色, 不透明度, 波の幅のzoom, 波の開始位置の遅れ)
            */
            function drawWave(color, alpha, zoom, delay) {
                var grad  = context.createLinearGradient(0, 0, width, height);
                grad.addColorStop(0, "rgb(217, 199, 137)");
                grad.addColorStop(1, "rgb(30, 170, 229)");
                context.fillStyle = grad;

                // context.fillStyle = color;
                context.globalAlpha = alpha;
            
                context.beginPath(); // パスの開始
                drawSine(t/0.5, zoom, delay); // 左上から右上へ
                // context.lineTo(width+10, height); // 右下へ
                // context.lineTo(0, height); // 左下へ
                drawSineBotton(t/0.5, zoom, delay); // 右下から左下へ
                context.closePath() // パスを閉じる
                context.fill(); // 塗りつぶす
            }
            
            /**
             * 波を描画
             */
            function drawSine(t, zoom, delay) {
                var x = t; // 時間を横の位置とする
                var y = Math.sin(x) / zoom;
                // console.log('drawSine', x, y)
                context.moveTo(yAxis, unit*y+xAxis); // スタート位置にパスを置く
                // Loop to draw segments (横幅の分、波を描画)
                for (var i = yAxis; i <= width + 10; i += 10) {
                    x = t+(-yAxis+i)/unit/zoom;
                    y = Math.sin(x - delay)/3;
                    context.lineTo(i, unit*y+xAxis);
                }
            }

            function drawSineBotton(t, zoom, delay) {
                var x = t; // 時間を横の位置とする
                var y = Math.sin(x) / zoom;
                // console.log('drawSine', x, y)
                // scontext.moveTo(width - yAxis,  height - (unit*y+xAxis)); // スタート位置にパスを置く
                // Loop to draw segments (横幅の分、波を描画)
                for (var i = yAxis; i <= width + 10; i += 10) {
                    x = t+(-yAxis+i)/unit/zoom;
                    y = Math.sin(x - delay)/3;
                    context.lineTo(width - i, height - (unit*y+xAxis));
                }
            }

            $('.pickup span').each(function (i, e) {
                var addDelay = 20 * i;
                anime({
                    targets: e,
                    opacity: [0, 1, 0],
                    translateY: [0, -30, 0],
                    easing: 'easeOutCubic',
                    duration: 1400,
                    delay: 750 + addDelay,
                })
            })

            init();
        },
        afterCallback: function () {
            console.log('wave after')
        }
    }
}